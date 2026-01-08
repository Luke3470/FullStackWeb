const joi = require('joi');

require('../lib/utils')
const {getHash} = require("../lib/utils");
const crypto = require('crypto');
const model = require('../models/user.server.model');

const createAccount = async (req, res) => {
    const schema = joi.object({
        first_name: joi.string().required(),
        last_name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string()
            .min(8)
            .max(32)
            .pattern(/(?=.*[a-z])/)
            .pattern(/(?=.*[A-Z])/)
            .pattern(/(?=.*\d)/)
            .pattern(/(?=.*[!@#$%^&*])/)
            .required()
            .messages({
                'string.pattern.base':
                    'Password must include uppercase, lowercase, number, and special character (!@#$%^&*)',
                'string.empty': 'Password cannot be empty',
                'string.min': 'Password must be at least 8 characters long',
                'string.max': 'Password cannot exceed 32 characters',
                'any.required': 'Password is required'
            })
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error_message: error.message });
    }

    try {
        const userId = await model.createUser({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: req.body.password
        });

        return res.status(201).json({ user_id: userId });

    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ error_message: 'Email already exists' });
        }

        return res.status(500).json({ error_message: err.message || err });
    }
};


const logIn = async (req, res) => {
    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error_message: error.message });


    try {
        const user = await model.getUserByEmail(req.body.email);
        const salt = user.salt ? Buffer.from(user.salt, 'hex') : Buffer.from('');
        const hashedPassword = getHash(req.body.password, salt);

        if (hashedPassword !== user.password) {
            return res.status(400).json({ error_message: 'Invalid password' });
        }

        if (user.session_token) {
            return res.status(200).json({
                user_id: user.user_id,
                session_token: user.session_token
            });
        }

        const newToken = crypto.randomBytes(16).toString('hex');
        await model.updateSessionToken(user.user_id, newToken);

        return res.status(200).json({
            user_id: user.user_id,
            session_token: newToken
        });

    } catch (err) {
        if (err.status === 404) return res.status(404).json({ error_message: err.message });


        return res.status(500).json({error_message: err.message });
    }
};


const logOut = async (req, res) => {
    const token = req.headers['x-authorization'];

    if (!token) {
        return res.status(401).json({ error_message: 'No authentication token provided' });
    }

    let user;
    try {
        user = await model.getUserByToken(token);
    } catch (err) {
        return res.status(500).json({ error_message: err.message });
    }

    if (!user) {
        return res.status(401).json({ error_message: 'Invalid or expired session token' });
    }

    try {
        await model.clearSessionToken(user.user_id);
    } catch (err) {
        return res.status(500).json({ error_message: err.message });
    }

    return res.status(200).json({ message: 'Logged out successfully' });
};


const getAccount = async (req, res) => {
    const userId = req.params.user_id;
    const nowEpoch = Math.floor(Date.now() / 1000);

    try {
        const user = await model.getUserById(userId);

        const [selling, bidding, ended] = await Promise.all([
            model.getSellingItems(userId).catch(() => []),
            model.getBiddingItems(userId).catch(() => []),
            model.getEndedAuctions(userId, nowEpoch).catch(() => [])
        ]);

        const mapItem = row => ({
            item_id: row.item_id,
            name: row.name,
            description: row.description,
            end_date: row.end_date,
            creator_id: row.creator_id,
            first_name: row.creator_first,
            last_name: row.creator_last
        });

        const response = {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            selling: selling.map(mapItem),
            bidding_on: bidding.map(mapItem),
            auctions_ended: ended.map(mapItem)
        };
        console.log(response)
        return res.status(200).json(response);

    } catch (err) {
        console.error('DB Error:', err);
        if (err.status === 404 || err.message === 'User not found') {
            return res.status(404).json({ error_message: 'User not found' });
        }

        return res.status(500).json({ error_message: 'Database error', error: err.message });
    }
};

module.exports = {
    createAccount,
    logIn,
    logOut,
    getAccount
}