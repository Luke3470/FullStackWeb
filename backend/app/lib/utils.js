const db = require('../../database')
const e = require("express");
const res = require("express/lib/response");
const crypto = require("crypto");

const getHash = function (password, salt) {
    return crypto.pbkdf2Sync(password, salt,100000,256,'sha256').toString('hex');
}

module.exports = {
    getHash: getHash
};