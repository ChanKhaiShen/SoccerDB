const mongoose = require('mongoose');

const databaseUrl = 'mongodb+srv://cks:phgKHFEsoMjL3VAo@cluster0.z5ffg.mongodb.net/SoccerDB';

mongoose.connect(databaseUrl).then(()=>{
    console.log('Connected to database');
}).catch(()=>{
    console.log('Cannot connect ro database');
});

const userSchema = new mongoose.Schema({
    username: {type: String},
    password: {type: String}
});

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;
