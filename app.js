var express = require('express');
var app = express();
const anetBot = require('./twitch-bot/anet-bot.js');

app.use(express.static('website-content'))
var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
    console.log('Server running at http://127.0.0.1:' + port + '/');
});

