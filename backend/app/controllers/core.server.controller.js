const joi = require('joi');
const db = require('../../database');

const { getUserID } = require('../lib/utils');

exports.search = async (req, res) => {
    try {
        const { q = '', status = 'ALL', limit = 20, offset = 0 } = req.query;
        const nowEpoch = Math.floor(Date.now() / 1000);

        let userID;
        if ((status === 'BID')||(status === 'OPEN')) {
            const token = req.headers['x-authorization'];
            if (!token) return res.status(400).json({ error_message: 'User is not logged in' });
            userID = await getUserID(token);
        }

        let sql = `
            SELECT items.*, u.first_name AS creator_first, u.last_name AS creator_last
            FROM items
            JOIN users u ON items.creator_id = u.user_id
            WHERE (items.name LIKE ? OR items.description LIKE ?)
        `;
        const params = [`%${q}%`, `%${q}%`];

        if (status === 'OPEN') {
            sql += ' AND items.end_date > ?';
            params.push(nowEpoch);
            sql += ' AND items.creator_id != ?';
            params.push(userID);
        } else if (status === 'ARCHIVE') {
            sql += ' AND items.end_date <= ?';
            params.push(nowEpoch);
        } else if (status === 'BID') {
            sql += ' AND items.item_id IN (SELECT item_id FROM bids WHERE user_id = ?)';
            params.push(userID);
        }else if (status !== 'ALL') {
            return res.status(400).json({ error_message: 'Status is not recognised'});
        }else{
            if(userID){
                sql += ' AND items.creator_id != ?';
                params.push(userID);
            }
        }

        sql += ' ORDER BY items.end_date ASC LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));

        db.all(sql, params, (err, items) => {
            if (err) return res.status(500).json({ error_message: 'Database error', error: err.message });

            if (!items || items.length === 0) return res.status(200).json([]);

            const getBidPromises = items.map(item => new Promise((resolve, reject) => {
                const bidSql = `
                    SELECT bids.amount, bids.user_id, users.first_name, users.last_name
                    FROM bids
                    JOIN users ON bids.user_id = users.user_id
                    WHERE bids.item_id = ?
                    ORDER BY bids.amount DESC
                    LIMIT 1
                `;
                db.get(bidSql, [item.item_id], (err, bid) => {
                    if (err) return reject(err);
                    resolve({
                        item_id: item.item_id,
                        name: item.name,
                        description: item.description,
                        starting_bid: Number(item.starting_bid),
                        start_date: Number(item.start_date),
                        end_date: Number(item.end_date),
                        creator_id: item.creator_id,
                        first_name: item.creator_first,
                        last_name: item.creator_last,
                        current_bid: bid ? Number(bid.amount) : Number(item.starting_bid),
                        current_bid_holder: bid ? {
                            user_id: bid.user_id,
                            first_name: bid.first_name,
                            last_name: bid.last_name
                        } : null
                    });
                });
            }));

            Promise.all(getBidPromises)
                .then(results => res.status(200).json(results))
                .catch(err => res.status(500).json({ error_message: 'Database error', error: err.message }));
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ error_message: error.message });
    }
};

exports.createItem = async (req, res) => {
    try {
        const token = req.headers['x-authorization'];

        const schema = joi.object({
            name: joi.string().required(),
            description: joi.string().required(),
            starting_bid: joi.number().min(0).required(),
            end_date: joi.alternatives()
                .try(joi.number().integer(), joi.string().pattern(/^\d+$/))
                .required()
                .custom((value, helpers) => {
                    const timestamp = typeof value === 'string' ? parseInt(value) : value;
                    if (timestamp < Date.now()) {
                        return helpers.error('any.invalid', { value });
                    }
                    return timestamp;
                }, 'future timestamp validation')
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send({ error_message: error.message });

        const userID = await getUserID(token);

        const item = {
            name: req.body.name,
            description: req.body.description,
            starting_bid: req.body.starting_bid,
            start_date: parseInt(Date.now()),
            end_date: parseInt(req.body.end_date),
            creator_id: userID,
        };

        const itemId = await new Promise((resolve, reject) => {
            const sql = 'INSERT INTO items (name, description, starting_bid, start_date ,end_date, creator_id) VALUES (?,?,?,?,?,?)';
            db.run(sql, [item.name, item.description, item.starting_bid, item.start_date, item.end_date, item.creator_id], function(err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });

        return res.status(201).send({ item_id: itemId });

    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).send({ error_message: 'Email already exists' });
        }
        return res.status(500).send({ message: 'Database error', error: err });
    }
};

exports.getItem = (req, res) => {
    try {

        const itemId = req.params.item_id;

        const sqlItem = `
            SELECT items.*, users.first_name AS creator_first, users.last_name AS creator_last
            FROM items
            JOIN users ON items.creator_id = users.user_id
            WHERE items.item_id = ?`;

        db.get(sqlItem, [itemId], (err, itemRow) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send({error_message: 'Database error', error: err.message});
            }

            if (!itemRow) {
                return res.status(404).send({error_message: 'Item not found'});
            }

            const sqlBid = `
                SELECT bids.amount, bids.user_id, users.first_name, users.last_name
                FROM bids
                JOIN users ON bids.user_id = users.user_id
                WHERE bids.item_id = ?
                ORDER BY bids.amount DESC
                LIMIT 1
            `;

            db.get(sqlBid, [itemId], (err, bidRow) => {
                if (err) {
                    console.error(err.message);
                    return res.status(500).send({error_message: 'Database error', error: err.message});
                }

                const response = {
                    item_id: itemRow.item_id,
                    name: itemRow.name,
                    description: itemRow.description,
                    starting_bid: itemRow.starting_bid,
                    start_date: itemRow.start_date,
                    end_date: itemRow.end_date,
                    creator_id: itemRow.creator_id,
                    first_name: itemRow.creator_first,
                    last_name: itemRow.creator_last,
                    current_bid: bidRow ? bidRow.amount : itemRow.starting_bid,
                    current_bid_holder: bidRow ? {
                        user_id: bidRow.user_id,
                        first_name: bidRow.first_name,
                        last_name: bidRow.last_name
                    } : null
                };

                return res.status(200).json(response);
            });
        });
    }catch (error){
        console.log(err.message)
        return res.status(500).send({error_message: error.message});
    }
};

exports.placeBid = async (req, res) => {
    try {
        const token = req.headers['x-authorization'];
        if (!token) {
            return res.status(401).send({ error_message: 'Unauthorized' });
        }

        const itemId = req.params.item_id;
        const userID = await getUserID(token);

        const item = await new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM items WHERE item_id = ?',
                [itemId],
                (err, row) => {
                    if (err) return reject(err);
                    if (!row) return reject({ status: 404, message: 'Item not found' });
                    if (row.creator_id === userID)
                        return reject({ status: 403, message: 'Cannot bid on your own item' });
                    if (row.end_date < Date.now())
                        return reject({ status: 400, message: 'Auction has ended' });
                    resolve(row);
                }
            );
        });

        const schema = joi.object({
            amount: joi.number().integer().min(1).required()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).send({ error_message: error.message });
        }

        const highestBid = await new Promise((resolve, reject) => {
            db.get(
                'SELECT MAX(amount) AS max_bid FROM bids WHERE item_id = ?',
                [itemId],
                (err, row) => {
                    if (err) return reject(err);
                    resolve(Number(row.max_bid) || 0);
                }
            );
        });

        const bidAmount = Number(value.amount);
        const startingBid = Number(item.starting_bid);

        if (
            (highestBid > 0 && bidAmount <= highestBid) ||
            (highestBid === 0 && bidAmount <= startingBid)
        ) {
            return res.status(400).send({
                error_message: 'Bid must be higher than current bid'
            });
        }

        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO bids (item_id, user_id, amount, timestamp) VALUES (?,?,?,?)',
                [itemId, userID, bidAmount, Date.now()],
                err => {
                    if (err) return reject(err);
                    resolve();
                }
            );
        });

        return res.status(201).send({});

    } catch (err) {
        if (err.status) {
            return res.status(err.status).send({ error_message: err.message });
        }
        return res.status(500).send({ error_message: 'Database error' });
    }
};


exports.getBidHistory = (req, res) => {
    try {
        const itemId = req.params.item_id;

        db.get(
            'SELECT item_id FROM items WHERE item_id = ?',
            [itemId],
            (err, item) => {
                if (err) {
                    return res.status(500).send({error_message: 'Database error'});
                }

                if (!item) {
                    return res.status(404).send({error_message: 'Item not found'});
                }

                const sql = `
                    SELECT 
                        bids.item_id,
                        bids.user_id,
                        users.first_name,
                        users.last_name,
                        bids.amount,
                        bids.timestamp
                    FROM bids
                    JOIN users ON bids.user_id = users.user_id
                    WHERE bids.item_id = ?
                    ORDER BY bids.amount DESC
                `;

                db.all(sql, [itemId], (err, rows) => {
                    if (err) {
                        return res.status(500).send({error_message: 'Database error'});
                    }

                    return res.status(200).json(rows);
                });
            }
        );
    }catch (error){
        return res.status(500).send({error_message: error.message});
    }
}
