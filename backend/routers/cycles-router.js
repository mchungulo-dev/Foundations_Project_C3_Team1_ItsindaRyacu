const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/cycles -Create new cycle(admins)
router.post('/', protect, adminOnly, (req, res) => {
    const { start_date, end_date, contribution_amount} = req.body;

    if(!start_date || !contribution_amount){
        return res.status(400).json({ error: 'Start date and contribution amount are required'});
    }
    try{
        // check whether there are other active cycles
        const activeCycle = db.prepare('SELECT cycle_id FROM cycles WHERE status = "active"').get();
        if(activeCycle){
            return res.status(400).json({ error: "A cycle is already active. Close the cycle first before creating a new one"});
        }

        const insertCycle = db.prepare(`
            INSERT INTO cycles (start_date, end_date, contribution_amount, status) VALUES(?,?,?,'active')`);

            const results = insertCycle.run(start_date, end_date || null, contribution_amount);

            res.status(201).json({ message: "Cycle created successfully", cycle_id: results.lastInsertRowid});

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Database Error"});
    }
});

// GET /api/cycles - Get all cycles
router.get('/', protect, (req, res) => {
    try{
        const cycles = db.prepare('SELECT * FROM cycles ORDER BY start_date DESC')
        .res.json(cycles);
    } catch (error){
        res.status(500).json({ error: 'Failed to fetch cycles'});
    }
});

// PUT /api/cycles/:id/close - Close a cycle
router.put('/:id/close', protect, adminOnly, (req, res) => {
    const cycle_id = req.params.id;

    try{
        const cycle = db.prepare('SELECT status FROM cycles WHERE cycle_id = ?').get(cycle_id);
        if(!cycle || cycle.status !== 'active'){
            return res.status(400).json({ error: "Cycle not found or already closed"});

            // Check if loans are paid out
            const loanStatus = db.prepare('SELECT * FROM loans WHERE status="active" AND cycle_id = ?').get(cycle_id);
            if(loanStatus){
                return res.status(400).json({ error: "Cycle contains active loans. Cycle cannot be closed "});
            }

            db.prepare('UPDATE cycles SET status = "closed", end_date = COALESCE(end_date, date("now")) WHERE cycle_id = ?').run(cycle_id);

            res.json({ message: "Cycle closed successfully. You can now proceed to Share-out"});
        }
    } catch(error){
        return res.status(500).json({ error: "Failed to close cycle"});
    }
});

module.exports = router;
