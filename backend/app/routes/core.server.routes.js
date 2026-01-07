const core = require("../controllers/core.server.controller");
const auth = require("../lib/middleware");

module.exports = function (app) {

    app.route("/search")
        .get(core.search);
    app.route("/item")
        .post(auth,core.createItem);
    app.route("/item/:item_id")
        .get(core.getItem);
    app.route("/item/:item_id/bid")
        .post(auth,core.placeBid)
        .get(core.getBidHistory);
};
