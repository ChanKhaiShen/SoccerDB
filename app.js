const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const mongoose = require('mongoose');

const userModel = require('./userModel');
const eventModel = require('./eventModel');
const administratorModel = require('./administratorModel');

// Database connection
const databaseUrl = 'mongodb+srv://cks:phgKHFEsoMjL3VAo@cluster0.z5ffg.mongodb.net/SoccerDB';
mongoose.connect(databaseUrl).then(()=>{
    console.log('Connected to database');
}).catch(()=>{
    console.log('Cannot connect to database');
});

const app = express();
app.use(cors({
    origin: "null"
}));

const SECRETKEY = '11911919101929nvsoiniweno230i02jnwqicqw21-ifcn';
console.log('secret key', SECRETKEY);

const signToken = (req, res, next) => {
    const authorization = req.header('Authorization');
    console.log('sign token', authorization);

    if (authorization == null || req.cookies.token != null) {
        next();
        return;
    }

    const authorizationString = authorization.split(' ')[1];
    const credentials = atob(authorizationString);
    const [username, password] = credentials.split(':');
    console.log(username, password);

    userModel.findOne({username: username}).then(result=>{
        console.log('sign token: Success find ' + result);

        if (result != null) {
            const salt = result.salt;
            const correctPassword = result.password;

            crypto.pbkdf2(password, salt, 100, 512, 'sha-256', (err, derived)=>{
            
                if (err != null) {
                    console.log('sign token error: ', err);
                    next();
                    return;
                }

                const providedPassword = derived.toString('base64');

                if (providedPassword === correctPassword) {
                    console.log('sign token: signed');

                    const user = {
                        username: result.username,
                        role: 'normal user'
                    }

                    const token = jwt.sign(user, SECRETKEY, { expiresIn: '1h' });
                    res.cookie('token', token, {httpOnly: true});
                    req.user = user;
                }

                next();
            });
        }
        else {
            administratorModel.findOne({username: username}).then(result=>{
                console.log('sign token: success find', result);
                
                if (result != null) {
                    const salt = result.salt;
                    const correctPassword = result.password;

                    crypto.scrypt(password, salt, 256, {N: 512}, (err, derived)=>{
            
                        if (err != null) {
                            console.log('sign token error: ', err);
                            next();
                            return;
                        }

                        const providedPassword = derived.toString('base64');

                        if (providedPassword === correctPassword) {
                            console.log('sign token: signed');

                            const user = {
                                username: result.username,
                                role: 'administrator'
                            }

                            const token = jwt.sign(user, SECRETKEY, { expiresIn: '1h' });
                            res.cookie('token', token, {httpOnly: true});
                            req.user = user;
                        }
                        
                        next();
                    });
                }
                else {
                    next();
                }
            }).catch(error=>{
                console.log('sign token: Error find administrator' + error);
                res.status(500).send();
            });
        }
    }).catch(error=>{
        console.log('sign token: Error find ' + error);
        res.status(500).send();
    });
}

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    console.log('verifytoken', token);

    if (req.user != null) {
        console.log(req.user);
        next();
        return;
    }
 
    if (token == null) {
        console.log('verifytoken: no token');
        res.setHeader('WWW-Authenticate', 'Basic');
        res.status(401).json({
            message: 'No token provided'
        });
        return;
    }
 
    jwt.verify(token, SECRETKEY, (error, decoded) => {
        if (error != null) {
            console.log('verifytoken: fail to authenticate');
            res.setHeader('WWW-Authenticate', 'Basic');
            res.status(401).json({
                message: 'Failed to authenticate token'
            });
            return;
        }

        req.user = decoded;
        next();
    });
};

app.get('/home', (req, res)=>{
    res.status(200).sendFile(path.join(__dirname + '/home.html'));
});

app.get('/home.html', (req, res)=>{
    res.status(200).sendFile(path.join(__dirname + '/home.html'));
});

app.get('/bookmark', (req, res)=>{
    res.status(200).sendFile(path.join(__dirname + '/bookmark.html'));
});

app.get('/bookmark.html', (req, res)=>{
    res.status(200).sendFile(path.join(__dirname + '/bookmark.html'));
});

app.get('/register', (req, res)=>{
    res.status(200).sendFile(path.join(__dirname + '/register.html'));
});

app.get('/register.html', (req, res)=>{
    res.status(200).sendFile(path.join(__dirname + '/register.html'));
});

app.get('/admin', (req, res)=>{
    res.status(200).sendFile(path.join(__dirname + '/admin.html'));
});

app.get('/admin.html', (req, res)=>{
    res.status(200).sendFile(path.join(__dirname + '/admin.html'));
});

app.use(express.json()).post('/register', (req, res)=>{
    const username = req.body.username;
    const password = req.body.password;
    console.log('register', username, password);

    userModel.findOne({username: username}).then(results=>{
        if (results != null) {
            console.log('register: user already exists');
            res.status(400).json({
                message: 'User already exists'
            });
            return;
        }

        const salt = crypto.randomBytes(32).toString('base64');

        crypto.pbkdf2(password, salt, 100, 512, 'sha-256', (err, derived)=>{
            
            if (err != null) {
                console.log('register error: ', err);
                res.status(500).send();
                return;
            }

            const securePassword = derived.toString('base64');

            const UserValue = new userModel({
                username: username,
                password: securePassword,
                salt: salt
            });
    
            UserValue.save().then(result=>{
                console.log('register: Success save ' + result); 
                res.status(200).json({
                    message: 'Registered'
                });
            }).catch(error=>{
                console.log('register: Error save ' + error);
                res.status(500).send();
            });
        });
    }).catch(error=>{
        console.log('register: Error find ' + error);
        res.status(500).send();
    });
});

app.delete('/logout', (req, res)=>{
    console.log('logout');
    res.clearCookie('token');
    res.setHeader('Clear-Site-Data', '"cache", "cookies"');
    res.status(401).send();
});

app.get('/search', (req, res) =>
{    
    const searchEvent = req.query.event;
    const searchSeason = req.query.season;
    const minimumDate = req.query.minimumdate;
    const maximumDate = req.query.maximumdate;
    const sortByAwayTeam = req.query.sortbyawayteam;
    console.log('search', searchEvent, searchSeason, minimumDate, maximumDate, sortByAwayTeam);

    if (searchEvent == null) {
        console.log('search: no keyword');
        res.status(400).json({
            message: 'No keyword provided'
        });
        return;
    }

    var searchEventUrl = `https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=${searchEvent}`;
    if (searchSeason != null)  
        searchEventUrl += `&s=${searchSeason}`;
    console.log(searchEventUrl);

    axios.get(searchEventUrl).then(response=>{
        const results = response.data.event;
        console.log(results);
            
        if (results == null) {
            console.log('search: no event found');
            res.status(204).send();
            return;
        }
        
        if (sortByAwayTeam != null && sortByAwayTeam == true) {   /*Sort event by away team name*/
            var swapped, temporary;
            for (let i = 0; i < results.length-1; i++) {
                swapped = false;

                for (let j = 0; j < results.length-i-1; j++) {
                    if (results[j].strAwayTeam == null || results[j+1].strAwayTeam == null)
                        continue;

                    if (results[j].strAwayTeam > results[j+1].strAwayTeam) {
                        temporary = results[j];
                        results[j] = results[j+1];
                        results[j+1] = temporary;
                        swapped = true;
                    }
                }

                if (swapped == false)
                    break;
            }
        }

        const events = [];
        var j = 0;
        for (let i = 0; i < results.length; i++) {
            if (results[i].strSport == null || results[i].strSport.toLowerCase().trim() != 'soccer')    /*Only limited to soccer event*/
                continue;

            if (results[i].strEvent == null || results[i].dateEvent == null)    /*Later will use event name and date as reference*/
                continue;
                
            if (minimumDate != null && results[i].dateEvent < minimumDate)     /*Filter event by range of date*/
                continue;
                
            if (maximumDate != null && results[i].dateEvent > maximumDate)
                continue;

            events[j] = {
                name: results[i].strEvent,
                date: results[i].dateEvent,
                venue: results[i].strVenue,
                league: results[i]. strLeague,
                season: results[i].strSeason,
                round: results[i].intRound,
                homeTeam: results[i].strHomeTeam,
                homeScore: results[i].intHomeScore,
                awayTeam: results[i].strAwayTeam,
                awayScore: results[i].intAwayScore,
                video: results[i].strVideo
            }

            j++;
        }
        
        if (events.length == 0) {
            console.log('search: no event found')
            res.status(204).send();
            return;
        }
        
        console.log(events);
        res.status(200).json({
            events: events
        });

    }).catch(error => {
        console.log('search: ' + error);
        res.status(500).send();
    });
});

app.use(cookieParser()).use(express.json()).post('/addbookmark', signToken, verifyToken, (req, res)=>{
    const name =  req.body.name;
    const date = req.body.date;
    const username = req.user.username;
    const role = req.user.role;
    console.log('addbookmark', name, date, username, role);

    if (role !== 'normal user') {
        console.log('users: Not normal user');
        res.clearCookie('token');
        res.setHeader('WWW-Authenticate', 'Basic');
        res.status(401).json({
            message: 'Not normal user'
        });
        return;
    }

    if (name == null || date == null) {
        console.log('addbookmark: name or date null');
        res.status(400).json({
            message: 'Name or date is not provided'
        });
        return;
    }
    
    const getEvent_url = `https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=${name}&d=${date}`;
    console.log(getEvent_url);

    axios.get(getEvent_url).then(response=>{
        const event = response.data.event;
        console.log(event);
    
        if (event == null) {
            console.log('addbookmark: no event found')
            res.status(204).send();
            return;
        }

        eventModel.findOne({name: event[0].strEvent, date:event[0].dateEvent, user: username}).then(result=>{
            console.log('addbookmark: Success find one ' + result);

            if (result != null) {
                console.log('addbookmark: already bookmarked');
                res.status(200).json({
                    message: 'Already bookmarked'
                });
                return;
            }

            const EventValue = new eventModel({
                name: event[0].strEvent,
                league: event[0].strLeague,
                season: event[0].strSeason,
                round: event[0].intRound,
                date: event[0].dateEvent,
                venue: event[0].strVenue,
                video: event[0].strVideo,
                homeTeam: event[0].strHomeTeam,
                awayTeam: event[0].strAwayTeam,
                homeScore: event[0].intHomeScore,
                awayScore: event[0].intAwayScore,
                bookmarkedOn: new Date().toISOString(),
                user: username
            });
        
            EventValue.save().then(result=>{
                console.log('addbookmark: Success save ' + result);
                res.status(201).json({
                    message: 'Bookmarked'
                });

            }).catch(error=>{
                console.log('addbookmark: Error save ' + error);
                res.status(500).send();
            });

        }).catch(error=>{
            console.log('addbookmark: Error find one '+ error);
            res.status(500).send();
        })

    }).catch(error=>{
        console.log('addbookmark: axios error ' + error);
        res.status(500).send();
    });
});

app.use(cookieParser()).get('/bookmarks', signToken, verifyToken, (req, res)=>{
    const username = req.user.username;
    const role = req.user.role;
    console.log('bookmarks', username);

    if (role !== 'normal user') {
        console.log('users: Not normal user');
        res.clearCookie('token');
        res.setHeader('WWW-Authenticate', 'Basic');
        res.status(401).json({
            message: 'Not normal user'
        });
        return;
    }

    if (role !== 'normal user') {
        console.log('users: Not normal user');
        res.clearCookie('token');
        res.setHeader('WWW-Authenticate', 'Basic');
        res.status(401).json({
            message: 'Not normal user'
        });
        return;
    }
    
    eventModel.find({user: username}).then(results=>{
        console.log('bookmarks: Success find ' + results);

        if (results == null) {
            console.log('bookmarks: no bookmarked event');
            res.status(204).send();
            return;
        }

        const events = [];
        for (let i = 0; i < results.length; i++) {
            events[i] = {
                name: results[i]._doc.name,
                date: results[i]._doc.date,
                venue: results[i]._doc.venue,
                season: results[i]._doc.season,
                round: results[i]._doc.round,
                homeTeam: results[i]._doc.homeTeam,
                homeScore: results[i]._doc.homeScore,
                awayTeam: results[i]._doc.awayTeam,
                awayScore: results[i]._doc.awayScore,
                video: results[i]._doc.video,
                bookmarkedOn: new Date(results[i]._doc.bookmarkedOn).toLocaleString()
            }
        }

        console.log(events);
        res.status(200).json({
            events: events
        });

    }).catch(error=>{
        console.log('Error find ' + error);
        res.status(500);
    });
});

app.use(cookieParser()).delete('/removebookmark', signToken, verifyToken, (req, res)=>{
    const name = req.query.name;
    const date = req.query.date;
    const username = req.user.username;
    const role = req.user.role;
    console.log('removebookmark', name, date, username, role);

    if (role !== 'normal user') {
        console.log('users: Not normal user');
        res.clearCookie('token');
        res.setHeader('WWW-Authenticate', 'Basic');
        res.status(401).json({
            message: 'Not normal user'
        });
        return;
    }

    if (name == null || date == null) {
        console.log('removebookmark: no name or date provided');
        res.status(400).json({
            message: 'No name or date provided'
        });
        return;
    }

    eventModel.deleteMany({name: name, date: date, user: username}).then(result=>{
        console.log('removebookmark: Success delete many ' + result);
        res.status(204).send();

    }).catch(error=>{
        console.log('removebookmark: Error delete many ' + error);
        res.status(500).send();
    });
});

app.use(cookieParser()).use(express.json()).post('/update', signToken, verifyToken, (req, res)=>{
    const name = req.body.name;
    const date = req.body.date;
    const username = req.user.username;
    const role = req.user.role;
    console.log('update', name, date, username, role);

    if (role !== 'normal user') {
        console.log('users: Not normal user');
        res.clearCookie('token');
        res.setHeader('WWW-Authenticate', 'Basic');
        res.status(401).json({
            message: 'Not normal user'
        });
        return;
    }

    if (name == null || date == null) {
        console.log('update: name or date null');
        res.status(400).json({
            message: 'Name or date is not provided'
        });
        return;
    }

    const getEvent_url = `https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=${name}&d=${date}`;
    console.log(getEvent_url);

    axios.get(getEvent_url).then(response=>{
        console.log(response.data.event);

        if (response.data.event == null) {
            console.log('update: no event');
            res.status(204).send();
            return;
        }

        const event = response.data.event[0];

        if (event.video == null && (event.strHomeTeam == null || event.intHomeScore == null || event.intAwayScore == null || event.strAwayTeam == null)) {
            console.log('update: no update available');
            res.status(204).send();
            return;
        }

        eventModel.findOne({name: name, date: date, user: username}).then(result=>{
            console.log('update: Success find one ' + result);

            if (result == null) {
                console.log('update: event not in bookmarks');
                res.status(400).json({
                    message: 'Event not found in bookmarks'
                });
                return;
            }

            eventModel.updateMany({name: name, date: date, user: username}, 
                {
                    homeTeam: event.strHomeTeam,
                    homeScore: event.intHomeScore, 
                    awayScore: event.intAwayScore, 
                    awayTeam: event.strAwayTeam, 
                    video: event.strVideo, 
                    bookmarkedOn: new Date().toISOString()
                }
                ).then(response=>{
                    console.log("update: Success update many " + response);
        
                    const update = {
                        homeTeam: event.strHomeTeam,
                        homeScore: event.intHomeScore,
                        awayTeam: event.strAwayTeam,
                        awayScore: event.intAwayScore,
                        video: event.strVideo,
                        bookmarkedOn: new Date().toLocaleString()
                    }
        
                    console.log(update);
                    res.status(201).json({
                        update: update
                    });
        
                }).catch(error=>{
                    console.log('update: Error update many ' + error);
                    res.status(500).send();
                });

        }).catch(error=>{
            console.log('update: Error find one ' + error);
            res.status(500).send();
        });

    }).catch(error=>{
        console.log('update: axios error ' + error);
        res.status(500).send();
    });
});

// Administrator registration
/*
const salt = crypto.randomBytes(32).toString('base64');
crypto.pbkdf2('My$Password123', salt, 100, 512, 'sha-256', (err, derived)=>{
    if (err != null) {
        console.log('register error: ', err);
        return;
    }

    const securePassword = derived.toString('base64');

    const administratorValue = new administratorModel({
        username: 'admin1',
        password: securePassword,
        salt: salt
    });
    
    administratorValue.save().then(result=>{
        console.log('register: Success save ' + result);
    }).catch(error=>{
        console.log('register: Error save ' + error);
    });
});
*/

app.get('/users', signToken, verifyToken, (req, res)=>{
    const role = req.user.role;
    console.log('users', role);

    if (role !== 'administrator') {
        console.log('users: Not administrator');
        res.clearCookie('token');
        res.setHeader('WWW-Authenticate', 'Basic');
        res.status(401).json({
            message: 'Not administrator'
        });
        return;
    }

    userModel.find({}).then(results=>{
        console.log('users', results);

        const users = [];

        for (var i = 0; i < results.length; i++) {
            users.push({
                username: results[i].username,
                registerDate: results[i].registerDate
            });
        }

        res.status(200).json({
            users: users
        });
    }).catch(error=>{
        console.log('users error', error);
        res.status(500).send();
    });
});

app.delete('/removeuser', signToken, verifyToken, (req, res)=>{
    const role = req.user.role;
    const username = req.query.username;
    console.log('remove user', role, username);

    if (role !== 'administrator') {
        console.log('remove user: Not administrator');
        res.clearCookie('token');
        res.setHeader('WWW-Authenticate', 'Basic');
        res.status(401).json({
            message: 'Not administrator'
        });
        return;
    }

    userModel.deleteMany({username: username}).then(response=>{
        console.log('remove user', response);

        eventModel.deleteMany({user: username}).then(result=>{
            console.log('remove user event', result);
            res.status(204).json({
                message: 'Removed'
            });
        }).catch(error=>{
            console.log('remove user event', error);
            res.status(500).send();
        });
        
    }).catch(error=>{
        console.log('remove user', error);
        res.status(500).send();
    });
});

app.get('/*', (req, res)=>{
    res.status(404).send(`
    <html>
    <h3>This page is not available</h3>
    </html>
    `);
});

app.listen(5000, () => 
{
    console.log('Start listening from port 5000.');
});
