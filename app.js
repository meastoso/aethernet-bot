var express = require('express');
var app = express();
const anetBot = require('./twitch-bot/anet-bot.js');
const passportManager = require('./passport/passportManager.js');

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

