const question = require("../controllers/question.server.controller");


module.exports = function (app){
    app.route("/item/:item_id/question").get(question.getItemQuestions);
    app.route("/item/:item_id/question").post(question.postItemQuestions);
    app.route("/question/:question_id").post(question.postQuestionById);
}
