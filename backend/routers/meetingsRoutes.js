const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { protect, allow } = require('../middleware/auth');
const { can } = require('../utils/permissions');
const { fail, validationFailed, parseId } = require('../utils/http');
const { today, isValidDate, isValidMeetingTime } = require('../utils/dates');

const MEETING_TYPES = ['regular', 'emergency', 'special'];
const ATTENDANCE_STATUSES = ['present', 'late', 'absent', 'excused'];
const RECENT_MEETINGS = 4;

const MEETING_COLUMNS = 'meeting_id, meeting_date, meeting_time, meeting_type, minutes, created_by';

function findMeeting(meetingId, accountId) {
    const meeting = db
        .prepare(`SELECT ${MEETING_COLUMNS} FROM meetings WHERE meeting_id = ? AND account_id = ?`)
        .get(meetingId, accountId);
    if (!meeting) {
        fail(404, 'Meeting not found.');
    }
    return meeting;
}

function checkFields(fields) {
    const { meeting_date, meeting_time, meeting_type } = fields ?? {};
    const problems = [];
    if (!isValidDate(meeting_date)) {
        problems.push('Meeting date must be a real date');
    }
    if (!isValidMeetingTime(meeting_time)) {
        problems.push('Meeting time must be a 24-hour time such as 16:00');
    }
    if (!MEETING_TYPES.includes(meeting_type)) {
        problems.push('Meeting type must be regular, emergency or special');
    }
    if (problems.length > 0) {
        validationFailed(problems);
    }
    return { meeting_date, meeting_time, meeting_type };
}

// ── Fines ─────────────────────────────────────────────────────────────────────
// (Declared before /:id routes so "fines" is never read as a meeting id.)

// POST /api/meetings/fines  { member_id, fine_amount, reason, meeting_id? }
// (admin, chairperson, secretary)
router.post('/fines', protect, allow('issueFine'), (req, res) => {
    const { member_id, meeting_id, fine_amount, reason } = req.body ?? {};
    const problems = [];
    if (!Number.isSafeInteger(member_id) || member_id <= 0) {
        problems.push('Member ID must be a whole number');
    }
    if (meeting_id != null && (!Number.isSafeInteger(meeting_id) || meeting_id <= 0)) {
        problems.push('Meeting ID must be a whole number');
    }
    if (typeof fine_amount !== 'number' || !Number.isFinite(fine_amount) || fine_amount <= 0) {
        problems.push('Fine amount must be more than 0');
    }
    const cleanReason = typeof reason === 'string' ? reason.trim() : '';
    if (cleanReason.length < 2) {
        problems.push('Reason is required');
    }
    if (problems.length > 0) {
        validationFailed(problems);
    }

    const accountId = req.user.account_id;
    const member = db
        .prepare('SELECT 1 FROM members WHERE member_id = ? AND account_id = ? AND is_active = 1')
        .get(member_id, accountId);
    if (!member) {
        fail(404, 'Member not found!');
    }
    if (meeting_id != null) {
        findMeeting(meeting_id, accountId);
    }

    const result = db.prepare(`
        INSERT INTO fines (account_id, meeting_id, member_id, fine_amount, reason, recorded_by)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(accountId, meeting_id ?? null, member_id, fine_amount, cleanReason, req.user.member_id);

    res.status(201).json({ message: 'Fine issued successfully.', fine_id: Number(result.lastInsertRowid) });
});

// PUT /api/meetings/fines/:id/pay  { paid_on? } (admin, treasurer)
router.put('/fines/:id/pay', protect, allow('markFinePaid'), (req, res) => {
    const fineId = parseId(req.params.id, 'fine ID');
    const paidOn = req.body?.paid_on ?? today();
    if (!isValidDate(paidOn)) {
        validationFailed(['Paid date must be a real date']);
    }

    const fine = db
        .prepare('SELECT is_paid FROM fines WHERE fine_id = ? AND account_id = ?')
        .get(fineId, req.user.account_id);
    if (!fine) {
        fail(404, 'Fine not found.');
    }
    if (fine.is_paid) {
        fail(409, 'Fine is already paid.');
    }

    db.prepare('UPDATE fines SET is_paid = 1, paid_on = ? WHERE fine_id = ?').run(paidOn, fineId);
    res.json({ message: 'Fine marked as paid.' });
});

// ── Meetings ──────────────────────────────────────────────────────────────────

// GET /api/meetings/attendance-summary: counts per member over meetings that
// were held and marked. Officers see everyone; a member sees themselves.
// (Declared before /:id so "attendance-summary" is not read as an id.)
router.get('/attendance-summary', protect, (req, res) => {
    const wholeGroup = can('viewGroupFigures', req.user.role);
    const accountId = req.user.account_id;

    const held = db.prepare(`
        SELECT m.meeting_id FROM meetings m
        WHERE m.account_id = ? AND m.meeting_date <= ?
          AND EXISTS (SELECT 1 FROM meeting_attendance a WHERE a.meeting_id = m.meeting_id)
        ORDER BY m.meeting_date DESC, m.meeting_id DESC
    `).all(accountId, today()).map((row) => row.meeting_id);
    const recent = held.slice(0, RECENT_MEETINGS);

    const marks = held.length === 0 ? [] : db.prepare(`
        SELECT meeting_id, member_id, status FROM meeting_attendance
        WHERE meeting_id IN (${held.map(() => '?').join(',')})
    `).all(...held);

    const members = db.prepare(`
        SELECT member_id, member_name FROM members
        WHERE account_id = ? AND is_active = 1 ${wholeGroup ? '' : 'AND member_id = ?'}
    `).all(accountId, ...(wholeGroup ? [] : [req.user.member_id]));

    const rows = members.map((member) => {
        const own = marks.filter((mark) => mark.member_id === member.member_id);
        const count = (status) => own.filter((mark) => mark.status === status).length;
        return {
            member_id: member.member_id,
            member_name: member.member_name,
            present: count('present'),
            late: count('late'),
            absent: count('absent'),
            excused: count('excused'),
            recent_absent: own.filter(
                (mark) => mark.status === 'absent' && recent.includes(mark.meeting_id)
            ).length,
        };
    });

    rows.sort(
        (a, b) =>
            b.recent_absent - a.recent_absent ||
            b.absent - a.absent ||
            a.member_name.localeCompare(b.member_name)
    );
    res.json(rows);
});

// GET /api/meetings: newest first, each with how many were marked and came,
// and the caller's own status.
router.get('/', protect, (req, res) => {
    const rows = db.prepare(`
        SELECT ${MEETING_COLUMNS},
            (SELECT COUNT(*) FROM meeting_attendance a WHERE a.meeting_id = meetings.meeting_id) AS marked,
            (SELECT COUNT(*) FROM meeting_attendance a
                WHERE a.meeting_id = meetings.meeting_id AND a.status IN ('present', 'late')) AS attended,
            (SELECT a.status FROM meeting_attendance a
                WHERE a.meeting_id = meetings.meeting_id AND a.member_id = ?) AS my_status
        FROM meetings
        WHERE account_id = ?
        ORDER BY meeting_date DESC, meeting_id DESC
    `).all(req.user.member_id, req.user.account_id);
    res.json(rows);
});

// POST /api/meetings (admin, chairperson, secretary)
router.post('/', protect, allow('manageMeetings'), (req, res) => {
    const fields = checkFields(req.body);
    const result = db.prepare(`
        INSERT INTO meetings (account_id, meeting_date, meeting_time, meeting_type, created_by)
        VALUES (?, ?, ?, ?, ?)
    `).run(req.user.account_id, fields.meeting_date, fields.meeting_time, fields.meeting_type, req.user.member_id);

    res.status(201).json({
        message: 'Meeting created successfully',
        meeting_id: Number(result.lastInsertRowid),
    });
});

function attendanceOf(meetingId, user) {
    const wholeGroup = can('viewGroupFigures', user.role);
    return db.prepare(`
        SELECT a.member_id, m.member_name, a.status
        FROM meeting_attendance a JOIN members m ON m.member_id = a.member_id
        WHERE a.meeting_id = ? ${wholeGroup ? '' : 'AND a.member_id = ?'}
        ORDER BY m.member_name
    `).all(meetingId, ...(wholeGroup ? [] : [user.member_id]));
}

// GET /api/meetings/:id: the meeting and its attendance (a member sees only
// their own entry).
router.get('/:id', protect, (req, res) => {
    const meeting = findMeeting(parseId(req.params.id, 'meeting ID'), req.user.account_id);
    res.json({ meeting, attendance: attendanceOf(meeting.meeting_id, req.user) });
});

// PUT /api/meetings/:id: change the date, time or type.
router.put('/:id', protect, allow('manageMeetings'), (req, res) => {
    const meeting = findMeeting(parseId(req.params.id, 'meeting ID'), req.user.account_id);
    const fields = checkFields(req.body);
    db.prepare('UPDATE meetings SET meeting_date = ?, meeting_time = ?, meeting_type = ? WHERE meeting_id = ?')
        .run(fields.meeting_date, fields.meeting_time, fields.meeting_type, meeting.meeting_id);
    res.json({ message: 'Meeting updated successfully', meeting_id: meeting.meeting_id });
});

// PUT /api/meetings/:id/minutes
router.put('/:id/minutes', protect, allow('manageMeetings'), (req, res) => {
    const meeting = findMeeting(parseId(req.params.id, 'meeting ID'), req.user.account_id);
    const minutes = typeof req.body?.minutes === 'string' ? req.body.minutes.trim() : '';
    if (!minutes) {
        fail(400, 'Minutes content is required.');
    }
    db.prepare('UPDATE meetings SET minutes = ? WHERE meeting_id = ?').run(minutes, meeting.meeting_id);
    res.json({ message: 'Minutes saved successfully.' });
});

// Writes attendance for a list of members in one go. A second save for the
// same member replaces the first, so a mistake can be corrected.
function saveAttendance(meeting, records, user) {
    if (meeting.meeting_date > today()) {
        fail(409, 'Attendance can only be taken on or after the meeting day.');
    }
    if (!Array.isArray(records) || records.length === 0) {
        validationFailed(['Mark at least one member']);
    }
    for (const record of records) {
        if (!ATTENDANCE_STATUSES.includes(record?.status)) {
            validationFailed(['Status must be present, late, absent or excused']);
        }
        const member = Number.isSafeInteger(record.member_id)
            ? db.prepare('SELECT 1 FROM members WHERE member_id = ? AND account_id = ? AND is_active = 1')
                .get(record.member_id, user.account_id)
            : null;
        if (!member) {
            fail(404, 'Member not found!');
        }
    }

    const upsert = db.prepare(`
        INSERT INTO meeting_attendance (meeting_id, member_id, status, marked_by)
        VALUES (?, ?, ?, ?)
        ON CONFLICT (meeting_id, member_id)
        DO UPDATE SET status = excluded.status, marked_by = excluded.marked_by
    `);
    db.transaction(() => {
        for (const record of records) {
            upsert.run(meeting.meeting_id, record.member_id, record.status, user.member_id);
        }
    })();
    return records.length;
}

// PUT /api/meetings/:id/attendance  { records: [{ member_id, status }] }
router.put('/:id/attendance', protect, allow('manageMeetings'), (req, res) => {
    const meeting = findMeeting(parseId(req.params.id, 'meeting ID'), req.user.account_id);
    const saved = saveAttendance(meeting, req.body?.records, req.user);
    res.json({ message: 'Attendance saved successfully.', saved });
});

// POST /api/meetings/:id/attendance  { member_id, status }: one member (kept
// for the first version of the frontend; it does the same upsert).
router.post('/:id/attendance', protect, allow('manageMeetings'), (req, res) => {
    const meeting = findMeeting(parseId(req.params.id, 'meeting ID'), req.user.account_id);
    const { member_id, status } = req.body ?? {};
    saveAttendance(meeting, [{ member_id, status }], req.user);
    res.status(201).json({ message: 'Attendance marked successfully.' });
});

// GET /api/meetings/:id/attendance
router.get('/:id/attendance', protect, (req, res) => {
    const meeting = findMeeting(parseId(req.params.id, 'meeting ID'), req.user.account_id);
    res.json(attendanceOf(meeting.meeting_id, req.user));
});

module.exports = router;
