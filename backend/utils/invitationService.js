const db = require('../config/database.js');
const { generateInviteCode } = require('./codeGenerator.js');


const createInvitation = async (account_id, member_id, role_assigned, invited_by, expirationHours = 24) => {
    const code = generateInviteCode();
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString();
    
    const sqlInvites = `INSERT INTO invitations (account_id, invite_token, member_id, role_assigned, expires_at, invited_by) VALUES (?,?,?,?,?,?)`;

    try{
        const results = db.runAsync(sqlInvites, [account_id, code, member_id, role_assigned, expiresAt, invited_by]);
        return {success: true, code, expiresAt, inviteID: results.lastID};
    } catch (error) {
        if(error.message.includes('UNIQUE constraint failed')){
            return createInvitation(account_id, member_id, role_assigned,invited_by, expirationHours);
        }
        throw new Error(`Invitation creation faile: ${error.message}`);
    }
};

const redeemInvitation = async (code, memberId) => {
    const retriveCodeInfo = `SELECT * FROM invitations WHERE member_id = ? AND invite_token = ?`;
    const updateInvites = `UPDATE invitations SET status = ?, accepted_at = ? WHERE invite_token = ? `;
    const updateMembers = `UPDATE members SET role = ?, invite_id = ?, WHERE member_id = ? `;

    await db.runAsync('BEGIN TRANSACTION');
    try{
        const invitation = db.getAsync(retriveCodeInfo, [code]);

        // Check invitation code validity
        if(!invitation) throw new Error('Invitation code does not exist!');
        if(new Date(invitation.expires_at) < new Date()) throw new Error('Invitation code has expired!');
        if(invitation.accepted_at !== null) throw new Error('Invitation code has already been used!');

        // Update the invites if the invite code is viable
        const now = new Date().toISOString();
        await db.runAsync(updateInvites, ['accepted', now, invitation.invitation_id]);
        // Update the members table if the invite code is unique and passes all the checks
        await db.runAsync(updateMembers, [invitation.role_assigned, invitation.invitation_id, memberId]);
        await db.runAsync('COMMIT');
        return { success: true, groupID: invitation.account_id, invitationID: invitation.invitation_id, message: 'Successfully joined the group'};

    } catch (error) {
        await db.runAsync('ROLLBACK');
        throw error;
    }
};

const deleteExpiredInvites = async () => {
    const now = new Date().toISOString();
    const expiredUnusedTokens = `DELETE * FROM invitations WHERE expires_at < ? AND accepted_at IS NULL`;
    
    const results = await db.runAsync(expiredUnusedTokens, [now]);

    return {CleanedUpRecords: results.changes};
};

module.exports = { createInvitation, redeemInvitation, deleteExpiredInvites }