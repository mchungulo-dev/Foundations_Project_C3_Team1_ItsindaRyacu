const express = require('express');
const router = express.Router();
const db = require('../config/database');
const crypto = require('crypto');

// ── Helpers ──────────────────────────────────────────────────────────────────

function hashPin(pin) {
    return crypto.createHash('sha256').update(String(pin)).digest('hex');
}

function getMember(phone) {
    return db.prepare(
        `SELECT member_id, account_id, member_name, role, pin, is_active
         FROM members WHERE phone = ?`
    ).get(phone);
}

function getActiveCycle(accountId) {
    return db.prepare(
        `SELECT cycle_id FROM cycles WHERE account_id = ? AND status = 'active' LIMIT 1`
    ).get(accountId);
}

function queueOffline(sessionId, phone, action, payload) {
    db.prepare(
        `INSERT INTO sync_queue (session_id, phone, action, payload, status)
         VALUES (?, ?, ?, ?, 'pending')`
    ).run(sessionId, phone, action, JSON.stringify(payload));
}

const ADMIN_ROLES = ['admin', 'treasurer', 'chairperson', 'secretary'];

function isAdminRole(role) {
    return ADMIN_ROLES.includes(role);
}

function mainMenu(role) {
    if (isAdminRole(role)) {
        return `CON Main Menu:\n1. Record Saving\n2. Approve Loan\n3. Add Fine\n4. Next Meeting\n5. Exit`;
    }
    return `CON Main Menu:\n1. My Balance\n2. Save Money\n3. Request Loan\n4. Next Meeting\n5. Exit`;
}

// ── USSD Route ────────────────────────────────────────────────────────────────

router.post('/', (req, res) => {
    const start = Date.now();
    const { sessionId, phoneNumber, text } = req.body;
    console.log('[USSD]', { sessionId, phoneNumber, text });

    // parts[0] = PIN, parts[1] = menu choice, parts[2+] = sub-inputs
    // e.g. "1234*1*+250788100006*5000"
    const parts = text ? text.split('*') : [];
    let response = '';

    try {
        const member = getMember(phoneNumber);

        // ════════════════════════════════════════════════════════════════════
        // NOT REGISTERED
        // ════════════════════════════════════════════════════════════════════
        if (!member) {
            if (text === '') {
                response = `CON Dear valued member,\nWelcome to Itsinda Ryacu!\nYour number is not registered.\n1. Register\n2. Exit`;
            } else if (text === '1') {
                response = `CON Enter your full name:\n0. Go Back`;
            } else if (parts[0] === '1' && parts.length === 2) {
                if (parts[1] === '0') {
                    response = `CON Dear valued member,\nWelcome to Itsinda Ryacu!\nYour number is not registered.\n1. Register\n2. Exit`;
                } else {
                    response = `CON Enter your National ID:\n0. Go Back`;
                }
            } else if (parts[0] === '1' && parts.length === 3) {
                if (parts[2] === '0') {
                    response = `CON Enter your full name:\n0. Go Back`;
                } else {
                    response = `CON Create a 4-digit PIN:\n0. Go Back`;
                }
            } else if (parts[0] === '1' && parts.length === 4) {
                if (parts[3] === '0') {
                    response = `CON Enter your National ID:\n0. Go Back`;
                } else {
                    response = `CON Confirm your PIN:\n0. Go Back`;
                }
            } else if (parts[0] === '1' && parts.length === 5) {
                if (parts[4] === '0') {
                    response = `CON Create a 4-digit PIN:\n0. Go Back`;
                } else if (parts[3] !== parts[4]) {
                    response = `END PINs do not match.\nDial again to retry.`;
                } else {
                    const group = db.prepare(`SELECT account_id FROM group_account LIMIT 1`).get();
                    if (!group) {
                        response = `END No group found. Contact admin.`;
                    } else {
                        db.prepare(
                            `INSERT INTO members (account_id, member_name, phone, national_id_number, role, pin, is_active, password)
                             VALUES (?, ?, ?, ?, 'member', ?, 1, 'placeholder')`
                        ).run(group.account_id, parts[1], phoneNumber, parts[2], hashPin(parts[3]));
                        response = `END Welcome ${parts[1]}!\nYou are now registered.\nDial again to access your account.`;
                    }
                }
            } else if (text === '2') {
                response = `END Thank you. Goodbye!`;
            } else {
                response = `END Not registered. Dial again.`;
            }

        // ════════════════════════════════════════════════════════════════════
        // MEMBER LEFT THE GROUP
        // ════════════════════════════════════════════════════════════════════
        } else if (member.is_active === 0) {
            response = `END Sorry, your account is no longer active.\nContact your group admin.`;

        // ════════════════════════════════════════════════════════════════════
        // STEP 0 — Welcome + ask PIN
        // ════════════════════════════════════════════════════════════════════
        } else if (text === '') {
            response = `CON Dear ${member.member_name},\nWelcome to Itsinda Ryacu!\nPlease enter your PIN\nto access your account:`;

        // ════════════════════════════════════════════════════════════════════
        // STEP 1 — Verify PIN → show main menu
        // parts = ['<pin>']
        // ════════════════════════════════════════════════════════════════════
        } else if (parts.length === 1) {
            if (!member.pin) {
                response = `END No PIN set. Contact your admin.`;
            } else if (hashPin(parts[0]) !== member.pin) {
                response = `END Incorrect PIN.\nAccess denied.`;
            } else {
                response = mainMenu(member.role);
            }

        // ════════════════════════════════════════════════════════════════════
        // ALL FURTHER STEPS — parts[0]=PIN, parts[1]=choice, parts[2+]=inputs
        // ════════════════════════════════════════════════════════════════════
        } else {
            // Re-verify PIN on every step
            if (!member.pin || hashPin(parts[0]) !== member.pin) {
                response = `END Incorrect PIN.\nSession ended.`;
            } else {
                const choice = parts[1];
                const admin = isAdminRole(member.role);

                // ── Go Back to main menu ─────────────────────────────────────
                if (choice === '0') {
                    response = mainMenu(member.role);

                // ════════════════════════════════════════════════════════════
                // MEMBER FLOWS
                // ════════════════════════════════════════════════════════════

                // 1. My Balance
                } else if (choice === '1' && !admin) {
                    const savings = db.prepare(
                        `SELECT COALESCE(SUM(amount),0) as total FROM savings WHERE member_id = ?`
                    ).get(member.member_id);
                    const loans = db.prepare(
                        `SELECT COALESCE(SUM(principal_amount),0) as total FROM loans WHERE member_id = ? AND status='active'`
                    ).get(member.member_id);
                    response = `END Hi ${member.member_name},\nSavings: ${savings.total} RWF\nActive Loans: ${loans.total} RWF`;

                // 2. Save Money → ask amount
                } else if (choice === '2' && !admin && parts.length === 2) {
                    response = `CON Enter amount to save (RWF):\n0. Go Back`;

                // 2*<amount>
                } else if (choice === '2' && !admin && parts.length === 3) {
                    if (parts[2] === '0') {
                        response = mainMenu(member.role);
                    } else {
                        const amount = parseFloat(parts[2]);
                        if (isNaN(amount) || amount <= 0) {
                            response = `END Invalid amount. Try again.`;
                        } else {
                            const cycle = getActiveCycle(member.account_id);
                            if (!cycle) {
                                response = `END No active cycle. Contact admin.`;
                            } else {
                                db.prepare(
                                    `INSERT INTO savings (cycle_id, member_id, amount, save_date, status, recorded_by)
                                     VALUES (?, ?, ?, date('now'), 'verified', ?)`
                                ).run(cycle.cycle_id, member.member_id, amount, member.member_id);
                                response = `END Saving of ${amount} RWF recorded!\nDial again to check balance.`;
                            }
                        }
                    }

                // 3. Request Loan → ask amount
                } else if (choice === '3' && !admin && parts.length === 2) {
                    response = `CON Enter loan amount (RWF):\n0. Go Back`;

                // 3*<amount>
                } else if (choice === '3' && !admin && parts.length === 3) {
                    if (parts[2] === '0') {
                        response = mainMenu(member.role);
                    } else {
                        const amount = parseFloat(parts[2]);
                        if (isNaN(amount) || amount <= 0) {
                            response = `END Invalid amount. Try again.`;
                        } else {
                            const cycle = getActiveCycle(member.account_id);
                            if (!cycle) {
                                response = `END No active cycle. Contact admin.`;
                            } else {
                                db.prepare(
                                    `INSERT INTO loans (cycle_id, member_id, principal_amount, interest_rate, issue_date, status)
                                     VALUES (?, ?, ?, 0, date('now'), 'pending')`
                                ).run(cycle.cycle_id, member.member_id, amount);
                                response = `END Loan request of ${amount} RWF submitted!\nPending admin approval.`;
                            }
                        }
                    }

                // 4. Next Meeting (member)
                } else if (choice === '4' && !admin) {
                    const meeting = db.prepare(
                        `SELECT meeting_date, meeting_time, meeting_type FROM meetings
                         WHERE account_id = ? AND meeting_date >= date('now')
                         ORDER BY meeting_date ASC LIMIT 1`
                    ).get(member.account_id);
                    response = meeting
                        ? `END Next Meeting:\nType: ${meeting.meeting_type}\nDate: ${meeting.meeting_date}\nTime: ${meeting.meeting_time}`
                        : `END No upcoming meetings scheduled.`;

                // 5. Exit (member)
                } else if (choice === '5' && !admin) {
                    response = `END Thank you ${member.member_name}.\nGoodbye!`;

                // ════════════════════════════════════════════════════════════
                // ADMIN / TREASURER / CHAIRPERSON / SECRETARY FLOWS
                // ════════════════════════════════════════════════════════════

                // 1. Record Saving → ask member phone
                } else if (choice === '1' && admin && parts.length === 2) {
                    response = `CON Enter member phone number:\n0. Go Back`;

                // 1*<phone> → confirm member, ask amount
                } else if (choice === '1' && admin && parts.length === 3) {
                    if (parts[2] === '0') {
                        response = mainMenu(member.role);
                    } else {
                        const target = getMember(parts[2]);
                        if (!target || !target.is_active) {
                            response = `END Member ${parts[2]} not found.`;
                        } else {
                            response = `CON Member: ${target.member_name}\nEnter amount (RWF):\n0. Go Back`;
                        }
                    }

                // 1*<phone>*<amount> → insert saving
                } else if (choice === '1' && admin && parts.length === 4) {
                    if (parts[3] === '0') {
                        response = `CON Enter member phone number:\n0. Go Back`;
                    } else {
                        const target = getMember(parts[2]);
                        const amount = parseFloat(parts[3]);
                        if (!target || !target.is_active) {
                            response = `END Member not found.`;
                        } else if (isNaN(amount) || amount <= 0) {
                            response = `END Invalid amount.`;
                        } else {
                            const cycle = getActiveCycle(member.account_id);
                            if (!cycle) {
                                response = `END No active cycle.`;
                            } else {
                                db.prepare(
                                    `INSERT INTO savings (cycle_id, member_id, amount, save_date, status, recorded_by)
                                     VALUES (?, ?, ?, date('now'), 'verified', ?)`
                                ).run(cycle.cycle_id, target.member_id, amount, member.member_id);
                                response = `END ${amount} RWF saved for\n${target.member_name}!`;
                            }
                        }
                    }

                // 2. Approve Loan → list pending
                } else if (choice === '2' && admin && parts.length === 2) {
                    const pending = db.prepare(
                        `SELECT l.loan_id, m.member_name, l.principal_amount
                         FROM loans l JOIN members m ON l.member_id = m.member_id
                         WHERE l.status = 'pending' LIMIT 5`
                    ).all();
                    if (!pending.length) {
                        response = `END No pending loans.`;
                    } else {
                        const list = pending.map(l => `${l.loan_id}. ${l.member_name} - ${l.principal_amount} RWF`).join('\n');
                        response = `CON Pending Loans:\n${list}\nEnter Loan ID:\n0. Go Back`;
                    }

                // 2*<loanId> → approve
                } else if (choice === '2' && admin && parts.length === 3) {
                    if (parts[2] === '0') {
                        response = mainMenu(member.role);
                    } else {
                        const loanId = parseInt(parts[2]);
                        const loan = db.prepare(`SELECT loan_id FROM loans WHERE loan_id = ? AND status = 'pending'`).get(loanId);
                        if (!loan) {
                            response = `END Loan ${loanId} not found.`;
                        } else {
                            db.prepare(
                                `UPDATE loans SET status = 'active', approved_by = ?, issue_date = date('now') WHERE loan_id = ?`
                            ).run(member.member_id, loanId);
                            response = `END Loan ${loanId} approved!`;
                        }
                    }

                // 3. Add Fine → ask member phone
                } else if (choice === '3' && admin && parts.length === 2) {
                    response = `CON Enter member phone number:\n0. Go Back`;

                // 3*<phone> → confirm member, ask amount
                } else if (choice === '3' && admin && parts.length === 3) {
                    if (parts[2] === '0') {
                        response = mainMenu(member.role);
                    } else {
                        const target = getMember(parts[2]);
                        if (!target || !target.is_active) {
                            response = `END Member ${parts[2]} not found.`;
                        } else {
                            response = `CON Member: ${target.member_name}\nEnter fine amount (RWF):\n0. Go Back`;
                        }
                    }

                // 3*<phone>*<amount> → insert fine
                } else if (choice === '3' && admin && parts.length === 4) {
                    if (parts[3] === '0') {
                        response = `CON Enter member phone number:\n0. Go Back`;
                    } else {
                        const target = getMember(parts[2]);
                        const amount = parseFloat(parts[3]);
                        if (!target || !target.is_active) {
                            response = `END Member not found.`;
                        } else if (isNaN(amount) || amount <= 0) {
                            response = `END Invalid amount.`;
                        } else {
                            db.prepare(
                                `INSERT INTO fines (account_id, member_id, fine_amount, reason, is_paid, recorded_by)
                                 VALUES (?, ?, ?, 'USSD fine', 0, ?)`
                            ).run(member.account_id, target.member_id, amount, member.member_id);
                            response = `END Fine of ${amount} RWF added\nfor ${target.member_name}!`;
                        }
                    }

                // 4. Next Meeting (admin)
                } else if (choice === '4' && admin) {
                    const meeting = db.prepare(
                        `SELECT meeting_date, meeting_time, meeting_type FROM meetings
                         WHERE account_id = ? AND meeting_date >= date('now')
                         ORDER BY meeting_date ASC LIMIT 1`
                    ).get(member.account_id);
                    response = meeting
                        ? `END Next Meeting:\nType: ${meeting.meeting_type}\nDate: ${meeting.meeting_date}\nTime: ${meeting.meeting_time}`
                        : `END No upcoming meetings scheduled.`;

                // 5. Exit (admin)
                } else if (choice === '5' && admin) {
                    response = `END Thank you ${member.member_name}.\nGoodbye!`;

                } else {
                    response = `END Invalid option.\nDial again.`;
                }
            }
        }

    } catch (err) {
        console.error('[USSD] ERROR:', err.message);
        response = `END Service error. Please try again.`;
    }

    console.log(`[USSD] ${Date.now() - start}ms | ${response.slice(0, 60)}`);
    res.set('Content-Type', 'text/plain');
    res.send(response);
});

// ── Offline Sync Endpoint ─────────────────────────────────────────────────────
router.post('/sync', (req, res) => {
    try {
        const pending = db.prepare(`SELECT * FROM sync_queue WHERE status = 'pending'`).all();
        let synced = 0, failed = 0;

        for (const item of pending) {
            try {
                const payload = JSON.parse(item.payload);
                const member = getMember(item.phone);

                if (item.action === 'SAVE' && member) {
                    db.prepare(
                        `INSERT INTO savings (cycle_id, member_id, amount, save_date, status, recorded_by)
                         VALUES (?, ?, ?, date('now'), 'verified', ?)`
                    ).run(payload.cycle_id, member.member_id, payload.amount, member.member_id);
                } else if (item.action === 'LOAN_REQUEST' && member) {
                    db.prepare(
                        `INSERT INTO loans (cycle_id, member_id, principal_amount, interest_rate, issue_date, status)
                         VALUES (?, ?, ?, 0, date('now'), 'pending')`
                    ).run(payload.cycle_id, member.member_id, payload.amount);
                }

                db.prepare(`UPDATE sync_queue SET status='synced', synced_at=datetime('now') WHERE queue_id=?`).run(item.queue_id);
                synced++;
            } catch (e) {
                db.prepare(`UPDATE sync_queue SET status='failed' WHERE queue_id=?`).run(item.queue_id);
                failed++;
            }
        }

        res.json({ message: 'Sync complete', synced, failed, total: pending.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
