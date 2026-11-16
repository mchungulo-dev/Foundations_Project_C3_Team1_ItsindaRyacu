const router = require('express').Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

// Member validation schema
const memberSchema = Joi.object({
    member_name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().trim().email().lowercase().required(),
    password: Joi.string().min(8).max(128).required(),
    phone: Joi.string().trim().pattern(/^[0-9+]{10,15}$/).required(),
    national_id_number: Joi.string().trim().required()
}).options({ abortEarly: false });

const updateMemberSchema = Joi.object({
    member_name: Joi.string().trim().min(2).max(100),
    email: Joi.string().trim().email().lowercase(),
    phone: Joi.string().trim().pattern(/^[0-9+]{10,15}$/),
    national_id_number: Joi.string().trim()
}).min(1).options({ abortEarly: false });

// Verify that the request comes from an admin
const getAdminFromToken = (req, res) => {

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({message: 'Authentication token required!'});
        return null;
    }

    try {

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        if (decodedToken.role !== 'admin') {
            res.status(403).json({message: 'Only admins can perform this action!'});
            return null;
        }

        return decodedToken;

    } catch (error) {

        res.status(401).json({message: 'Invalid or expired token!'});
        return null;
    }
};

router.route('/add-member').post(async (req, res) => {

    try {

        // Validate request body
        const { error, value } = memberSchema.validate(req.body);

        if (error) {return res.status(400).json({
            message: 'Validation failed!', 
            errors: error.details.map(detail => detail.message)});
        }

        const {member_name, email, password, phone, national_id_number} = value;

        // Check whether email, phone number or national ID already exists
        const existingMember = db.prepare(`SELECT member_id FROM members WHERE email = ? OR phone = ? OR national_id_number = ?`).get(email, phone, national_id_number);

        if (existingMember) {
            return res.status(409).json({message: 'Email, phone number or national ID already exists!'});
        }

        // Hash the member's default password from the admin
        const saltPassword = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, saltPassword);

        // Ensuring that one else can add a member in the group
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({message: 'Authentication token required!'});
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        if (decodedToken.role !== 'admin') {
            return res.status(403).json({message: 'Only admins can add members!'});
        }

        // Register the new member under the admin's savings group
        const addMember = db.prepare(`INSERT INTO members (account_id, member_name, email, phone, national_id_number, password_hash, role, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(decodedToken.account_id, member_name, email, phone, national_id_number, hashedPassword, 'member', 1);

        return res.status(201).json({message: 'Member added successfully!', member_id: addMember.lastInsertRowid, member_name, email});

    } catch (error) {

        console.error('Add Member Error:', error);

        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({message: 'Email, phone number or national ID already exists!'});
        }

        return res.status(500).json({message: 'Internal Server Error!'});
    }

});

router.route('/members').get((req, res) => {

    try {

        const decodedToken = getAdminFromToken(req, res);
        if (!decodedToken) return;

        const members = db.prepare(`
            SELECT
                member_id,
                member_name,
                email,
                phone,
                national_id_number,
                role,
                is_active,
                created_at
            FROM members
            WHERE account_id = ?
        `).all(decodedToken.account_id);

        return res.status(200).json({message: 'Members retrieved successfully!', total_members: members.length, members});

    } catch (error) {
        console.error('View Members Error:', error);
        return res.status(500).json({message: 'Internal Server Error!'});
    }

});

router.route('/member/:id').get((req, res) => {

    try {

        const decodedToken = getAdminFromToken(req, res);
        if (!decodedToken) return;

        const member = db.prepare(`
            SELECT
                member_id,
                member_name,
                email,
                phone,
                national_id_number,
                role,
                is_active,
                created_at
            FROM members
            WHERE member_id = ? AND account_id = ?
        `).get(req.params.id, decodedToken.account_id);

        if (!member) {
            return res.status(404).json({message: 'Member not found!'});
        }

        return res.status(200).json({message: 'Member retrieved successfully!', member});

    } catch (error) {
        console.error('View Member Error:', error);
        return res.status(500).json({message: 'Internal Server Error!'});
    }

});

router.route('/update-member/:id').put((req, res) => {

    try {

        const decodedToken = getAdminFromToken(req, res);
        if (!decodedToken) return;

        // Validate request body
        const { error, value } = updateMemberSchema.validate(req.body);

        if (error) {
            return res.status(400).json({message: 'Validation failed!', errors: error.details.map(detail => detail.message)});
        }

        // Check whether the member belongs to the admin's group
        const existingMember = db.prepare(`
            SELECT member_id
            FROM members
            WHERE member_id = ? AND account_id = ?
        `).get(req.params.id, decodedToken.account_id);

        if (!existingMember) {
            return res.status(404).json({message: 'Member not found!'});
        }

        // Check for duplicate email, phone or national ID
        const duplicateFields = ['email', 'phone', 'national_id_number'].filter(field => value[field] !== undefined);

        if (duplicateFields.length > 0) {

            const conditions = duplicateFields.map(field => `${field} = ?`).join(' OR ');

            const duplicateMember = db.prepare(`SELECT member_id FROM members WHERE (${conditions}) AND member_id != ?`)
            .get(...duplicateFields.map(field => value[field]), req.params.id);

            if (duplicateMember) {
                return res.status(409).json({message: 'Email, phone number or national ID already exists!'});
            }
        }

        // This is to dynamically construct the UPDATE query
        const fields = Object.keys(value);

        const updates = fields.map(field => `${field} = ?`).join(', ');

        const values = fields.map(field => value[field]);

        db.prepare(`UPDATE members SET ${updates} WHERE member_id = ? AND account_id = ?`).run(...values, req.params.id, decodedToken.account_id);

        return res.status(200).json({message: 'Member updated successfully!'});

    } catch (error) {

        console.error('Update Member Error:', error);

        return res.status(500).json({message: 'Internal Server Error!'});
    }

});


router.route('/delete-member/:id').delete((req, res) => {

    try {

        const decodedToken = getAdminFromToken(req, res);
        if (!decodedToken) return;

        const result = db.prepare(`
            UPDATE members
            SET is_active = 0
            WHERE member_id = ?
              AND account_id = ?
              AND role = 'member'
              AND is_active = 1
        `).run(req.params.id, decodedToken.account_id);

        if (result.changes === 0) {
            return res.status(404).json({message: 'Member not found or already deactivated!'});
        }

        return res.status(200).json({message: 'Member deactivated successfully!'});

    } catch (error) {
        console.error('Delete Member Error:', error);
        return res.status(500).json({message: 'Internal Server Error!'});
    }

});

module.exports = router;