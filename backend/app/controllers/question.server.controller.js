const joi = require('joi');
const model  = require('../models/question.server.model');

const { getUserID } = require('../lib/utils');

const getItemQuestions = async (req, res) => {
    const itemId = req.params.item_id;
    try {
        await model.getItemById(itemId);
        const questions = await model.getQuestionsByItemId(itemId);

        return res.status(200).json(questions);
    } catch (err) {
        if (err.status === 404 || err.message === 'Item not found') {
            return res.status(404).json({ error_message: 'Item not found' });
        }
        return res.status(500).json({ error_message: 'Database error', error: err.message });
    }
}

const postItemQuestions = async (req, res) => {
    const schema = joi.object({
        question_text: joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error_message: error.message });

    const token = req.headers['x-authorization'];
    let userId;
    try {
        userId = await getUserID(token);
    } catch (err) {
        return res.status(401).json({ error_message: 'Invalid session token' });
    }

    const itemId = req.params.item_id;

    try {
        const item = await model.getItemById(itemId);

        if (item.creator_id === userId) {
            return res.status(403).json({ error_message: 'You cannot ask a question on your own item' });
        }

        await model.createQuestion(itemId, userId, req.body.question_text);

        return res.sendStatus(200);

    } catch (err) {
        if (err.status === 404 || err.message === 'Item not found') {
            return res.status(404).json({ error_message: 'Item not found' });
        }
        return res.status(500).json({ error_message: 'Database error', error: err.message });
    }
}


const postQuestionById = async (req, res) => {
    const schema = joi.object({
        answer_text: joi.string().required()
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error_message: error.message });

    const token = req.headers['x-authorization'];
    if (!token) return res.sendStatus(401);

    let userId;
    try {
        userId = await getUserID(token);
    } catch {
        return res.sendStatus(401);
    }

    const questionId = req.params.question_id;

    try {
        const question = await model.getQuestionWithItem(questionId);

        if (question.creator_id !== userId) {
            return res.sendStatus(403);
        }

        await model.answerQuestion(questionId, req.body.answer_text);

        return res.sendStatus(200);

    } catch (err) {
        if (err.status === 404) {
            return res.sendStatus(404);
        }
        return res.status(500).json({ error_message: 'Database error', error: err.message });
    }
}

module.exports = {
    postQuestionById,
    postItemQuestions,
    getItemQuestions
}