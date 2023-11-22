const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {type: String},
    password: {type: String},
    salt: {type: String},
    registerDate: {type: Date, default: Date.now}
});

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;
