const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { protect, adminsOrTreasurer, adminsOnly } = require('../middleware/auth');


// POST /api/share-out/calculate - To calculate the total final payout

eouter.pst('/calculate', protect, adminsOrTreasurer, (req, res) => {
    const { cycle_id } = req.body;

    if (!cycle_id) return res.status(400).json({ error: "Cycle_id is required" });

    try {
        const groupSavings = db.prepare(`
            SELECT COALESCE(SUM(amount), 0) as total_savings FROM savings WHERE cycle_id=?
        `).get(cycle_id);

        const totalGroupSavings = groupSavings.total_savings;
        if (totalGroupSavings === 0) {
            return res.status(400).json({ error: "No savings recorded for this cycle" });

        }

        // Member savings data
        const membersData = db.prepare(`
            SELECT
                m.member_id,
                m.member_name,
                COALESCE(SUM(s.amount), 0) as member_savings,
                COALESCE((SELECT SUM(f.fine_amount) FROM fines f WHERE f.member_id = m.member_id AND f.cycle_id = ? AND f.is_paid = 0), 0) as unpaid_fines,
                COALESCE((SELECT SUM(l.principal_amount) FROM loans l WHERE l.member_id = m.member_id AND l.cycle_id = ? AND l.status = 'active'), 0) as outstanding_loans
            FROM members m
            LEFT JOIN savings s ON m.member_id = s.member_id AND s.cycle_id = ?
            WHERE s.saving_id IS NOT NULL 
            GROUP BY m.member_id
            `).all(cycle_id, cycle_id, cycle_id);

        // Calculate payouts per member
        const payout = membersData.map(m => {
            const netPayout = m.member_savings - m.unpaid_fines - m.outstanding_loans;
            return {
                member_id: m.member_id,
                name: m.member_name,
                total_savings: m.member_savings,
                deductions: {
                    fines: m.unpaid_fines,
                    loans: m.outstanding_loans
                },
                final_payout: netPayout
            };
        });

        res.json({
            cycle_id,
            total_fund: totalGroupSavings,
            member_payouts: payout
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Calculations error" });
    }
});

// POST /api/share-out/execute - This is final step to distribute the shares among the members
router.post('/execute', protect, adminsOnly, (req, res) => {
    const { cycle_id } = req.body;
    try {
        const executeShareOut = db.transaction(() => {

            const membersData = db.prepare(`
            SELECT
                m.member_id,
                m.member_name,
                COALESCE(SUM(s.amount), 0) as member_savings,
                COALESCE((SELECT SUM(f.fine_amount) FROM fines f WHERE f.member_id = m.member_id AND f.cycle_id = ? AND f.is_paid = 0), 0) as unpaid_fines,
                COALESCE((SELECT SUM(l.principal_amount) FROM loans l WHERE l.member_id = m.member_id AND l.cycle_id = ? AND l.status = 'active'), 0) as outstanding_loans
            FROM members m
            LEFT JOIN savings s ON m.member_id = s.member_id AND s.cycle_id = ?
            WHERE s.saving_id IS NOT NULL 
            GROUP BY m.member_id
            `).all(cycle_id, cycle_id, cycle_id);
            
            const insertShareOut = db.prepare(`
                INSERT INTO share_outs (cycle_id, member_id, total_amount, status, approved_by)
                VALUES (?,?,?, "paid", ?)`);
                membersData.forEach(m =>{
                    const finalPayout = m.member_savings - m.unpaid_fines - m.outstanding_loans;
                    insertShareOut,run(cycle_id, m.member_id, finalPayout, req.user.id);
                });
                // Mamk all unpaid fines in this cycle as paid
                dp.prepare(`UPDATE fines SET is_paid =1, paid_date = date('now') WHERE cycle_id = ? AND is_paid = 0 `).run(cycle_id);

                // Mark all loans in this cycle as paid
                db.prepare(`UPDATE loans SET status = 'closed' WHERE cycle_id = ? AND status = "active"`).run(cycle_id);

        });
        executeShareOut();
        res.json({ message: "Share-outs executed successfully. Cycle funds distributed to members."});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Execution failed. Possible data integrity issue'});
    }
});

module.exports = router;