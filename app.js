var express = require('express');
var cors = require('cors')
var app = express();
app.use(cors());
const anetBot = require('./twitch-bot/anet-bot.js');
const discordBot = require('./discord-bot/discord-bot');
const passportManager = require('./passport/passportManager.js');
const scheduleManager = require('./schedule/scheduleManager.js');

const passport = passportManager.getPassport();
app.use(passport.initialize());
app.use(express.static('website-content'))
var port = process.env.PORT || 3001;
var server = app.listen(port, function () {
    console.log('Server running at http://127.0.0.1:' + port + '/');
});

app.get('/auth', passportManager.authenticate);

app.get('/auth/callback',
  passportManager.callback,
  function(req, res) { 
  	 console.log('in callback function');
  	 console.log(req.user);
    //req.session.access_token = req.user.accessToken;
    console.log('in callback, accessToken is:');
    console.log(req.user.accessToken);
    //res.redirect('/');
	});

app.get('/schedule', (req, res) => {
    const date1 = new Date('December 8, 2020 00:00:00');
    const date2 = new Date('December 24, 2020 00:00:00');
    scheduleManager.getAllEventsForRange(date1, date2)
        .then(function(allEvents) {
            res.json(allEvents);
        })
        .catch(function(err) {
            console.log('error getting dates from schedule manager:');
            console.log(err);
            res.json(err);
        });
});

app.get('/liveUser', (req, res) => {
    scheduleManager.getLiveUserFromSchedule()
        .then(function(liveUser) {
            res.json(liveUser);
        })
        .catch(function(err) {
            console.log('error getting dates from schedule manager:');
            console.log(err);
            res.json(err);
        });
});

