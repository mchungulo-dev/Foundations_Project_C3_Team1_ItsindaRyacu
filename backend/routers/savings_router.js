const express = require('express');
const router = express.Router();
const db = require('../config/database.js');
const { protect, adminsOrTreasurer } = require('../middleware/auth.js');

router.post('/', protect, adminsOrTreasurer, (req, res) => {
    let { cycle_id, member_id, amount, save_date, client_ref } = req.body;
    const recorded_by = req.user.id;

    // Validate input
    if(!cycle_id || !member_id || !amount || amount <= 0){
        return res.status(400).json({ error: 'Missing required fields or Invalid amount input'});
    }
    if(!save_date){
        save_date = new Date().toISOString().split('T')[0];
    }
    
    try{
        // Check whether the saving was already recorded
        const existingSaving = db.prepare('SELECT saving_id FROM savings WHERE client_ref = ?').get(client_ref);
        if(existingSaving){
            return res.status(200).json({ message: 'Saving already recorded', data: existingSaving});
        }
        // Check  if the saving cycle is active
        const existingCycle = db.prepare('SELECT status FROM cycles WHERE cycle_id = ? AND account_id = ?').get(cycle_id, req.user.account_id);
        if(!existingCycle || existingCycle.status !== 'active'){
            return res.status(400).json({ error: 'Cannot save to an Inactive or closed cycle'});
        }

        // Create the saving
        const new_saving = db.prepare(`INSERT INTO savings(cycle_id, member_id, amount, save_date, recorded_by, client_ref) VALUES(?,?,?,?,?,?)`);

        const results = new_saving.run(cycle_id, member_id, amount, save_date, recorded_by, client_ref || null);
        res.status(201).json({
            message: 'Saving recorded successfully',
            saving_id: results.lastInsertRowid
        });

    } catch (error){
        return res.status(500).json({ error: 'Database error: ' + error.message});
    }

});

// GET /api/savings
router.get('/', protect, (req, res) => {
    const {cycle_id, member_id} = req.query;
    
    try{
        let query = `
            SELECT s.* FROM savings s
            JOIN cycles c ON s.cycle_id = c.cycle_id
            WHERE c.account_id = ?
        `;
        const params = [req.user.account_id];

        // Implement RBAC where members can only view their savings records
        if(req.user.role === 'member'){
            query += ' AND s.member_id = ?';
            params.push(req.user.member_id);
        }
        else if(member_id){
            query += ' AND s.member_id = ?';
            params.push(member_id);
        } 
        if(cycle_id){
            query += ' AND s.cycle_id = ?';
            params.push(cycle_id);
        }

        query += ' ORDER BY s.created_at DESC';

        const savings = db.prepare(query).all(...params);
        res.json(savings);

    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch savings'})
    }
});

// GET Savings summary. /api/savings/summary - to get the total savings summary
router.get('/summary', protect, (req, res) => {
    const { cycle_id } = req.query;

    if(!cycle_id){
        return res.status(400).json({ error: 'Cycle id is required'});
    }

    try{
        // Check whether the cycle belongs to the users group
        const cycle = db.prepare('SELECT account_id FROM cycles WHERE cycle_id = ?').get(cycle_id);
        if(!cycle || cycle.account_id !== req.user.account_id){
            return res.status(403).json({ error: 'Unauthorised access to this cycle'});
        }

        if(req.user.role === "admin" || req.user.role === "treasurer"){
            const group_totals = db.prepare(`
                SELECT SUM(amount) as total_savings, COUNT(saving_id) as total_transactions 
                FROM savings WHERE cycle_id = ?
            `).get(cycle_id);
        
        let totalLoans = 0;
        try{
            const loanData = db.prepare(`SELECT SUM(principal_amount)as total_loans FROM loans WHERE cycle_id = ? AND status = 'active'`).get(cycle_id);
            totalLoans = loanData?.total_loans || 0;

        } catch(e){
            console.error('Loans table does not exist', e);
        }
        const totalSavings = group_totals?.total_savings || 0;
        res.json({
            cycle_id: parseInt(cycle_id),
            total_savings: totalSavings,
            total_transactions: group_totals?.total_transactions || 0,
            total_loans: totalLoans,
            group_liquidity: totalSavings - totalLoans
        });

        } else {
            // Members summary- members can only see their summary
            const memberSummary = db.prepare(`SELECT SUM(amount) as total_savings, COUNT(saving_id) as total_transactions FROM savings WHERE cycle_id = ? AND member_id = ? `).get(cycle_id, req.user.member_id);

            let memberLoans = 0;
            try{
                const memberLoanData = db.prepare(`SELECT SUM(principal_amount) as total_loans FROM loans WHERE cycle_id = ? AND member_id = ? AND status='disbursed' `).get(cycle_id, req.user.member_id);
                memberLoans = memberLoanData?.total_loans || 0;
            } catch (e) {
                console.error('Error fetching data from Loans schema');
            }
            res.json({
                cycle_id: parseInt(cycle_id),
                member_id: req.user.member_id,
                total_savings: memberSummary?.total_savings || 0,
                total_transactions: memberSummary?.total_transactions || 0,
                total_loans: memberLoans
            });
        }

    } catch (error){
        return res.status(500).json({ error: "Failed to fetch summary"});
    }
});

module.exports = router;
