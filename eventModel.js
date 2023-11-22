const mongoose = require('mongoose');

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
