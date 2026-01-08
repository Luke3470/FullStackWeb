const joi = require('joi');

const { getUserID } = require('../lib/utils');
const model  = require('../models/core.server.model');

const search = async (req, res) => {
    try {
        const { q = '', status = 'ALL', limit = 20, offset = 0 } = req.query;

        const results = await model.searchItems({
            q,
            status,
            limit,
            offset,
            token: req.headers['x-authorization']
        });

        res.status(200).json(results);
    } catch (err) {
        if (err.status) return res.status(err.status).json({ error_message: err.message });

        res.status(500).json({error_message: 'Database error', error: err});
    }
};

const createItem = async (req, res) => {
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
    if (error) {
        return res.status(400).json({ error_message: error.message });
    }

    try {
        const itemId = await model.createItem({
            token,
            name: req.body.name,
            description: req.body.description,
            starting_bid: req.body.starting_bid,
            end_date: req.body.end_date
        });

        return res.status(201).json({ item_id: itemId });
    } catch (err) {
        return res.status(500).json({
            error_message: err.message || 'Database error'
        });
    }
};

const getItem = async (req, res) => {
    const itemId = req.params.item_id;

    try {
        const item = await model.getItemById(itemId);
        return res.status(200).json(item);
    } catch (err) {
        if (err.status === 404) {
            return res.status(404).json({ error_message: err.message });
        }

        return res.status(500).json({
            error_message: 'Database error',
            error: err.message
        });
    }
};


const placeBid = async (req, res) => {
    try {
        const token = req.headers['x-authorization'];
        if (!token) {
            return res.status(401).json({ error_message: 'Unauthorized' });
        }

        const itemId = req.params.item_id;
        const userID = await getUserID(token);

        const item = await model.getItemForBidding(itemId, userID);

        const schema = joi.object({
            amount: joi.number().integer().min(1).required()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error_message: error.message });
        }

        const highestBid = await model.getHighestBid(itemId);
        const bidAmount = Number(value.amount);
        const startingBid = Number(item.starting_bid);

        const isInvalid =
            (highestBid > 0 && bidAmount <= highestBid) ||
            (highestBid === 0 && bidAmount <= startingBid);

        if (isInvalid) {
            return res.status(400).json({
                error_message: 'Bid must be higher than current bid'
            });
        }

        await model.insertBid({ itemId, userID, amount: bidAmount });

        return res.status(201).json({});

    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error_message: err.message });
        }
        return res.status(500).json({ error_message: 'Database error' });
    }
};

const getBidHistory = async (req, res) => {
    const itemId = req.params.item_id;

    try {
        await model.verifyItemExists(itemId);

        const history = await model.getBidHistoryForItem(itemId);

        return res.status(200).json(history);

    } catch (err) {
        if (err.status === 404) {
            return res.status(404).json({ error_message: err.message });
        }
        return res.status(500).json({ error_message: 'Database error' });
    }
}

module.exports ={
    getBidHistory,
    placeBid,
    getItem,
    createItem,
    search
}