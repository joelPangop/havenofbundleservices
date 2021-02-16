const express = require("express");
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.set('debug', true);

const config = {
    autoIndex: false,
    // useMongoClient: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
};
// const mongoDBUrl = "mongodb+srv://root:Abc123...@havenofbundles.ekcly.mongodb.net/havenofbundles?retryWrites=true&w=majority";
const mongoDBUrl = "mongodb+srv://root:Abc123...@egoal-shoppingdb.piyf9.mongodb.net/havenofbundles?retryWrites=true&w=majority";
const mongoUrl = "mongodb://127.0.0.1:27017/havenofbundles";
// const mongoUrl = "mongodb://127.0.0.1:27017/havenofbundles" || process.env.mongodb_url;

module.exports = {
    connectionDb: mongoose.connect(mongoUrl || mongoDBUrl, config).then(() => {
       console.log('connected to mongoBd')
    }).catch((err) => {
        console.log(err);
    }),
};
