const mongoose = require("mongoose");
const connection = require('../connection/Connection');

//Create the model entity object
require("../models/User");
const User = mongoose.model("User");

// mongoose.Promise = global.Promise;
connection.connectionDb.then((res) => {
    // res.on('error', console.error.bind(console, 'connection error:'));
    console.log("Database connected");
});
const user = {
    "username": "admin",
    "password": "havenAdmin**",
    "email": "admin@havenofbundles.net",
    "type": "admin"
};
function isEmpty(obj) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

module.exports = {
    createIfNotExistAdminUser: User.find({username: 'admin'}).then((existingAdmin) => {
        const userAdmin = new User(user);
        console.log("userAdmin", existingAdmin);
        if (isEmpty(existingAdmin)) {
            console.log("userAdmin", existingAdmin);
            userAdmin.save().then(() => {
                console.log("User admin is created");
            }).catch((err) => {
                if (err) {
                    throw err;
                }
            });
        }
    }),
};
