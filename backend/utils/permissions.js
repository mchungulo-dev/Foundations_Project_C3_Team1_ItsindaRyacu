// Who may do what. Keep in step with frontend/src/lib/permissions.ts so the
// screens a user sees match what the API lets them do.

const ALL = ['admin', 'chairperson', 'treasurer', 'secretary', 'member'];
const OFFICERS = ['admin', 'chairperson', 'treasurer', 'secretary'];

const allowed = {
    viewGroupFigures: OFFICERS,
    recordSavings: ['admin', 'treasurer'],
    verifySavings: ['admin', 'chairperson'],
    manageCycles: ['admin'],
    applyLoan: ALL,
    decideLoan: ['admin', 'chairperson'],
    payLoan: ['admin', 'treasurer'],
    manageMeetings: ['admin', 'chairperson', 'secretary'],
    issueFine: ['admin', 'chairperson', 'secretary'],
    markFinePaid: ['admin', 'treasurer'],
    previewShareOut: ['admin', 'chairperson', 'treasurer'],
    executeShareOut: ['admin'],
    viewMembers: OFFICERS,
    addMember: ['admin', 'secretary'],
    editMember: ['admin', 'secretary'],
    manageMembers: ['admin'],
    editGroup: ['admin'],
    manageInvitations: ['admin', 'chairperson', 'secretary'],
};

function can(action, role) {
    const roles = allowed[action];
    if (!roles) {
        // A typo in an action name should fail loudly, not silently deny.
        throw new Error(`Unknown permission action: ${action}`);
    }
    return role !== undefined && roles.includes(role);
}

module.exports = { can, allowed };
