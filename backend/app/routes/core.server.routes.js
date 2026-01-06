const core = require("../controllers/core.server.controller");

module.exports = function (app) {

    app.route("/search")
        .get(core.search);
    app.route("/item")
        .post(core.createItem);
    app.route("/item/:item_id")
        .get(core.getItem);
    app.route("/item/:item_id/bid")
        .post(core.placeBid)
        .get(core.getBidHistory);
};
