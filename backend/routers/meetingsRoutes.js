const express = require('express');
const router = express.Router();
const db = require('../config/database');

// POST /api/meetings/fines
router.post('/fines', (req, res) => {
    const { account_id, meeting_id, member_id, fine_amount, reason, recorded_by } = req.body;

    if (!account_id || !member_id || !fine_amount || !reason || !recorded_by) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO fines (account_id, meeting_id, member_id, fine_amount, reason, recorded_by) 
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(account_id, meeting_id || null, member_id, fine_amount, reason, recorded_by);

        res.status(201).json({ message: "Fine issued successfully." });
    } catch (error) {
        res.status(500).json({ error: "Database error: " + error.message });
    }
});

// PUT /api/meetings/fines/:id/pay
router.put('/fines/:id/pay', (req, res) => {
    const fine_id = req.params.id;
    const { paid_on } = req.body;

    try {
        const stmt = db.prepare(`UPDATE fines SET is_paid = 1, paid_on = ? WHERE fine_id = ?`);
        const result = stmt.run(paid_on || new Date().toISOString(), fine_id);

        if (result.changes === 0) {
            return res.status(404).json({ error: "Fine not found." });
        }

        res.status(200).json({ message: "Fine marked as paid." });
    } catch (error) {
        res.status(500).json({ error: "Database error: " + error.message });
    }
});

// POST /api/meetings
router.post('/', (req, res) => {
    const { account_id, meeting_date, meeting_time, meeting_type, created_by } = req.body;

    if (!account_id || !meeting_date || !created_by) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO meetings (account_id, meeting_date, meeting_time, meeting_type, created_by) 
            VALUES (?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(account_id, meeting_date, meeting_time || new Date().toISOString(), meeting_type || 'regular', created_by);
        
        res.status(201).json({ 
            message: "Meeting created successfully", 
            meeting_id: result.lastInsertRowid 
        });
    } catch (error) {
        res.status(500).json({ error: "Database error: " + error.message });
    }
});

// PUT /api/meetings/:id/minutes
router.put('/:id/minutes', (req, res) => {
    const meeting_id = req.params.id;
    const { minutes } = req.body;

    if (!minutes) {
        return res.status(400).json({ error: "Minutes content is required." });
    }

    try {
        const stmt = db.prepare(`UPDATE meetings SET minutes = ? WHERE meeting_id = ?`);
        const result = stmt.run(minutes, meeting_id);

        if (result.changes === 0) {
            return res.status(404).json({ error: "Meeting not found." });
        }

        res.status(200).json({ message: "Minutes saved successfully." });
    } catch (error) {
        res.status(500).json({ error: "Database error: " + error.message });
    }
});

// POST /api/meetings/:id/attendance — must stay below /fines
router.post('/:id/attendance', (req, res) => {
    const meeting_id = req.params.id;
    const { member_id, status, marked_by } = req.body;

    if (!member_id || !status || !marked_by) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO meeting_attendance (meeting_id, member_id, status, marked_by) 
            VALUES (?, ?, ?, ?)
        `);
        stmt.run(meeting_id, member_id, status, marked_by);

        res.status(201).json({ message: "Attendance marked successfully." });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: "Attendance already recorded for this member." });
        }
        res.status(500).json({ error: "Database error: " + error.message });
    }
});

// GET /api/meetings/:id/attendance
router.get('/:id/attendance', (req, res) => {
    const meeting_id = req.params.id;
    
    try {
        const stmt = db.prepare(`
            SELECT a.attendance_id, a.status, m.member_name 
            FROM meeting_attendance a
            JOIN members m ON a.member_id = m.member_id
            WHERE a.meeting_id = ?
        `);
        const attendanceList = stmt.all(meeting_id);
        res.status(200).json(attendanceList);
    } catch (error) {
        res.status(500).json({ error: "Database error: " + error.message });
    }
});

module.exports = router;