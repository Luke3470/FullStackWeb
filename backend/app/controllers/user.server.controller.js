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
        //password regex
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send({ error_message: error.message });

        const salt = crypto.randomBytes(64).toString();
        const hash = getHash(salt, req.body.password);

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
    return res.sendStatus(500);
}

const logOut = (req, res) => {
    return res.sendStatus(500);
}

const getAccount = (req, res) =>{
    return res.sendStatus(500);
}


module.exports = {
    createAccount: createAccount,
    logIn: logIn,
    logOut: logOut,
    getAccount: getAccount
}