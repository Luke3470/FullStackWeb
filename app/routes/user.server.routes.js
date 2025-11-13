const user = require("app/controllers/user.server.controller.js");

module.exports = function (app){
    app.route("/users/:id").get(user.getAccount);
    app.route("/login").post(user.logIn);
    app.route("/logout").post(user.logOut);
    app.route("/users").post(user.createAccount);
}