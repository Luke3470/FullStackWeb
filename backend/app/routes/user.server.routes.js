const user = require("../controllers/user.server.controller");

module.exports = function (app) {
    app.route("/users/:user_id").get(user.getAccount);
    app.route("/login").post(user.logIn);
    app.route("/logout").post(user.logOut);
    app.route("/users").post(user.createAccount);
};