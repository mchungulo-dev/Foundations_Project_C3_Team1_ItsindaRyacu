const router = require('express').Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

// validation schema
const loginSchema = Joi.object({
    email: Joi.string().trim().email().lowercase().required(),
    password: Joi.string().required()
}).options({ abortEarly: false });

router.route('/login').post(async (req, res) => {
    try {
        
        // validate the request body
        const { error, value } = loginSchema.validate(req.body)
        if (error) {
            return res.status(400).json({message: "Validation failed!", error})
        }

        const { email, password } = value
        const user = db.prepare(`
            SELECT
                m.member_id,
                m.account_id,
                m.member_name,
                m.email,
                m.role,
                m.password_hash,
                m.is_active,
                g.group_name,
                g.is_active AS group_is_active
            FROM members AS m
            INNER JOIN group_account AS g
                ON m.account_id = g.account_id
            WHERE m.email = ?
        `).get(email)

        if(!user) {
            return res.status(401).json({message: 'Invalid email or password!'})
        }

         // Check whether account is active
        if (!user.is_active || !user.group_is_active) {
            return res.status(403).json({message: 'Your account or savings group is inactive!'});
        }

        // Check whether password exists
        if (!user.password_hash) {
            return res.status(401).json({message: 'Login credentials have not been set up for this account.'});
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({message: 'Invalid email or password!'});
        }

        // Generate authentication token
        const token = jwt.sign(
            {
                member_id: user.member_id,
                account_id: user.account_id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Determine frontend destination based on role
        const redirectTo = user.role === 'admin'
            ? '/admin'
            : '/member';

        return res.status(200).json({message: 'Login successful!', token, user: {
                member_id: user.member_id,
                account_id: user.account_id,
                member_name: user.member_name,
                email: user.email,
                role: user.role,
                group_name: user.group_name
            }, redirect_to: redirectTo});

    } catch (error) {

        console.error('Login Error:', error);

        return res.status(500).json({
            message: 'Internal Server Error!'
        });
    }
});

module.exports = router;