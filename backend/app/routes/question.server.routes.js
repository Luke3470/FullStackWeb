const question = require("../controllers/question.server.controller");
const auth = require("../lib/middleware");

module.exports = function (app){
    app.route("/item/:item_id/question").get(question.getItemQuestions);
    app.route("/item/:item_id/question").post(auth,question.postItemQuestions);
    app.route("/question/:question_id").post(auth,question.postQuestionById);
}
