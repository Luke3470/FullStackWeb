const joi = require('joi');
const db = require('../../database');

require('../lib/utils')
const {getHash} = require("../lib/utils");
const crypto = require('crypto');

const createAccount = async (req, res) => {
    try {
        const schema = joi.object({
            first_name: joi.string().required(),
            last_name: joi.string().required(),
            email: joi.string().email().required(),
            password: joi.string().min(8)
                .max(32)
                .pattern(new RegExp('(?=.*[a-z])'))
                .pattern(new RegExp('(?=.*[A-Z])'))
                .pattern(new RegExp('(?=.*\\d)'))
                .pattern(new RegExp('(?=.*[!@#$%^&*])'))
                .required()
                .messages({
                    'string.pattern.base': `Password must include uppercase, lowercase, number, and special character (!@#$%^&*)`,
                    'string.empty': `Password cannot be empty`,
                    'string.min': `Password must be at least 8 characters long`,
                    'string.max': `Password cannot exceed 32 characters`,
                    'any.required': `Password is required`
                }),
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send({ error_message: error.message });

        const salt = crypto.randomBytes(64)
        const hash = getHash(req.body.password, salt);

        const account = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: hash,
            salt: salt,
        };

        const userId = await new Promise((resolve, reject) => {
            const sql = 'INSERT INTO users (first_name, last_name, email, password, salt) VALUES (?,?,?,?,?)';
            db.run(sql, [account.first_name, account.last_name, account.email, account.password, account.salt], function(err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });

        return res.status(201).send({ user_id: userId });

    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).send({ error_message: 'Email already exists' });
        }
        console.error(err.message);
        return res.status(500).send({ message: 'Database error', error: err });
    }
};


const logIn = (req, res) => {
    try {
        const schema = joi.object({
            email: joi.string().email().required(),
            password: joi.string().required()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send({ error_message: error.message });

        const sql = 'SELECT user_id, password, salt, session_token FROM users WHERE email = ?';
        db.get(sql, [req.body.email], (err, row) => {
            if (err) return res.status(400).send({ error_message: err.message });
            if (!row) return res.status(404).send({ error_message: 'User not found' });

            const salt = row.salt ? Buffer.from(row.salt, 'hex') : Buffer.from('');
            const hashedPassword = getHash(req.body.password,salt);

            if (row.password !== hashedPassword) {
                return res.status(400).send({ error_message: 'Invalid password' });
            }

            if (row.session_token) {
                return res.status(200).send({ user_id: row.user_id, session_token: row.session_token });
            }

            const token = crypto.randomBytes(16).toString('hex');
            const token_sql = 'UPDATE users SET session_token=? WHERE user_id=?';
            db.run(token_sql, [token, row.user_id], (err) => {
                if (err) return res.status(400).send({ error_message: err.message });
                return res.status(200).send({ user_id: row.user_id, session_token: token });
            });
        });

    } catch (error) {
        return res.status(500).send({ error_message: error.message });
    }
};


const logOut = async (req, res) => {
    try {
        const token = req.headers['x-authorization'];
        if (!token) {
            return res.status(401).send({ message: 'No authentication token provided' });
        }

        const user = await new Promise((resolve, reject) => {
            const sql = 'SELECT user_id FROM users WHERE session_token = ?';
            db.get(sql, [token], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });

        if (!user) {
            return res.status(401).send({ message: 'Invalid or expired session token' });
        }

        await new Promise((resolve, reject) => {
            const sql = 'UPDATE users SET session_token = NULL WHERE user_id = ?';
            db.run(sql, [user.user_id], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        return res.status(200).send({ message: 'Logged out successfully' });

    } catch (err) {
        return res.status(500).send({ error_message: err.message });
    }
};


const getAccount = (req, res) =>{
    return res.sendStatus(500);
}


module.exports = {
    createAccount: createAccount,
    logIn: logIn,
    logOut: logOut,
    getAccount: getAccount
}