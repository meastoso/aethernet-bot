var TwitchJS = require('twitch-js');
var fs = require('fs');

// local dependencies
const team = require('../team/team-members.js');
const pointsManager = require('../points/pointsManager.js');
const chatHandler = require('../chat/chatHandler.js');

/*
* Fetch twitch oath credentials from local file
*/
var twitchCredentials = {};
try {
	twitchCredentials = JSON.parse(fs.readFileSync('twitch-credentials', 'utf8'));
}
catch (err) {
	console.log('ERROR: Could not read file "twitch-credentials" at project root. Please ensure this file exists and is populated');
	console.log(err);
}

/*
 * TODO:
 * 
 * 1. (done) abstract bot password (oath)
 * 2. (done) Modularize everything so we can fix code easier
 			- (done) move raffle code from chat handler to raffle module
 			- (done) make a better scheduler system to figure out the current live user
   2.5. Copy schedule into google calendar
 * 3. Push bot to repo with feature parity
 * 4. figure out how to persist the user points in a datastorage (s3, dynamo, etc.)
 * 5. expose points API to be used on our website??? is this even useful? what can a user do on the website they can't do in twitch chat?
 * 
 */

//var channels = ['meastoso', 'arcaneSeamstress'];
var channels = team.getMembers();
var username = 'aethernet_bot';
var password = twitchCredentials['aethernet-bot'];
var options = {
        options: {
                debug: true
        },
        connection: {
                cluster: "aws",
                reconnect: true
        },
        identity: {
                username: username,
                password: password
        },
        channels: channels
};

var client = new TwitchJS.client(options);
console.log("Attempting to log into channels with username: " + username);
client.connect();

// kick off infinite loop of calling updatePoints();
const callPointsManager = function() {
	pointsManager.updateViewerPoints();
	const updateInterval = pointsManager.getUpdateIntervalMS();
	setTimeout(callPointsManager, updateInterval)
};
callPointsManager(); // TODO: restore this

client.on("emotesets", function(sets, obj) {
	//console.log('emote sets:');
	//console.log(obj);
	team.updateHypeCommand(sets, obj);
});

/**
 * Function to parse chat message for bot commands
 */
client.on('chat', function(channel, user, message, self) {
	if (self) return;
	chatHandler.handleMsg(client, channel, user, message);
});




