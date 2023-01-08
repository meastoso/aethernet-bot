var express = require('express');
var cors = require('cors')
var app = express();
app.use(cors());
const anetBot = require('./twitch-bot/anet-bot.js');
// const discordBot = require('./discord-bot/discord-bot');
const passportManager = require('./passport/passportManager.js');
const {getRandomInt} = require("./raffle/raffleSystem");
const scheduleManager2 = require('./schedule/scheduleManager2.js');

const passport = passportManager.getPassport();
app.use(passport.initialize());
app.use(express.static('website-content'))
var port = process.env.PORT || 3001;
var server = app.listen(port, function () {
    console.log('Server running at http://127.0.0.1:' + port + '/');
});

app.get('/', function(req, res) {
    res.json("ROOT!");
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
    res.redirect('/');
    }
);

app.get('/schedule', (req, res) => {
    // const date1 = new Date('August 23, 2022 00:00:00');
    // const date2 = new Date('September 5, 2022 00:00:00');
    const date1 = new Date('January 7, 2023 00:00:00');
    const date2 = new Date('January 24, 2023 00:00:00');
    scheduleManager2.getAllEventsForRange(date1, date2)
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
    scheduleManager2.getLiveUserFromSchedule()
        .then(function(liveUser) {
            res.json(liveUser);
        })
        .catch(function(err) {
            console.log('error getting dates from schedule manager:');
            console.log(err);
            res.json(err);
        });
});

app.get('/delete', (req, res) => {
    const date1 = new Date('September 10, 2022 00:00:00');
    scheduleManager2.deleteOldEventsBeforeDate(date1)
        .then(function() {
            res.json("success");
        })
        .catch(function(err) {
            console.log('error deleting dates from schedule manager:');
            console.log(err);
            res.json(err);
        });
});

// app.get('/getEvent', (req, res) => {
//     const meastEventId = "NnM1NjRzZWd2djVuMTJ2ZnRlZTYxZnBhYjEgYWV0aGVybmV0Ym90QG0";
//     const brianEventTest = "NXBsZHZzNjhxbDBkdTgwc2FlNzNucnU3NjEgYWV0aGVybmV0Ym90QG0";
//     const arc = "10ku39tabv0hfkjsmejibhsdb5";
//     scheduleManager2.getEvent(arc)
//         .then(function(data) {
//             res.json(data);
//         })
//         .catch(function(err) {
//             console.log('error deleting dates from schedule manager:');
//             console.log(err);
//             res.json(err);
//         });
// });

app.get('/test', (req, res) => {
    res.json("echo!");
});

app.get('/num', (req, res) => {
    res.json(getRandomInt(300));
});

