const db = require('../../database');

const authenticated = async (req, res, next) => {
    try {
        const token = req.headers['x-authorization'];
        if (!token) {
            return res.status(401).json({ message: 'Missing authentication token' });
        }

        const user = await new Promise((resolve, reject) => {
            const sql = 'SELECT user_id FROM users WHERE session_token = ?';
            db.get(sql, [token], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid or expired session token' });
        }

        next();
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = authenticated;