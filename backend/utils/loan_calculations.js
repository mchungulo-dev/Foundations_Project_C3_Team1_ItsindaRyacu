function calculateLoanBalance(principal, interestRate, amountPaid) {
    const totalRepayable = Math.round(
        principal * (1 + interestRate / 100)
    );

    const remainingBalance = totalRepayable - amountPaid;

    return { totalRepayable, remainingBalance };
}

module.exports = { calculateLoanBalance };