
exports.search = (req, res) => {
    // Query params: q, status, limit, offset
    res.status(200).json([]);
};

exports.createItem = (req, res) => {
    res.status(201).json({ item_id: 1 });
};

exports.getItem = (req, res) => {
    res.status(200).json({
        item_id: req.params.item_id,
        name: "Henry Hoover",
        description: "Barely used henry hoover - freshly emptied",
        starting_bid: 99,
        start_date: Date.now(),
        end_date: Date.now() + 100000,
        creator_id: 1,
        first_name: "Ash",
        last_name: "Williams",
        current_bid: 120,
        current_bid_holder: {
            user_id: 2,
            first_name: "Bob",
            last_name: "Smith"
        }
    });
};

exports.placeBid = (req, res) => {
    res.sendStatus(201);
};

exports.getBidHistory = (req, res) => {
    res.status(200).json([]);
};
