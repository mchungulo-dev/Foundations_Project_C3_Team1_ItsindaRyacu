const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { protect, adminsOnly } = require('../middleware/auth');

// POST /api/cycles -Create new cycle(admins)
router.post('/', protect, adminsOnly, (req, res) => {
    const { start_date, end_date, contribution_amount, default_interest_rate, reserve_percentage } = req.body;

    if (!start_date || !contribution_amount) {
        return res.status(400).json({ error: 'Start date and contribution amount are required' });
    }
    try {
        // check whether there are other active cycles
        const activeCycle = db.prepare(`
            SELECT cycle_id FROM cycles WHERE account_id = ? AND status = 'active'
        `).get(req.user.account_id);

        if (activeCycle) {
            return res.status(400).json({ error: "A cycle is already active. Close the cycle first before creating a new one" });
        }

        const results = db.prepare(`
            INSERT INTO cycles (account_id, start_date, end_date, contribution_amount, default_interest_rate, reserve_percentage, status)
            VALUES (?, ?, ?, ?, ?, ?, 'active')
        `).run(
            req.user.account_id,
            start_date,
            end_date || null,
            contribution_amount,
            default_interest_rate || 0,
            reserve_percentage || 20
        );

        res.status(201).json({ message: "Cycle created successfully", cycle_id: results.lastInsertRowid });

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Database Error" + error.message });
    }
});

// GET /api/cycles - Get all cycles
router.get('/', protect, (req, res) => {
    try {
        const cycles = db.prepare('SELECT * FROM cycles WHERE account_id = ? ORDER BY start_date DESC').all(req.user.account_id);
        
        return res.json(cycles);
    } catch (error) {
        console.error('Error fetching cycles', error);
        res.status(500).json({ error: 'Failed to fetch cycles' });
    }
});

// GET /api/cycles/active -  the currently active cycle in the group 
router.get('/active', protect, (req, res) => {
    try{
        const activeCycle = db.prepare(`SELECT * FROM cycles WHERE account_id = ? AND status = 'active`).get(req.user.account_id);

        if(!activeCycle){
            return res.status(444).json({ message: 'No active cycle found'});
        }
        return res.json(activeCycle);

    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch active cycles!'});
    }
});

// PUT /api/cycles/:id/close - Close a cycle
router.put('/:id/close', protect, adminsOnly, (req, res) => {
    const cycle_id = req.params.id;

    try {
        // Check whether cycle exists and  belongs to the group
        const cycle = db.prepare(`
            SELECT status FROM cycles WHERE account_id = ? AND cycle_id = ?
        `).get(req.user.account_id, cycle_id);

        if (!cycle) {
            return res.status(404).json({ error: "Cycle not found or unauthorised access" });
        }
        if(cycle.status !== 'active'){
            return res.status(400).json({ error: 'Cycle already closed'});
        }

        // Check if loans are paid out
        const loanStatus = db.prepare(`SELECT * FROM loans WHERE cycle_id = ? AND status IN('requested', 'approved', 'disbursed')`).get(cycle_id);
        if (loanStatus) {
            return res.status(400).json({
                error: "Cycle cannot be closed. Cycle contains pending or active loans that have not been fully closed."
            });
        }

        db.prepare('UPDATE cycles SET status = "closed", end_date = COALESCE(end_date, date("now")) WHERE cycle_id = ?').run(cycle_id);

        return res.json({ message: "Cycle closed successfully. You can now proceed to Share-out" });
    } catch (error) {
        console.error('Error closing cycle', error);
        return res.status(500).json({ error: "Failed to close cycle" });
    }
});

module.exports = router;
