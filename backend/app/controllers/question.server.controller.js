const joi = require('joi');
const db = require('../../database');

const { getUserID } = require('../lib/utils');

const getItemQuestions = (req, res) => {
    itemID = req.params.item_id;

    const itemExistSQL = 'Select * FROM items WHERE item_id = ?';

    db.get(itemExistSQL, [itemID], (err, item) => {
        if (err) return res.json(500).status({error_message: err.message})

        if (!item) {
            return res.status(404).json({error_message: 'Item not found'});
        }

        const questionsSQL = 'SELECT question_id, question AS question_text, answer AS answer_text FROM questions where item_id=? ORDER BY question_id DESC';

        db.all(questionsSQL, [itemID], (err, questions) => {
            if (err) return res.status(500).json({error_message: err.message})

            return res.status(200).json(questions)
        })
    });
}

const postItemQuestions = async (req, res) => {
    const schema = joi.object({
        question_text: joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            error_message: error.message
        });
    }

    const token = req.headers['x-authorization'];

    let userID;
    try {
        userID = await getUserID(token);
    } catch (err) {
        return res.status(401).json({error_message: "Invalid session token"});
    }

    const itemID = req.params.item_id;

    db.get("SELECT * FROM items WHERE item_id = ?", [itemID], (err, item) => {
            if (err) {
                return res.status(500).json({error_message: err.message});
            }

            if (!item) {
                return res.status(404).json({error_message: "Item not found"});
            }

            if (item.creator_id === userID) {
                return res.status(403).json({error_message: "You cannot ask a question on your own item"});
            }

            db.run(`INSERT INTO questions (question, asked_by, item_id)VALUES (?, ?, ?)`, [req.body.question_text, userID, itemID], function (err) {
                    if (err) {return res.status(500).json({error_message: err.message});
                    }
                    return res.sendStatus(200);
                }
            );
        }
    );
}


const postQuestionById = async (req, res) => {
    const schema = joi.object({
        answer_text: joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({error_message: error.message});


    const token =  req.headers['x-authorization'];
    if (!token) return res.sendStatus(401);

    let userID;
    try {
        userID = await getUserID(token);
    } catch {
        return res.sendStatus(401);
    }

    const questionID = req.params.question_id;

    const sql = `SELECT q.question_id, q.item_id, i.creator_id FROM questions q JOIN items i ON q.item_id = i.item_id WHERE q.question_id = ?`;

    db.get(sql, [questionID], (err, row) => {
        if (err) return res.status(500).json({error_message: err.message});

        if (!row) return res.sendStatus(404);

        if (row.creator_id !== userID) {
            return res.sendStatus(403);
        }

        const updateSQL = `UPDATE questions SET answer = ? WHERE question_id = ?`;

        db.run(updateSQL, [req.body.answer_text, questionID], function (err) {
            if (err) {
                return res.status(500).json({error_message: err.message});
            }

            return res.sendStatus(200);
        });
    });
}

module.exports = {
    postQuestionById,
    postItemQuestions,
    getItemQuestions
}