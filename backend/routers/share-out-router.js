const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { protect, adminsOrTreasurer, adminsOnly } = require('../middleware/auth');


// POST /api/share-out/calculate - To calculate the total final payout

router.post('/calculate', protect, adminsOrTreasurer, (req, res) => {
    const { cycle_id } = req.body;

    if (!cycle_id) return res.status(400).json({ error: "Cycle_id is required" });

    try {
        // Check whether the cycle belongs to the users group
        const cycle = db.prepare(`SELECT * FROM cycles WHERE cycle_id = ?  AND account_id = ? `).get(cycle_id, req.user.account_id);
        if (!cycle) {
            return res.status(404).json({ error: 'Cycle not found or unauthorised access.' });
        }
        // get the sum of all savings
        const groupSavings = db.prepare(`
            SELECT COALESCE(SUM(amount), 0) as total_savings FROM savings WHERE cycle_id=?
        `).get(cycle_id);

        const totalGroupSavings = groupSavings.total_savings;
        if (totalGroupSavings === 0) {
            return res.status(400).json({ error: "No savings recorded for this cycle" });

        }

        // Get the total interest earned from loans
        // Get the total interest earned from loans
        const totalRepayments = db.prepare(`
            SELECT COALESCE(SUM(r.amount_repaid), 0) as total_repaid,
                   COALESCE(SUM(DISTINCT l.principal_amount), 0) as total_principal
            FROM repayments r
            JOIN loans l ON r.loan_id = l.loan_id
            WHERE l.cycle_id = ? AND l.status = 'closed'
        `).get(cycle_id);

        const loanInterestsEarned = Math.max(0, (totalRepayments?.total_repaid || 0) - (totalRepayments?.total_principal || 0));

        const finesEarned = db.prepare(`
            SELECT COALESCE(SUM(fine_amount), 0) as total_fines 
            FROM fines 
            WHERE cycle_id = ? AND is_paid = 1
        `).get(cycle_id)?.total_fines || 0;

        const totalProfits = Math.max(0, loanInterestsEarned + finesEarned);

        // Member savings data
        const membersData = db.prepare(`
            SELECT
                m.member_id,
                m.member_name,
                COALESCE(SUM(s.amount), 0) as member_savings,
                COALESCE((
                    SELECT SUM(f.fine_amount)
                    FROM fines f 
                    WHERE f.member_id = m.member_id AND f.cycle_id = ? AND f.is_paid = 0
                    ), 0) as unpaid_fines,
                COALESCE((
                    SELECT SUM(l.principal_amount) 
                    FROM loans l 
                    WHERE l.member_id = m.member_id AND l.cycle_id = ? AND l.status = 'disbursed'
                    ), 0) as outstanding_loans
            FROM members m
            JOIN savings s ON m.member_id = s.member_id AND s.cycle_id = ?
            WHERE m.account_id = ?
            GROUP BY m.member_id
            `).all(cycle_id, cycle_id, cycle_id, req.user.account_id);

        // Calculate payouts per member

        const payout = membersData.map(m => {
            const savingsRatio = m.member_savings / totalGroupSavings;
            const profitShare = Math.round((totalProfits * savingsRatio) * 100) / 100;
            const netPayout = (m.member_savings + profitShare) - m.unpaid_fines - m.outstanding_loans;

            return {
                member_id: m.member_id,
                name: m.member_name,
                total_savings: m.member_savings,
                profit_share: profitShare,
                deductions: {
                    fines: m.unpaid_fines,
                    loans: m.outstanding_loans
                },
                final_payout: Math.max(0, netPayout)
            };
        });

        return res.json({
            cycle_id: parseInt(cycle_id),
            total_savings: totalGroupSavings,
            group_profits: totalProfits,
            member_payouts: payout
        });

    } catch (error) {
        console.error('Calculation error', error);
        res.status(500).json({ error: "Calculations error" });
    }
});

// POST /api/share-out/execute - This is final step to distribute the shares among the members
router.post('/execute', protect, adminsOnly, (req, res) => {
    const { cycle_id } = req.body;

    if (!cycle_id) return res.status(400).json({ error: "cycle_id is required" });

    try {
        const cycle = db.prepare(`
            SELECT * FROM cycles WHERE cycle_id = ? AND account_id = ?
        `).get(cycle_id, req.user.account_id);

        if (!cycle) {
            return res.status(404).json({ error: "Cycle not found or unauthorized access" });
        }

        const executeShareOut = db.transaction(() => {
            // Check whether the cycle has savings
            const groupSavings = db.prepare(`
                SELECT COALESCE(SUM(amount), 0) as total_savings 
                FROM savings WHERE cycle_id = ?
            `).get(cycle_id).total_savings;

            if (groupSavings === 0) {
                throw new Error("Cannot execute share-out on a cycle with zero total savings.");
            }

            const membersData = db.prepare(`
                SELECT
                    m.member_id,
                    m.member_name,
                    COALESCE(SUM(s.amount), 0) as member_savings,
                    COALESCE((
                        SELECT SUM(f.fine_amount)
                        FROM fines f 
                        WHERE f.member_id = m.member_id AND f.cycle_id = ? AND f.is_paid = 0
                        ), 0) as unpaid_fines,
                    COALESCE((
                        SELECT SUM(l.principal_amount) 
                        FROM loans l 
                        WHERE l.member_id = m.member_id AND l.cycle_id = ? AND l.status = 'disbursed'
                        ), 0) as outstanding_loans
                FROM members m
                JOIN savings s ON m.member_id = s.member_id AND s.cycle_id = ?
                WHERE m.account_id = ?
                GROUP BY m.member_id
            `).all(cycle_id, cycle_id, cycle_id, req.user.account_id);

            const insertShareOut = db.prepare(`
                INSERT INTO share_outs (
                    cycle_id, member_id, savings_total, profit_share, 
                    total_amount, paid_on, status, approved_by
                )
                VALUES (?, ?, ?, ?, ?, date('now'), 'paid', ?)
            `);

            const cumulativeGroupSavings = db.prepare(`
                SELECT COALESCE(SUM(amount), 0) as total_savings FROM savings WHERE cycle_id=?
            `).get(cycle_id).total_savings;

            const allRepayments = db.prepare(`
                SELECT COALESCE(SUM(r.amount_repaid), 0) as total_repaid,
                       COALESCE(SUM(DISTINCT l.principal_amount), 0) as total_principal
                FROM repayments r
                JOIN loans l ON r.loan_id = l.loan_id
                WHERE l.cycle_id = ? AND l.status = 'closed'
            `).get(cycle_id);

            const allLoanInterestsEarned = Math.max(0, (allRepayments?.total_repaid || 0) - (allRepayments?.total_principal || 0));

            const allFinesEarned = db.prepare(`
                SELECT COALESCE(SUM(fine_amount), 0) as total_fines 
                FROM fines 
                WHERE cycle_id = ? AND is_paid = 1
            `).get(cycle_id)?.total_fines || 0;

            const totalProfitPool = Math.max(0, allLoanInterestsEarned + allFinesEarned);

            membersData.forEach(m => {
                const savingsRatio = m.member_savings / cumulativeGroupSavings;
                const profitShare = Math.round((totalProfitPool * savingsRatio) * 100) / 100;
                const finalPayout = Math.max(0, (m.member_savings + profitShare) - m.unpaid_fines - m.outstanding_loans);

                // Insert the data into the share-outs schema
                insertShareOut.run(
                    cycle_id,
                    m.member_id,
                    m.member_savings,
                    profitShare,
                    finalPayout,
                    req.user.id
                );
            });
            // Mamk all unpaid fines in this cycle as paid
            db.prepare(`
                UPDATE fines SET is_paid =1, paid_on = date('now') WHERE cycle_id = ? AND is_paid = 0 
            `).run(cycle_id);

            // Mark all loans in this cycle as paid
            db.prepare(`
                UPDATE loans SET status = 'closed' WHERE cycle_id = ? AND status = 'disbursed'
            `).run(cycle_id);
            // Close cycle if still open
            db.prepare(`
                UPDATE cycles 
                SET status = 'closed', end_date = COALESCE(end_date, date('now')) 
                WHERE cycle_id = ?
            `).run(cycle_id);
        });

        executeShareOut();
        res.json({ message: "Share-outs executed successfully. Cycle funds distributed to members." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Execution failed. Possible data integrity issue' });
    }
});

module.exports = router;