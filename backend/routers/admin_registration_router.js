const router = require('express').Router()
const db = require('../config/database')
const bcrypt = require('bcrypt')
const Joi = require('joi')

// Registration validation schema
const registrationSchema = Joi.object({

    group_name: Joi.string().trim().min(2).max(100).required(),
    admin_email: Joi.string().trim().email().lowercase().required(),
    password: Joi.string().min(8).max(128).required(),
    member_name: Joi.string().trim().min(2).max(100).required(),
    phone: Joi.string().trim().pattern(/^[0-9+]{10,15}$/).required(),
    national_id_number: Joi.string().trim().required(),
    savings_amount: Joi.number().positive().allow(null),
    location: Joi.string().trim().max(150).allow('', null),
    meeting_day: Joi.string().trim().max(20).allow('', null),
    meeting_time: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).allow(null),
    start_date: Joi.string().isoDate().allow(null)

}).options({ abortEarly: false });


router.route('/register').post(async(req, res) => {
    try {

         // Validating the request body using Joi
        const { error, value } = registrationSchema.validate(req.body);

        if (error) {
            return res.status(400).json({message: 'Validation failed!', errors: error.details.map(detail => detail.message)});
        }

        const {
            group_name,
            admin_email,
            password,
            member_name,
            phone,
            national_id_number,
            savings_amount,
            location,
            meeting_day,
            meeting_time,
            start_date
        } = value;

        // Check whether admin email already exists
        const existingGroup = db.prepare(`SELECT account_id FROM group_account WHERE admin_email=?`).get(admin_email)

        const existingMember = db.prepare(`SELECT member_id FROM members WHERE email = ?`).get(admin_email);

        if (existingGroup || existingMember) {
            return res.status(409).json({message: "A group with this admin email already exists!"})
        }

        // Hash the password
        const saltPassword = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, saltPassword)

        // Registration of the group and admin at once:
        const registerGroup = db.transaction(() => {

            const groupResult = db.prepare(`
                INSERT INTO group_account (
                    group_name,
                    admin_email,
                    admin_password_hash,
                    savings_amount,
                    location,
                    meeting_day,
                    meeting_time,
                    start_date,
                    is_active,
                    created_at,
                    updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `).run(
                group_name,
                admin_email,
                hashedPassword,
                savings_amount ?? null,
                location ?? null,
                meeting_day ?? null,
                meeting_time ?? null,
                start_date ?? null,
                1
            );

            const accountId = groupResult.lastInsertRowid;
            db.prepare(`
                INSERT INTO members (
                    account_id, member_name, email, phone,
                    national_id_number, password_hash, role, is_active
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                accountId,
                member_name,
                admin_email,
                phone,
                national_id_number,
                hashedPassword,
                'admin',
                1
            );

            return accountId;

        });

        const accountId = registerGroup();

        return res.status(201).json({message: 'Savings group registered successfully!', account_id: accountId, group_name, admin_email});

    } catch (error) {

        console.error('Registration Error:', error);

        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({message: 'Email, phone number or national ID already exists!'});
        }

        return res.status(500).json({message: 'Internal Server Error!'});

    }

});

module.exports = router;
