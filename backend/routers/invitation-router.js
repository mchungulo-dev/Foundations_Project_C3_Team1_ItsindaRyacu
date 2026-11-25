const express = require('express');
const router = express.Router();
const { protect, adminOrChairperson } = require('../middleware/auth.js');
const invitationService = require('../utils/invitationService.js');

// POST /api/invitation - create invitation tokens for joining the group
router.post('/create', protect, adminOrChairperson, async (req, res) => {
    try {
        let { account_id, member_id, role_assigned, expirationHours } = req.body;
        const invitedBy = req.user.member_id;

        if (!account_id || !member_id) {
            return res.status(400).json({ message: 'Group ID and Member ID requiered' });
        }

        if (!role_assigned) return role_assigned = 'member';

        const results = await invitationService.createInvitation(account_id, member_id, role_assigned, invitedBy, expirationHours);
        res.status(201).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/invitation
router.post('/redeem', protect, async (req, res) => {
    try {
        const code = req.body;
        const memberID = req.user.member_id;

        if(!code) {
            return res.status(400).json({ message: 'Invitation code is required!'});
        }

        const results = await invitationService.redeemInvitation(code, memberID);
        res.status(201).json(results);
    } catch (error) {
        const status = error.message.includes('Invalid') || error.message.includes('expired') || error.message.includes('already been used') ? 400 : 
        500;
        res.status(status).json({ error: error.message});
    }  
});

module.exports = router;
