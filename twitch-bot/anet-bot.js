var TwitchJS = require('twitch-js');
var fs = require('fs');

// local dependencies
const team = require('../team/team-members.js');
const pointsManager = require('../points/pointsManager.js');
const chatHandler = require('../chat/chatHandler.js');
const testModeManager = require('../twitch-bot/testModeManager.js');

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


// NOTE: The following data is useful to collect statistics after the marathon
/*var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('nodejs.log2')
});

let numGiveaways = 0;
let numTotalRaffleEntries = 0;
let lastNumber = 0;
let riggedUsage = 0;
lineReader.on('line', function (line) {
  // console.log('Line from file:', line);
  if (line.indexOf('chance of winning, CONGRATULATIONS') > 0) {
      numGiveaways++;
      console.log('number of giveaways: ' + numGiveaways);
      const firstSlice = line.substring(line.indexOf(': With ') + 7, line.length);
      // console.log('firstSlice: ' + firstSlice);
      const strNumberEntries = firstSlice.substring(0, firstSlice.indexOf(' total entries'));
      // console.log('strNumberEntries: ' + strNumberEntries);
      const numEntries = parseInt(strNumberEntries, 10);
      if (numEntries !== lastNumber) {
          numTotalRaffleEntries += numEntries;
      }
      lastNumber = numEntries;
      console.log('numTotalRaffleEntries: ' + numTotalRaffleEntries);
  }
  if (line.indexOf('!rigged') > 0) {
      riggedUsage++;
      console.log('riggedUsage: ' + riggedUsage);
  }
});*/
// console.log('numTotalRaffleEntries is:');
// console.log(numTotalRaffleEntries);

/*
 * TODO:
 * 
 * 1. (done) abstract bot password (oath)
 * 2. (done) Modularize everything so we can fix code easier
 			- (done) move raffle code from chat handler to raffle module
 			- (done) make a better scheduler system to figure out the current live user
   2.5. Copy schedule into google calendar
 * 3. (done) Push bot to repo with feature parity
 * 4. (done) figure out how to persist the user points in a datastorage (s3, dynamo, etc.)
 * 5. expose points API to be used on our website??? is this even useful? what can a user do on the website they can't do in twitch chat?
   6. Optimize client to only login to channel that is "live"
   7. allocate aws hardware
 * 
 */

const testMode = testModeManager.isTestMode();
let channels = team.getMembers();
if (testMode) {
	channels = ['meastoso'];
}

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
console.log('CHRIS LATEST TEST!');
client.connect();

// kick off infinite loop of calling updatePoints();
const callPointsManager = function() {
	pointsManager.updateViewerPoints();
	const updateInterval = pointsManager.getUpdateIntervalMS();
	setTimeout(callPointsManager, updateInterval)
};
// callPointsManager(); // TODO: restore this

client.on("emotesets", function(sets, obj) {
	//console.log('emote sets:');
	//console.log(obj);
	team.updateHypeCommand(sets, obj);
});

// Function to parse chat message for bot commands
client.on('chat', function(channel, user, message, self) {
	if (self) return;
	chatHandler.handleMsg(client, channel, user, message);
});

/*const token = twitchCredentials['aethernet-bot'];
const username = 'aethernet_bot';

const channel = 'meastoso'; // TODO: get this dynamically

// Instantiate clients.
const { api, chat, chatConstants } = new TwitchJs({ token, username });

// Listen to all events.
const log = msg => console.log(msg);
chat.on(chatConstants.EVENTS.ALL, log);

// Connect ...
chat.connect().then(() => {
    // ... and then join the channel.
    chat.join(channel);
    console.log('just joined the channel!');
});*/


