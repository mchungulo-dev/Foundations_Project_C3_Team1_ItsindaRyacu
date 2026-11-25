const test = require('node:test');
const assert = require('node:assert/strict');

const {
    calculateLoanBalance
} = require('../utils/loan_calculations');

test('50,000 RWF at 5% produces 52,500 RWF total repayable', () => {
    const result = calculateLoanBalance(50000, 5, 0);

    assert.equal(result.totalRepayable, 52500);
    assert.equal(result.remainingBalance, 52500);
});

test('zero interest leaves the principal unchanged', () => {
    const result = calculateLoanBalance(50000, 0, 0);

    assert.equal(result.totalRepayable, 50000);
});

test('a 10,000 RWF payment leaves 42,500 RWF outstanding', () => {
    const result = calculateLoanBalance(50000, 5, 10000);

    assert.equal(result.remainingBalance, 42500);
});

test('full repayment leaves a zero balance', () => {
    const result = calculateLoanBalance(50000, 5, 52500);

    assert.equal(result.remainingBalance, 0);
});