const express = require('express');
const router = express.Router();
const db = require('../config/database');
const crypto = require('crypto');
const { protect, adminsOnly } = require('../middleware/auth');
const { today, isValidDate } = require('../utils/dates');

// ═════════════════════════════════════════════════════════════════════════════
// USSD FLOW (Africa's Talking)
//
// Africa's Talking sends every input of the session joined with '*', e.g.
//   ""              → first dial
//   "2"             → chose Kinyarwanda
//   "2*1234"        → entered PIN
//   "2*1234*1"      → chose menu option 1
//   "2*1234*1*0788100006*5000" → sub-inputs of that option
//
// So textArray[0] = language, [1] = PIN, [2] = menu choice, [3+] = inputs.
// Responses starting with "CON" keep the session open, "END" closes it.
// ═════════════════════════════════════════════════════════════════════════════

// ── Translations ─────────────────────────────────────────────────────────────
// lang 'en' = English, 'rw' = Kinyarwanda.
// Functions are used where the message contains values.

const STRINGS = {
    en: {
        notRegistered: 'Your number is not registered.',
        inactive: 'Your account is no longer active.\nContact your group admin.',
        enterPin: (name) => `Hello ${name},\nEnter your 4-digit PIN:`,
        noPin: 'No PIN set. Contact your admin.',
        wrongPin: 'Incorrect PIN.\nAccess denied.',
        locked: 'Too many wrong PINs.\nTry again in 15 minutes.',
        invalidOption: 'Invalid option.\nDial again.',
        error: 'Service error. Please try again.',

        memberMenu: 'Main Menu:\n1. Check Balance\n2. Check Loan\n3. Fines\n4. Next Meeting',
        secretaryMenu: 'Secretary Menu:\n1. Mark Attendance\n2. Check Savings',
        treasurerMenu: 'Treasurer Menu:\n1. Record Saving\n2. Check Savings',
        chairpersonMenu: 'Chairperson Menu:\n1. Verify Pending Savings\n2. Approve Loans\n3. Group Totals',

        balance: (verified, pending) =>
            `Your savings: ${verified} RWF\nPending verification: ${pending} RWF`,
        noLoan: 'You have no active loan.',
        loan: (amount, status) => `Your loan: ${amount} RWF\nStatus: ${status}`,
        loanStatus: { requested: 'Requested', approved: 'Approved', disbursed: 'Disbursed' },
        noFines: 'You have no unpaid fines.',
        fines: (total, count) => `Unpaid fines: ${total} RWF\n(${count} fine(s))`,
        noMeeting: 'No upcoming meetings scheduled.',
        meeting: (date, time) => `Next Meeting:\nDate: ${date}\nTime: ${time}`,

        enterMemberPhone: 'Enter member phone number:',
        memberNotFound: 'Member not found.',
        enterAmount: (name) => `Member: ${name}\nEnter amount (RWF):`,
        invalidAmount: 'Invalid amount.',
        noActiveCycle: 'No active cycle. Contact admin.',
        savingRecorded: (amount, name) =>
            `${amount} RWF recorded for ${name}.\nAwaiting chairperson verification.`,
        memberSavings: (name, verified, pending) =>
            `${name}\nSavings: ${verified} RWF\nPending: ${pending} RWF`,

        noMeetingToMark: 'No meeting found to mark attendance for.',
        attendanceOptions: (name, date) =>
            `Member: ${name}\nMeeting: ${date}\n1. Present\n2. Late\n3. Absent`,
        attendanceStatus: { present: 'Present', late: 'Late', absent: 'Absent' },
        attendanceSaved: (name, status) => `Attendance saved:\n${name} - ${status}`,

        noPendingSavings: 'No pending savings.',
        pendingSaving: (name, amount, date) =>
            `Pending: ${name} - ${amount} RWF\nDate: ${date}\n1. Verify\n2. Reject`,
        savingVerified: (name, amount) => `Verified: ${name} - ${amount} RWF`,
        savingRejected: (name, amount) => `Rejected: ${name} - ${amount} RWF`,

        noPendingLoans: 'No loan requests.',
        pendingLoan: (name, amount) => `Loan request:\n${name} - ${amount} RWF\n1. Approve\n2. Reject`,
        loanApproved: (name, amount) => `Loan approved:\n${name} - ${amount} RWF`,
        loanRejected: (name, amount) => `Loan rejected:\n${name} - ${amount} RWF`,
        alreadyHandled: 'This record was already handled.\nDial again.',

        groupTotals: (members, savings, loans, fines) =>
            `Group Totals:\nMembers: ${members}\nSavings: ${savings} RWF\nLoans out: ${loans} RWF\nUnpaid fines: ${fines} RWF`,
    },

    rw: {
        notRegistered: 'Nimero yawe ntiyanditswe.',
        inactive: 'Konti yawe ntigikora.\nVugana n\'umuyobozi w\'itsinda.',
        enterPin: (name) => `Muraho ${name},\nShyiramo PIN yawe y'imibare 4:`,
        noPin: 'Nta PIN ufite. Vugana n\'umuyobozi.',
        wrongPin: 'PIN siyo.\nNtiwemerewe kwinjira.',
        locked: 'Wibeshye PIN inshuro nyinshi.\nOngera ugerageze nyuma y\'iminota 15.',
        invalidOption: 'Ibyo wahisemo sibyo.\nOngera uhamagare.',
        error: 'Habaye ikibazo. Ongera ugerageze.',

        memberMenu: 'Ahabanza:\n1. Reba ubwizigame\n2. Reba inguzanyo\n3. Ibihano\n4. Inama itaha',
        secretaryMenu: 'Umunyamabanga:\n1. Andika ubwitabire\n2. Reba ubwizigame',
        treasurerMenu: 'Umubitsi:\n1. Andika ubwizigame\n2. Reba ubwizigame',
        chairpersonMenu: 'Perezida:\n1. Emeza ubwizigame butegereje\n2. Emeza inguzanyo\n3. Igiteranyo cy\'itsinda',

        balance: (verified, pending) =>
            `Ubwizigame bwawe: ${verified} RWF\nButegereje kwemezwa: ${pending} RWF`,
        noLoan: 'Nta nguzanyo ufite.',
        loan: (amount, status) => `Inguzanyo yawe: ${amount} RWF\nUko ihagaze: ${status}`,
        loanStatus: { requested: 'Yasabwe', approved: 'Yemejwe', disbursed: 'Yatanzwe' },
        noFines: 'Nta bihano bitishyuwe ufite.',
        fines: (total, count) => `Ibihano bitishyuwe: ${total} RWF\n(${count})`,
        noMeeting: 'Nta nama iteganyijwe.',
        meeting: (date, time) => `Inama itaha:\nItariki: ${date}\nIsaha: ${time}`,

        enterMemberPhone: 'Shyiramo nimero ya telefone y\'umunyamuryango:',
        memberNotFound: 'Umunyamuryango ntabonetse.',
        enterAmount: (name) => `Umunyamuryango: ${name}\nShyiramo amafaranga (RWF):`,
        invalidAmount: 'Amafaranga yanditse nabi.',
        noActiveCycle: 'Nta cycle iri gukora. Vugana n\'umuyobozi.',
        savingRecorded: (amount, name) =>
            `${amount} RWF ya ${name} yanditswe.\nArategereje kwemezwa na Perezida.`,
        memberSavings: (name, verified, pending) =>
            `${name}\nUbwizigame: ${verified} RWF\nButegereje: ${pending} RWF`,

        noMeetingToMark: 'Nta nama ibonetse yo kwandikamo ubwitabire.',
        attendanceOptions: (name, date) =>
            `Umunyamuryango: ${name}\nInama: ${date}\n1. Yaje\n2. Yakererewe\n3. Ntiyaje`,
        attendanceStatus: { present: 'Yaje', late: 'Yakererewe', absent: 'Ntiyaje' },
        attendanceSaved: (name, status) => `Ubwitabire bwanditswe:\n${name} - ${status}`,

        noPendingSavings: 'Nta bwizigame butegereje.',
        pendingSaving: (name, amount, date) =>
            `Butegereje: ${name} - ${amount} RWF\nItariki: ${date}\n1. Emeza\n2. Wanga`,
        savingVerified: (name, amount) => `Byemejwe: ${name} - ${amount} RWF`,
        savingRejected: (name, amount) => `Byanzwe: ${name} - ${amount} RWF`,

        noPendingLoans: 'Nta nguzanyo isabwa.',
        pendingLoan: (name, amount) => `Inguzanyo isabwa:\n${name} - ${amount} RWF\n1. Emeza\n2. Wanga`,
        loanApproved: (name, amount) => `Inguzanyo yemejwe:\n${name} - ${amount} RWF`,
        loanRejected: (name, amount) => `Inguzanyo yanzwe:\n${name} - ${amount} RWF`,
        alreadyHandled: 'Ibi byamaze gukorwa.\nOngera uhamagare.',

        groupTotals: (members, savings, loans, fines) =>
            `Igiteranyo cy'itsinda:\nAbanyamuryango: ${members}\nUbwizigame: ${savings} RWF\nInguzanyo zatanzwe: ${loans} RWF\nIbihano bitishyuwe: ${fines} RWF`,
    },
};

// Shown before a language is chosen, so it is in both languages.
const LANGUAGE_MENU =
    'CON Welcome to Itsinda Ryacu\nMurakaza neza\n1. English\n2. Kinyarwanda';

// ── Helpers ──────────────────────────────────────────────────────────────────

// ── Wrong-PIN lockout ────────────────────────────────────────────────────────
// After MAX_PIN_TRIES wrong PINs a number is blocked for LOCK_MINUTES, so a
// 4-digit PIN cannot be guessed by trying all 10,000. Kept in memory: a
// server restart clears it, which is fine for this purpose.
const MAX_PIN_TRIES = 3;
const LOCK_MINUTES = 15;
const pinFailures = new Map(); // phone → { count, lockedUntil }

function isLocked(phone) {
    const entry = pinFailures.get(phone);
    if (!entry || !entry.lockedUntil) return false;
    if (Date.now() < entry.lockedUntil) return true;
    pinFailures.delete(phone); // lock has expired
    return false;
}

function recordWrongPin(phone) {
    const entry = pinFailures.get(phone) ?? { count: 0, lockedUntil: null };
    entry.count += 1;
    if (entry.count >= MAX_PIN_TRIES) {
        entry.lockedUntil = Date.now() + LOCK_MINUTES * 60 * 1000;
    }
    pinFailures.set(phone, entry);
}

// ── Only Africa's Talking may call /ussd ─────────────────────────────────────
// Set USSD_SECRET in .env and put the same value in the callback URL on
// Africa's Talking, e.g. https://<your-ngrok>/ussd?key=<USSD_SECRET>.
// If USSD_SECRET is not set the check is skipped (local testing only).
function checkUssdKey(req, res, next) {
    const secret = process.env.USSD_SECRET;
    if (!secret) return next();
    const given = String(req.query.key ?? '');
    const ok = given.length === secret.length &&
        crypto.timingSafeEqual(Buffer.from(given), Buffer.from(secret));
    if (!ok) return res.status(403).type('text/plain').send('END Access denied.');
    return next();
}
if (!process.env.USSD_SECRET) {
    console.warn('[USSD] USSD_SECRET is not set: /ussd accepts requests from anyone.');
}

function hashPin(pin) {
    return crypto.createHash('sha256').update(String(pin)).digest('hex');
}

// Officers type numbers like "0788100006"; the DB stores "+250788100006".
function normalizePhone(input) {
    const p = String(input).replace(/[\s-]/g, '');
    if (/^07\d{8}$/.test(p)) return '+250' + p.slice(1);
    if (/^2507\d{8}$/.test(p)) return '+' + p;
    return p;
}

function getMember(phone) {
    return db.prepare(
        `SELECT member_id, account_id, member_name, role, pin, is_active
         FROM members WHERE phone = ?`
    ).get(phone);
}

// Looks up another member, but only inside the caller's own group.
function getGroupMember(accountId, phoneInput) {
    const target = getMember(normalizePhone(phoneInput));
    if (!target || !target.is_active || target.account_id !== accountId) return null;
    return target;
}

function getActiveCycle(accountId) {
    return db.prepare(
        `SELECT cycle_id FROM cycles WHERE account_id = ? AND status = 'active' LIMIT 1`
    ).get(accountId);
}

function savingsTotals(memberId) {
    return db.prepare(
        `SELECT
            COALESCE(SUM(CASE WHEN status = 'verified' THEN amount END), 0) AS verified,
            COALESCE(SUM(CASE WHEN status = 'pending'  THEN amount END), 0) AS pending
         FROM savings WHERE member_id = ?`
    ).get(memberId);
}

function parseAmount(input) {
    const amount = Number(input);
    return Number.isFinite(amount) && amount > 0 ? amount : null;
}

// 'admin' has no menu of its own in this flow, so it gets the chairperson menu.
function menuRole(role) {
    return role === 'admin' ? 'chairperson' : role;
}

function mainMenu(role, s) {
    switch (menuRole(role)) {
        case 'secretary':   return s.secretaryMenu;
        case 'treasurer':   return s.treasurerMenu;
        case 'chairperson': return s.chairpersonMenu;
        default:            return s.memberMenu;
    }
}

// ── Role flows ───────────────────────────────────────────────────────────────
// Each returns the full response string ("CON ..." or "END ...").
// `choice` is the menu option, `inputs` are the answers typed after it.

function memberFlow(member, choice, inputs, s) {
    // 1. Check Balance
    if (choice === '1') {
        const t = savingsTotals(member.member_id);
        return `END ${s.balance(t.verified, t.pending)}`;
    }

    // 2. Check Loan — the most recent loan that is still open
    if (choice === '2') {
        const loan = db.prepare(
            `SELECT principal_amount, status FROM loans
             WHERE member_id = ? AND status IN ('requested', 'approved', 'disbursed')
             ORDER BY created_at DESC LIMIT 1`
        ).get(member.member_id);
        return loan
            ? `END ${s.loan(loan.principal_amount, s.loanStatus[loan.status])}`
            : `END ${s.noLoan}`;
    }

    // 3. Fines — unpaid only
    if (choice === '3') {
        const f = db.prepare(
            `SELECT COALESCE(SUM(fine_amount), 0) AS total, COUNT(*) AS count
             FROM fines WHERE member_id = ? AND is_paid = 0`
        ).get(member.member_id);
        return f.count ? `END ${s.fines(f.total, f.count)}` : `END ${s.noFines}`;
    }

    // 4. Next Meeting
    if (choice === '4') {
        const m = db.prepare(
            `SELECT meeting_date, meeting_time FROM meetings
             WHERE account_id = ? AND meeting_date >= ?
             ORDER BY meeting_date ASC, meeting_time ASC LIMIT 1`
        ).get(member.account_id, today());
        return m ? `END ${s.meeting(m.meeting_date, m.meeting_time)}` : `END ${s.noMeeting}`;
    }

    return `END ${s.invalidOption}`;
}

// "Check Savings" for secretary and treasurer: phone → that member's totals.
function checkSavingsFlow(officer, inputs, s) {
    if (inputs.length === 0) return `CON ${s.enterMemberPhone}`;

    const target = getGroupMember(officer.account_id, inputs[0]);
    if (!target) return `END ${s.memberNotFound}`;

    const t = savingsTotals(target.member_id);
    return `END ${s.memberSavings(target.member_name, t.verified, t.pending)}`;
}

function secretaryFlow(member, choice, inputs, s) {
    // 1. Mark Attendance: phone → status
    if (choice === '1') {
        if (inputs.length === 0) return `CON ${s.enterMemberPhone}`;

        const target = getGroupMember(member.account_id, inputs[0]);
        if (!target) return `END ${s.memberNotFound}`;

        // The group's latest meeting up to today (today's if there is one).
        // Future meetings are skipped, as in the meetings API.
        const meeting = db.prepare(
            `SELECT meeting_id, meeting_date FROM meetings
             WHERE account_id = ? AND meeting_date <= ?
             ORDER BY meeting_date DESC, meeting_id DESC LIMIT 1`
        ).get(member.account_id, today());
        if (!meeting) return `END ${s.noMeetingToMark}`;

        if (inputs.length === 1) {
            return `CON ${s.attendanceOptions(target.member_name, meeting.meeting_date)}`;
        }

        const status = { 1: 'present', 2: 'late', 3: 'absent' }[inputs[1]];
        if (!status) return `END ${s.invalidOption}`;

        // A member has one attendance row per meeting; marking again corrects it.
        db.prepare(
            `INSERT INTO meeting_attendance (meeting_id, member_id, status, marked_by)
             VALUES (?, ?, ?, ?)
             ON CONFLICT (meeting_id, member_id)
             DO UPDATE SET status = excluded.status, marked_by = excluded.marked_by`
        ).run(meeting.meeting_id, target.member_id, status, member.member_id);

        return `END ${s.attendanceSaved(target.member_name, s.attendanceStatus[status])}`;
    }

    // 2. Check Savings
    if (choice === '2') return checkSavingsFlow(member, inputs, s);

    return `END ${s.invalidOption}`;
}

function treasurerFlow(member, choice, inputs, s) {
    // 1. Record Saving: phone → amount → insert as 'pending'
    if (choice === '1') {
        if (inputs.length === 0) return `CON ${s.enterMemberPhone}`;

        const target = getGroupMember(member.account_id, inputs[0]);
        if (!target) return `END ${s.memberNotFound}`;

        if (inputs.length === 1) return `CON ${s.enterAmount(target.member_name)}`;

        const amount = parseAmount(inputs[1]);
        if (amount === null) return `END ${s.invalidAmount}`;

        const cycle = getActiveCycle(member.account_id);
        if (!cycle) return `END ${s.noActiveCycle}`;

        db.prepare(
            `INSERT INTO savings (cycle_id, member_id, amount, save_date, status, recorded_by)
             VALUES (?, ?, ?, ?, 'pending', ?)`
        ).run(cycle.cycle_id, target.member_id, amount, today(), member.member_id);

        return `END ${s.savingRecorded(amount, target.member_name)}`;
    }

    // 2. Check Savings
    if (choice === '2') return checkSavingsFlow(member, inputs, s);

    return `END ${s.invalidOption}`;
}

function chairpersonFlow(member, choice, inputs, s) {
    // 1. Verify Pending Savings: show one pending record → 1. Verify / 2. Reject
    if (choice === '1') {
        // Oldest pending first. The same record is looked up again when the
        // chairperson answers, so a saving recorded in between cannot take
        // its place (that could happen with "latest first").
        const saving = db.prepare(
            `SELECT s.saving_id, s.amount, s.save_date, m.member_name
             FROM savings s JOIN members m ON m.member_id = s.member_id
             WHERE m.account_id = ? AND s.status = 'pending'
             ORDER BY s.created_at ASC, s.saving_id ASC LIMIT 1`
        ).get(member.account_id);
        if (!saving) return `END ${s.noPendingSavings}`;

        if (inputs.length === 0) {
            return `CON ${s.pendingSaving(saving.member_name, saving.amount, saving.save_date)}`;
        }

        // 'reversed' is the schema's status for a rejected saving.
        const newStatus = { 1: 'verified', 2: 'reversed' }[inputs[0]];
        if (!newStatus) return `END ${s.invalidOption}`;

        const result = db.prepare(
            `UPDATE savings SET status = ?, verified_by = ?
             WHERE saving_id = ? AND status = 'pending'`
        ).run(newStatus, member.member_id, saving.saving_id);
        if (result.changes === 0) return `END ${s.alreadyHandled}`;

        return newStatus === 'verified'
            ? `END ${s.savingVerified(saving.member_name, saving.amount)}`
            : `END ${s.savingRejected(saving.member_name, saving.amount)}`;
    }

    // 2. Approve Loans: show one requested loan → 1. Approve / 2. Reject
    if (choice === '2') {
        const loan = db.prepare(
            `SELECT l.loan_id, l.principal_amount, m.member_name
             FROM loans l JOIN members m ON m.member_id = l.member_id
             WHERE m.account_id = ? AND l.status = 'requested'
             ORDER BY l.created_at ASC, l.loan_id ASC LIMIT 1`
        ).get(member.account_id);
        if (!loan) return `END ${s.noPendingLoans}`;

        if (inputs.length === 0) {
            return `CON ${s.pendingLoan(loan.member_name, loan.principal_amount)}`;
        }

        const newStatus = { 1: 'approved', 2: 'rejected' }[inputs[0]];
        if (!newStatus) return `END ${s.invalidOption}`;

        const result = db.prepare(
            // Same as the loans API: an approved loan gets today's issue date.
            `UPDATE loans SET status = ?, approved_by = ?,
                issue_date = CASE WHEN ? = 'approved' THEN ? ELSE issue_date END
             WHERE loan_id = ? AND status = 'requested'`
        ).run(newStatus, member.member_id, newStatus, today(), loan.loan_id);
        if (result.changes === 0) return `END ${s.alreadyHandled}`;

        return newStatus === 'approved'
            ? `END ${s.loanApproved(loan.member_name, loan.principal_amount)}`
            : `END ${s.loanRejected(loan.member_name, loan.principal_amount)}`;
    }

    // 3. Group Totals
    if (choice === '3') {
        const accountId = member.account_id;
        const members = db.prepare(
            `SELECT COUNT(*) AS n FROM members WHERE account_id = ? AND is_active = 1`
        ).get(accountId).n;
        const savings = db.prepare(
            `SELECT COALESCE(SUM(s.amount), 0) AS total
             FROM savings s JOIN members m ON m.member_id = s.member_id
             WHERE m.account_id = ? AND s.status = 'verified'`
        ).get(accountId).total;
        const loans = db.prepare(
            `SELECT COALESCE(SUM(l.principal_amount), 0) AS total
             FROM loans l JOIN members m ON m.member_id = l.member_id
             WHERE m.account_id = ? AND l.status IN ('approved', 'disbursed')`
        ).get(accountId).total;
        const fines = db.prepare(
            `SELECT COALESCE(SUM(fine_amount), 0) AS total
             FROM fines WHERE account_id = ? AND is_paid = 0`
        ).get(accountId).total;

        return `END ${s.groupTotals(members, savings, loans, fines)}`;
    }

    return `END ${s.invalidOption}`;
}

const ROLE_FLOWS = {
    member: memberFlow,
    secretary: secretaryFlow,
    treasurer: treasurerFlow,
    chairperson: chairpersonFlow,
};

// ── USSD Route ────────────────────────────────────────────────────────────────

router.post('/', checkUssdKey, (req, res) => {
    const { sessionId, phoneNumber, text = '' } = req.body || {};
    console.log('[USSD]', { sessionId, phoneNumber, text });

    const textArray = text === '' ? [] : text.split('*');
    let response;

    try {
        response = handleUssd(phoneNumber, textArray);
    } catch (err) {
        console.error('[USSD] ERROR:', err);
        const lang = textArray[0] === '2' ? 'rw' : 'en';
        response = `END ${STRINGS[lang].error}`;
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
});

function handleUssd(phoneNumber, textArray) {
    // ── Authentication: is this number a member? ──────────────────────────
    const member = getMember(phoneNumber);
    if (!member) {
        return `END ${STRINGS.en.notRegistered}\n${STRINGS.rw.notRegistered}`;
    }
    if (!member.is_active) {
        return `END ${STRINGS.en.inactive}\n${STRINGS.rw.inactive}`;
    }

    // ── Step 1: choose language ───────────────────────────────────────────
    if (textArray.length === 0) return LANGUAGE_MENU;

    const lang = { 1: 'en', 2: 'rw' }[textArray[0]];
    if (!lang) return `END ${STRINGS.en.invalidOption}`;
    const s = STRINGS[lang];

    // ── Step 2: ask for PIN ───────────────────────────────────────────────
    if (textArray.length === 1) return `CON ${s.enterPin(member.member_name)}`;

    // ── Step 3: verify PIN (again on every later step, since USSD is stateless)
    if (!member.pin) return `END ${s.noPin}`;
    if (isLocked(phoneNumber)) return `END ${s.locked}`;
    if (hashPin(textArray[1]) !== member.pin) {
        recordWrongPin(phoneNumber);
        return isLocked(phoneNumber) ? `END ${s.locked}` : `END ${s.wrongPin}`;
    }
    pinFailures.delete(phoneNumber); // correct PIN resets the count

    // ── Step 4: role-based main menu ──────────────────────────────────────
    if (textArray.length === 2) return `CON ${mainMenu(member.role, s)}`;

    // ── Step 5+: the chosen option and its inputs ─────────────────────────
    const choice = textArray[2];
    const inputs = textArray.slice(3);
    const flow = ROLE_FLOWS[menuRole(member.role)];
    return flow(member, choice, inputs, s);
}

// ── Offline Sync Endpoint ─────────────────────────────────────────────────────
// Admins only. Handles queued items from members of the admin's own group;
// items from other groups are left for their own admin.
router.post('/sync', protect, adminsOnly, (req, res) => {
    try {
        const pending = db.prepare(`SELECT * FROM sync_queue WHERE status = 'pending'`).all();
        let synced = 0, failed = 0, skipped = 0;

        const markFailed = (item, why) => {
            console.warn('[USSD sync] item', item.queue_id, 'failed:', why);
            db.prepare(`UPDATE sync_queue SET status='failed' WHERE queue_id=?`).run(item.queue_id);
            failed++;
        };

        for (const item of pending) {
            try {
                const member = getMember(item.phone);
                if (member && member.account_id !== req.user.account_id) {
                    skipped++; // another group's item
                    continue;
                }
                if (!member || !member.is_active) {
                    markFailed(item, 'phone is not an active member');
                    continue;
                }

                const payload = JSON.parse(item.payload);
                const amount = parseAmount(payload.amount);
                if (amount === null) {
                    markFailed(item, 'invalid amount');
                    continue;
                }
                // Always use the group's current cycle, never a cycle_id from the payload.
                const cycle = db.prepare(
                    `SELECT cycle_id, end_date, default_interest_rate FROM cycles
                     WHERE account_id = ? AND status = 'active' LIMIT 1`
                ).get(member.account_id);
                if (!cycle) {
                    markFailed(item, 'no active cycle');
                    continue;
                }

                if (item.action === 'SAVE') {
                    // Saved as 'pending' so the chairperson still verifies it.
                    db.prepare(
                        `INSERT INTO savings (cycle_id, member_id, amount, save_date, status, recorded_by)
                         VALUES (?, ?, ?, ?, 'pending', ?)`
                    ).run(cycle.cycle_id, member.member_id, amount, today(), member.member_id);
                } else if (item.action === 'LOAN_REQUEST') {
                    const open = db.prepare(
                        `SELECT 1 FROM loans WHERE member_id = ? AND cycle_id = ? AND status = 'requested'`
                    ).get(member.member_id, cycle.cycle_id);
                    if (open) {
                        markFailed(item, 'member already has a loan request in this cycle');
                        continue;
                    }
                    // Same fields as the loans API. Due date: from the payload if it
                    // is a real future date, otherwise the end of the cycle.
                    const dueDate = isValidDate(payload.due_date) && payload.due_date > today()
                        ? payload.due_date
                        : cycle.end_date;
                    db.prepare(
                        `INSERT INTO loans (cycle_id, member_id, principal_amount, interest_rate, due_date, status)
                         VALUES (?, ?, ?, ?, ?, 'requested')`
                    ).run(cycle.cycle_id, member.member_id, amount, cycle.default_interest_rate, dueDate);
                } else {
                    markFailed(item, `unknown action ${item.action}`);
                    continue;
                }

                db.prepare(`UPDATE sync_queue SET status='synced', synced_at=datetime('now') WHERE queue_id=?`).run(item.queue_id);
                synced++;
            } catch (e) {
                markFailed(item, e.message);
            }
        }

        res.json({ message: 'Sync complete', synced, failed, skipped, total: pending.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
