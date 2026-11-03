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

module.exports = router;