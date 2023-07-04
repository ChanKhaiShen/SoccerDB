const mongoose = require('mongoose');

const databaseUrl = 'mongodb+srv://cks:phgKHFEsoMjL3VAo@cluster0.z5ffg.mongodb.net/SoccerDB';

mongoose.connect(databaseUrl).then(()=>{
    console.log('Connected to database');
}).catch(()=>{
    console.log('Cannot connect ro database');
});

const eventSchema = new mongoose.Schema({
    name: {type: String},
    league: {type: String},
    season: {type: String},
    round: {type: String},
    date: {type: String},
    venue: {type: String},
    video: {type: String},
    homeTeam: {type: String},
    awayTeam: {type: String},
    homeScore: {type: String},
    awayScore: {type: String},
    bookmarkedOn: {type: String},
    user: {type: String}
});

const eventModel = mongoose.model('events', eventSchema);

module.exports = eventModel;
