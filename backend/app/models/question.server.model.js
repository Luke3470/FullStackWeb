const db = require('../../database');
const { getUserID } = require('../lib/utils');

async function getItemById(itemId) {
    const sql = 'SELECT * FROM items WHERE item_id = ?';
    return new Promise((resolve, reject) => {
        db.get(sql, [itemId], (err, row) => {
            if (err) return reject(err);
            if (!row) {
                const error = new Error('Item not found');
                error.status = 404;
                return reject(error);
            }
            resolve(row);
        });
    });
}

async function getQuestionsByItemId(itemId) {
    const sql = `
        SELECT 
            question_id, 
            question AS question_text, 
            answer AS answer_text 
        FROM questions 
        WHERE item_id = ? 
        ORDER BY question_id DESC
    `;
    return new Promise((resolve, reject) => {
        db.all(sql, [itemId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows || []);
        });
    });
}

async function createQuestion(itemId, userId, questionText) {
    const sql = `INSERT INTO questions (question, asked_by, item_id) VALUES (?, ?, ?)`;
    return new Promise((resolve, reject) => {
        db.run(sql, [questionText, userId, itemId], function (err) {
            if (err) return reject(err);
            resolve(this.lastID);
        });
    });
}

async function getQuestionWithItem(questionId) {
    const sql = `
        SELECT q.question_id, q.item_id, i.creator_id 
        FROM questions q 
        JOIN items i ON q.item_id = i.item_id 
        WHERE q.question_id = ?
    `;
    return new Promise((resolve, reject) => {
        db.get(sql, [questionId], (err, row) => {
            if (err) return reject(err);
            if (!row) {
                const error = new Error('Question not found');
                error.status = 404;
                return reject(error);
            }
            resolve(row);
        });
    });
}

async function answerQuestion(questionId, answerText) {
    const sql = `UPDATE questions SET answer = ? WHERE question_id = ?`;
    return new Promise((resolve, reject) => {
        db.run(sql, [answerText, questionId], function (err) {
            if (err) return reject(err);
            resolve();
        });
    });
}

module.exports = {
    getItemById,
    getQuestionsByItemId,
    createQuestion,
    getQuestionWithItem,
    answerQuestion

};