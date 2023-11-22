const mongoose = require('mongoose');

const administratorSchema = new mongoose.Schema({
    username: {type: String},
    password: {type: String},
    salt: {type: String}
});

const administratorModel = mongoose.model('administrators', administratorSchema);

module.exports = administratorModel;
