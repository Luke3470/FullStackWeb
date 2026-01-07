const db = require('../../database')
const crypto = require("crypto");

const getHash = function (password, salt) {
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
}

const getUserID = function(token) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT user_id FROM users WHERE session_token = ?';
        db.get(sql, [token], (err, row) => {
            if (err) return reject(err);
            if (!row) return reject(new Error('Invalid token'));
            resolve(row.user_id);
        });
    });
}

module.exports = {
    getHash: getHash,
    getUserID: getUserID,
};