const mongoose = require('mongoose'), Schema = mongoose.Schema;

const DeviceSchema = new Schema({
    appBuild: {
        type: String,
        require: false
    },
    appId: {
        type: String,
        require: false
    },
    appName: {
        type: String,
        require: false
    },
    appVersion: {
        type: String,
        require: false
    },
    isVirtual: {
        type: Boolean,
        require: false
    },
    manufacturer: {
        type: String,
        require: false
    },
    model: {
        type: String,
        require: false
    },
    operatingSystem: {
        type: String,
        require: false
    },
    osVersion: {
        type: String,
        require: false
    },
    platform: {
        type: String,
        require: false
    },
    uuid: {
        type: String,
        require: false
    },
});

module.exports = mongoose.model('Device', DeviceSchema);

