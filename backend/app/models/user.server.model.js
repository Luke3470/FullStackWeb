const crypto = require('crypto');
const db = require('../../database');

require('../lib/utils')
const {getHash} = require("../lib/utils");

async function createUser({ first_name, last_name, email, password }) {
    const salt = crypto.randomBytes(64);
    const hashedPassword = getHash(password, salt);

    const user = {
        first_name,
        last_name,
        email,
        password: hashedPassword,
        salt
    };

    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO users (first_name, last_name, email, password, salt)
            VALUES (?,?,?,?,?)
        `;

        db.run(
            sql,
            [user.first_name, user.last_name, user.email, user.password, user.salt],
            function (err) {
                if (err) return reject(err);
                resolve(this.lastID);
            }
        );
    });

}

async function getUserByEmail(email) {
    return await new Promise((resolve, reject) => {
        const sql = `
            SELECT user_id, password, salt, session_token
            FROM users
            WHERE email = ?
        `;

        db.get(sql, [email], (err, row) => {
            if (err) return reject(err);
            if (!row) {
                const error = new Error('User not found');
                error.status = 404;
                return reject(error);
            }
            resolve(row);
        });
    });
}

async function updateSessionToken(userId, token) {
    return await new Promise((resolve, reject) => {
        const sql = 'UPDATE users SET session_token=? WHERE user_id=?';
        db.run(sql, [token, userId], err => {
            if (err) return reject(err);
            resolve();
        });
    });
}

function getUserByToken(token) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT user_id FROM users WHERE session_token = ?';
        db.get(sql, [token], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

function clearSessionToken(userId) {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE users SET session_token = NULL WHERE user_id = ?';
        db.run(sql, [userId], err => {
            if (err) return reject(err);
            resolve();
        });
    });
}

async function getUserById(userId) {
    const sql = 'SELECT user_id, first_name, last_name, email FROM users WHERE user_id = ?';
    return await new Promise((resolve, reject) => {
        db.get(sql, [userId], (err, row) => {
            if (err) return reject(err);
            if (!row) {
                const error = new Error('User not found');
                error.status = 404;
                return reject(error);
            }
            resolve(row);
        });
    });
}

async function getSellingItems(userId) {
    const sql = `
        SELECT items.*, u.first_name AS creator_first, u.last_name AS creator_last
        FROM items
        JOIN users u ON items.creator_id = u.user_id
        WHERE items.creator_id = ?
    `;
    return await new Promise((resolve, reject) => {
        db.all(sql, [userId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows || []);
        });
    });
}

async function getBiddingItems(userId) {
    const sql = `
        SELECT DISTINCT items.*, u.first_name AS creator_first, u.last_name AS creator_last
        FROM bids
        JOIN items ON bids.item_id = items.item_id
        JOIN users u ON items.creator_id = u.user_id
        WHERE bids.user_id = ?
    `;
    return await new Promise((resolve, reject) => {
        db.all(sql, [userId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows || []);
        });
    });
}

async function getEndedAuctions(userId, nowEpoch) {
    const sql = `
        SELECT DISTINCT items.*, u.first_name AS creator_first, u.last_name AS creator_last
        FROM items
        JOIN users u ON items.creator_id = u.user_id
        LEFT JOIN bids b ON items.item_id = b.item_id
        WHERE items.end_date <= ? AND (items.creator_id = ? OR b.user_id = ?)
    `;
    return await new Promise((resolve, reject) => {
        db.all(sql, [nowEpoch, userId, userId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows || []);
        });
    });
}

module.exports = {
    createUser,
    updateSessionToken,
    getUserByEmail,
    getUserByToken,
    clearSessionToken,
    getEndedAuctions,
    getBiddingItems,
    getSellingItems,
    getUserById
};
