const db = require('../../database');
const { getUserID } = require('../lib/utils');

async function searchItems({ q, status, limit, offset, token }) {
    const now = Date.now();
    let userID;

    if (status === 'BID' || status === 'OPEN') {
        if (!token) throw { status: 400, message: 'User is not logged in' };
        userID = await getUserID(token);
    }

    let sql = `
        SELECT items.*, u.first_name AS creator_first, u.last_name AS creator_last
        FROM items
        JOIN users u ON items.creator_id = u.user_id
        WHERE (items.name LIKE ?)
    `;
    const params = [`%${q}%`];

    if (status === 'OPEN') {
        sql += ' AND items.end_date > ? AND items.creator_id == ?';
        params.push(now, userID);
    } else if (status === 'ARCHIVE') {
        sql += ' AND items.end_date <= ?';
        params.push(now);
    } else if (status === 'BID') {
        sql += ' AND items.item_id IN (SELECT item_id FROM bids WHERE user_id = ?)';
        params.push(userID);
    } else if (status !== 'ALL') {
        throw { status: 400, message: 'Status is not recognised' };
    } else {
        if (userID) {
            sql += ' AND items.creator_id != ?';
            params.push(userID);
        }
    }

    sql += ' ORDER BY items.end_date ASC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const items = await new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows || []);
        });
    });

    if (items.length === 0) return [];

    const bidPromises = items.map(
        item =>
            new Promise((resolve, reject) => {
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
                        current_bid_holder: bid
                            ? {
                                user_id: bid.user_id,
                                first_name: bid.first_name,
                                last_name: bid.last_name
                            }
                            : null
                    });
                });
            })
    );

    return await Promise.all(bidPromises);
}

async function createItem({ token, name, description, starting_bid, end_date }) {
    const userID = await getUserID(token);

    const item = {
        name,
        description,
        starting_bid,
        start_date: Date.now(),
        end_date: Number(end_date),
        creator_id: userID
    };

    return await new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO items 
            (name, description, starting_bid, start_date, end_date, creator_id) 
            VALUES (?,?,?,?,?,?)
        `;

        db.run(
            sql,
            [
                item.name,
                item.description,
                item.starting_bid,
                item.start_date,
                item.end_date,
                item.creator_id
            ],
            function (err) {
                if (err) return reject(err);
                resolve(this.lastID);
            }
        );
    });
}

async function getItemById(itemId) {
    const sqlItem = `
        SELECT items.*, users.first_name AS creator_first, users.last_name AS creator_last
        FROM items
        JOIN users ON items.creator_id = users.user_id
        WHERE items.item_id = ?
    `;

    const itemRow = await new Promise((resolve, reject) => {
        db.get(sqlItem, [itemId], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });

    if (!itemRow) {
        const error = new Error('Item not found');
        error.status = 404;
        throw error;
    }

    const sqlBid = `
        SELECT bids.amount, bids.user_id, users.first_name, users.last_name
        FROM bids
        JOIN users ON bids.user_id = users.user_id
        WHERE bids.item_id = ?
        ORDER BY bids.amount DESC
        LIMIT 1
    `;

    const bidRow = await new Promise((resolve, reject) => {
        db.get(sqlBid, [itemId], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });

    return {
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
        current_bid_holder: bidRow
            ? {
                user_id: bidRow.user_id,
                first_name: bidRow.first_name,
                last_name: bidRow.last_name
            }
            : null
    };
}

async function getItemForBidding(itemId, userID) {
    return await new Promise((resolve, reject) => {
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
}

async function getHighestBid(itemId) {
    return await new Promise((resolve, reject) => {
        db.get(
            'SELECT MAX(amount) AS max_bid FROM bids WHERE item_id = ?',
            [itemId],
            (err, row) => {
                if (err) return reject(err);
                resolve(Number(row?.max_bid) || 0);
            }
        );
    });
}

async function insertBid({ itemId, userID, amount }) {
    return await new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO bids (item_id, user_id, amount, timestamp) VALUES (?,?,?,?)',
            [itemId, userID, amount, Date.now()],
            err => {
                if (err) return reject(err);
                resolve();
            }
        );
    });
}

async function verifyItemExists(itemId) {
    return await new Promise((resolve, reject) => {
        db.get(
            'SELECT item_id FROM items WHERE item_id = ?',
            [itemId],
            (err, row) => {
                if (err) return reject(err);
                if (!row) {
                    const error = new Error('Item not found');
                    error.status = 404;
                    return reject(error);
                }
                resolve(row);
            }
        );
    });
}

async function getBidHistoryForItem(itemId) {
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

    return await new Promise((resolve, reject) => {
        db.all(sql, [itemId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows || []);
        });
    });
}

module.exports = {
    searchItems,
    createItem,
    getItemById,
    getItemForBidding,
    insertBid,
    getHighestBid,
    getBidHistoryForItem,
    verifyItemExists
};