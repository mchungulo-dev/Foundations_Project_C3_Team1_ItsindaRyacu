const router = require('express').Router();
const db = require('../config/database');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const {calculateLoanBalance} = require('../utils/loan_calculations');

// Loan application validation
const loanApplicationSchema = Joi.object({
    cycle_id: Joi.number().integer().positive().required(),
    principal_amount: Joi.number().positive().required(),
    interest_rate: Joi.number().min(0).required(),
    due_date: Joi.date().iso().greater('now').required()
}).options({ abortEarly: false });

// Loan approval/rejection validation
const loanDecisionSchema = Joi.object({
    status: Joi.string().valid('approved', 'rejected').required()
}).options({ abortEarly: false });

// Loan repayment validation
const repaymentSchema = Joi.object({
    amount_repaid: Joi.number().integer().positive().max(Number.MAX_SAFE_INTEGER).required()
});

// Verify JWT and user role
const getUserFromToken = (req, res, requiredRole) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({
            message: 'Authentication token required!'
        });
        return null;
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        if (decodedToken.role !== requiredRole) {
            res.status(403).json({
                message: `Only ${requiredRole}s can perform this action!`
            });
            return null;
        }

        // Check whether the user and group are active
        const activeUser = db.prepare(`
            SELECT m.member_id
            FROM members AS m
            INNER JOIN group_account AS g
                ON m.account_id = g.account_id
            WHERE m.member_id = ?
              AND m.account_id = ?
              AND m.is_active = 1
              AND g.is_active = 1
        `).get(decodedToken.member_id, decodedToken.account_id);

        if (!activeUser) {
            res.status(403).json({message: 'Your account or savings group is inactive!'});
            return null;
        }

        return decodedToken;

    } catch (error) {
        res.status(401).json({
            message: 'Invalid or expired token!'
        });
        return null;
    }
};


// ==========================================
// 1. MEMBER: APPLY FOR A LOAN
// POST /loans/apply
// ==========================================

router.route('/apply').post((req, res) => {
    try {
        const decodedToken = getUserFromToken(req, res, 'member');

        if (!decodedToken) return;

        const { error, value } = loanApplicationSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                message: 'Validation failed!',
                errors: error.details.map(detail => detail.message)
            });
        }

        // Verify that the cycle belongs to the member's group
        const cycle = db.prepare(`
            SELECT cycle_id
            FROM cycles
            WHERE cycle_id = ?
              AND account_id = ?
        `).get(value.cycle_id, decodedToken.account_id);

        if (!cycle) {
            return res.status(404).json({
                message: 'Savings cycle not found in your group!'
            });
        }

        // Prevent multiple pending loan applications
        const existingApplication = db.prepare(`
            SELECT loan_id
            FROM loans
            WHERE member_id = ?
              AND cycle_id = ?
              AND status = 'requested'
        `).get(decodedToken.member_id, value.cycle_id);

        if (existingApplication) {
            return res.status(409).json({
                message: 'You already have a pending loan application for this cycle!'
            });
        }

        const application = db.prepare(`
            INSERT INTO loans (
                cycle_id,
                member_id,
                principal_amount,
                interest_rate,
                due_date,
                status
            )
            VALUES (?, ?, ?, ?, ?, 'requested')
        `).run(
            value.cycle_id,
            decodedToken.member_id,
            value.principal_amount,
            value.interest_rate,
            value.due_date.toISOString().slice(0, 10)
        );

        return res.status(201).json({
            message: 'Loan application submitted successfully!',
            loan_id: application.lastInsertRowid,
            cycle_id: value.cycle_id,
            principal_amount: value.principal_amount,
            interest_rate: value.interest_rate,
            due_date: value.due_date.toISOString().slice(0, 10),
            status: 'requested'
        });

    } catch (error) {
        console.error('Loan Application Error:', error);

        return res.status(500).json({
            message: 'Internal Server Error!'
        });
    }
});


// ==========================================
// 2. ADMIN: VIEW LOAN APPLICATIONS
// GET /loans/applications
// ==========================================

router.route('/applications').get((req, res) => {
    try {
        const decodedToken = getUserFromToken(req, res, 'admin');

        if (!decodedToken) return;

        const applications = db.prepare(`
            SELECT
                l.loan_id,
                l.cycle_id,
                l.member_id,
                m.member_name,
                m.email,
                l.principal_amount,
                l.interest_rate,
                l.due_date,
                l.status,
                l.approved_by,
                l.created_at
            FROM loans AS l
            INNER JOIN members AS m
                ON l.member_id = m.member_id
            INNER JOIN cycles AS c
                ON l.cycle_id = c.cycle_id
            WHERE c.account_id = ?
            ORDER BY l.created_at DESC
        `).all(decodedToken.account_id);

        return res.status(200).json({
            message: 'Loan applications retrieved successfully!',
            total_applications: applications.length,
            applications
        });

    } catch (error) {
        console.error('View Loan Applications Error:', error);

        return res.status(500).json({
            message: 'Internal Server Error!'
        });
    }
});


// ==========================================
// 3. ADMIN: APPROVE OR REJECT A LOAN
// PUT /loans/applications/:id/decision
// ==========================================

router.route('/applications/:id/decision').put((req, res) => {
    try {
        const decodedToken = getUserFromToken(req, res, 'admin');

        if (!decodedToken) return;

        const loanId = Number(req.params.id);

        if (!Number.isSafeInteger(loanId) || loanId <= 0) {
            return res.status(400).json({
                message: 'Invalid loan application ID!'
            });
        }

        const { error, value } = loanDecisionSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                message: 'Validation failed!',
                errors: error.details.map(detail => detail.message)
            });
        }

        // Find the application within the admin's group
        const application = db.prepare(`
            SELECT l.loan_id, l.status
            FROM loans AS l
            INNER JOIN cycles AS c
                ON l.cycle_id = c.cycle_id
            WHERE l.loan_id = ?
              AND c.account_id = ?
        `).get(loanId, decodedToken.account_id);

        if (!application) {
            return res.status(404).json({
                message: 'Loan application not found!'
            });
        }

        if (application.status !== 'requested') {
            return res.status(409).json({
                message: 'This loan application has already been reviewed!'
            });
        }

        const result = db.prepare(`
            UPDATE loans
            SET status = ?,
                approved_by = ?,
                issue_date = CASE
                    WHEN ? = 'approved' THEN CURRENT_DATE
                    ELSE issue_date
                END
            WHERE loan_id = ?
              AND status = 'requested'
        `).run(
            value.status,
            decodedToken.member_id,
            value.status,
            loanId
        );

        if (result.changes === 0) {
            return res.status(409).json({
                message: 'This loan application has already been reviewed!'
            });
        }

        return res.status(200).json({
            message: `Loan application ${value.status} successfully!`,
            loan_id: loanId,
            status: value.status
        });

    } catch (error) {
        console.error('Loan Decision Error:', error);

        return res.status(500).json({
            message: 'Internal Server Error!'
        });
    }
});

// ADMIN: Confirm that an approved loan was issued
router.post('/:id/disburse', (req, res) => {
    try {
        const admin = getUserFromToken(req, res, 'admin');
        if (!admin) return;

        const loanId = Number(req.params.id);

        if (!Number.isSafeInteger(loanId) || loanId <= 0) {
            return res.status(400).json({ message: 'Invalid loan ID!' });
        }

        const result = db.prepare(`
            UPDATE loans
            SET status = 'disbursed', issue_date = CURRENT_DATE
            WHERE loan_id = ?
              AND status = 'approved'
              AND cycle_id IN (
                  SELECT cycle_id FROM cycles WHERE account_id = ?
              )
        `).run(loanId, admin.account_id);

        if (!result.changes) {
            return res.status(409).json({message: 'No approved loan found in your group to disburse.'});
        }

        return res.json({ message: 'Loan disbursement recorded!' });
    } catch (error) {
        console.error('Disbursement Error:', error);
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
});

// ADMIN: Record money received as a loan repayment
router.post('/:id/repayments', (req, res) => {
    try {
        const admin = getUserFromToken(req, res, 'admin');
        if (!admin) return;

        const loanId = Number(req.params.id);
        const { error, value } = repaymentSchema.validate(req.body);

        if (!Number.isSafeInteger(loanId) || loanId <= 0 || error) {
            return res.status(400).json({message: 'Provide a valid loan ID and positive whole-RWF amount.'});
        }

        const recordPayment = db.transaction(() => {
            const loan = db.prepare(`
                SELECT l.*
                FROM loans AS l
                JOIN cycles AS c ON c.cycle_id = l.cycle_id
                WHERE l.loan_id = ? AND c.account_id = ?
            `).get(loanId, admin.account_id);

            if (!loan) {
                return { code: 404, message: 'Loan not found!' };
            }

            if (loan.status !== 'disbursed') {
                return {code: 409, message: 'Repayments require a disbursed loan.'};
            }

            const { total_paid } = db.prepare(`
                SELECT COALESCE(SUM(amount_repaid), 0) AS total_paid
                FROM repayments
                WHERE loan_id = ? AND status = 'verified'
            `).get(loanId);

            // const totalDue = Math.round(loan.principal_amount * (1 + loan.interest_rate / 100));
            const {totalRepayable: totalDue, remainingBalance: balance} = calculateLoanBalance (loan.principal_amount, loan.interest_rate, total_paid);

            if (
                !Number.isSafeInteger(totalDue) || totalDue <= 0 ||
                !Number.isSafeInteger(total_paid) ||
                total_paid < 0 || total_paid > totalDue
            ) {
                throw new Error('Invalid stored loan or repayment amounts');
            }

            // const balance = totalDue - total_paid;

            if (value.amount_repaid > balance) {
                return {code: 400, message: 'Payment exceeds the remaining balance!', remaining_balance: balance};
            }

            const payment = db.prepare(`
                INSERT INTO repayments (
                    loan_id, amount_repaid, payment_date,
                    status, recorded_by
                )
                VALUES (?, ?, CURRENT_DATE, 'verified', ?)
            `).run(loanId, value.amount_repaid, admin.member_id);

            const remainingBalance = balance - value.amount_repaid;

            if (remainingBalance === 0) {
                db.prepare(`UPDATE loans SET status = 'closed' WHERE loan_id = ?`).run(loanId);
            }

            return {
                code: 201,
                message: 'Repayment recorded successfully!',
                repayment_id: payment.lastInsertRowid,
                amount_repaid: value.amount_repaid,
                remaining_balance: remainingBalance,
                loan_status: remainingBalance === 0 ? 'closed' : 'disbursed'
            };
        });

        const { code, ...response } = recordPayment.immediate();
        return res.status(code).json(response);
    } catch (error) {
        console.error('Repayment Error:', error);
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
});

// MEMBER: View personal loans and repayments
router.get('/my-loans', (req, res) => {
    try {
        const member = getUserFromToken(req, res, 'member');
        if (!member) return;

        const loans = db.prepare(`
            SELECT l.*
            FROM loans AS l
            JOIN cycles AS c ON c.cycle_id = l.cycle_id
            WHERE l.member_id = ? AND c.account_id = ?
            ORDER BY l.created_at DESC, l.loan_id DESC
        `).all(member.member_id, member.account_id);

        const getRepayments = db.prepare(`
            SELECT repayment_id, amount_repaid, payment_date, status
            FROM repayments
            WHERE loan_id = ?
            ORDER BY payment_date DESC, repayment_id DESC
        `);

        const results = loans.map(loan => {
            const repayments = getRepayments.all(loan.loan_id);

            const amountPaid = repayments
                .filter(payment => payment.status === 'verified')
                .reduce((sum, payment) => sum + payment.amount_repaid, 0);

            // one-time flat-interest calculation as repayment recording.
            const totalRepayable = Math.round(
                loan.principal_amount * (1 + loan.interest_rate / 100)
            );

            const issued = ['disbursed', 'closed'].includes(loan.status);

            return {
                loan_id: loan.loan_id,
                cycle_id: loan.cycle_id,
                principal_amount: loan.principal_amount,
                interest_rate: loan.interest_rate,
                total_repayable: totalRepayable,
                amount_paid: amountPaid,
                remaining_balance: issued
                    ? totalRepayable - amountPaid
                    : null,
                status: loan.status,
                issue_date: loan.issue_date,
                due_date: loan.due_date,
                repayments
            };
        });

        return res.json({message: 'Your loans retrieved successfully!', total_loans: results.length, loans: results});
    
    } catch (error) {
        console.error('Member Loans Error:', error);
        return res.status(500).json({message: 'Internal Server Error!'});
    }
});

module.exports = router;
