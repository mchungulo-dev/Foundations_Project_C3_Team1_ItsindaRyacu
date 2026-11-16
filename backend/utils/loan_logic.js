const db = require('../config/database');

function checkLoanEligibility(cycle_id, member_id, requested_amount) {
    const group_finacials = db.prepare(`
        SELECT
            (SELECT COALESCE(SUM(amount), 0) FROM savings WHERE cycle_id = ? ) as total_savings,
            (SELECT COALESCE(SUM(principal_amount), 0) FROM loans WHERE cycle_id = ? AND status = 'active') as total_loans,
            (SELECT reserve_percentage FROM cycles WHERE cycle_id = ? ) as reservePercentage`
    ).get(cycle_id, cycle_id, cycle_id);

    const totalSavings = group_finacials.total_savings;
    const totalLoans = group_finacials.total_loans;
    const reservePercent = group_finacials.reservePercentage || 0.20

    // Calculate group liquidity threshold(minimum amount the group should have at all times)
    const maximumLoanable = totalSavings * (1 - reservePercent);
    const availableFunds = maximumLoanable - totalLoans;

    // REJECT LOAN IF EXCEEDING GROUPS AVAILABLE FUNDS
    if (requested_amount > availableFunds) {
        return {
            eligible: false,
            reason: 'LOW_GROUP_LIQUIDITY',
            message: `REVOKED. Group needs to maintain ${reservePercent / 100}% reserve funds. Only ${availableFunds} RWF are available.`
        };
    }

    // Check member eligibility
    const memberSavingsInfo = db.prepare(`SELECT COALESCE(SUM(amount),0) as member_savings FROM savings WHERE cycle_id=? AND member_id=?`).get(cycle_id, member_id).member_savings;
    const memberLoanInfo = db.prepare(`SELECT COALESCE(COUNT(loan_id),0) as member_loans FROM loans WHERE cycle_id=? status='active' AND member_id=?`).get(cycle_id, member_id).member_loans;

    if (memberLoanInfo > 0) {
        return {
            eligible: false,
            reason: 'EXISTING_ACTIVE_LOAN',
            message: 'REVOKED. You already have an existing active loan.'
        };
    }

    const maximumLoanAmount = memberSavingsInfo * 3;
    if (requested_amount > maximumLoanAmount) {
        return {
            eligible: false,
            reason: 'EXCEEDING_MEMBER_LOAN_LIMIT',
            message: `REVOKED. You can only borrow up to 3X your ${memberSavingsInfo} RWF savings.`
        }
    }

    return {
        eligible: true,
        message: 'Loan is within safe limits.'
    };
}   

module.exports = { checkLoanEligibility };