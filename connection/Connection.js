const express = require("express");
const mongoose = require('mongoose');
const db_url = require('../models/db_url')

mongoose.Promise = global.Promise;
mongoose.set('debug', true);

const config = {
    autoIndex: false,
    // useMongoClient: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
};

module.exports = {
    connectionDb: mongoose.connect(db_url.url, config)
};
