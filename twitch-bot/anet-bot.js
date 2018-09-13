var TwitchJS = require('twitch-js');

/*
 * TODO:
 * 
 * 1. abstract bot password (oath)
 * 2. Modularize everything so we can fix code easier
 * 3. Push bot to repo with feature parity
 * 4. figure out how to persist the user points in a datastorage (s3, dynamo, etc.)
 * 5. expose points API to be used on our website??? is this even useful? what can a user do on the website they can't do in twitch chat?
 * 
 */

//var channels = ['spofie', 'pookajutsu', 'josgar', 'shamanom', 'arcaneseamstress', 'healmeharry', 'fooga', 'meastoso', 'crevlm', 'tequilashots1500', 'iselenis', 'therogueflame', 'cyaniablu', 'avalonstar'];
var channels = ['meastoso'];
var username = 'aethernet_bot';
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
// channels for reference to the emote array
// ['spofie', 'pookajutsu', 'josgar', 'shamanom', 'arcaneseamstress', 
// 'healmeharry', 'fooga', 'meastoso', 'crevlm', 'tequilashots', 
// 'iselenis', 'therogueflame', 'cyaniablu', 'avalonstar'] ;
var availableEmoteMap = {};
var aethernetEmoteArr = [
	'sofieHype', 'pkjP', 'thejosPride', 'shamanLove', 'arcane2Snarky',
	'hmeHype', 'fuganoSing', 'meastoDaddy', 'crevlmCougar', 'tequil3Cheers',
	'iselenLove', 'therog3Love', 'cyanLove', 'avalonHYPE'];
var hypeMsg = '';
var wipeCounter = 0;
var wipeCounterInterval = 30;
var wipeCounterTask = 'Sing Karaoke!'; // default, set with command below
var updateViewerPointsInterval = 600000;
//var updateViewerPointsInterval = 10000; // used for testing
var viewerPointsMap = {};
var top20 = [];
var isRaffleOpen = false;


// &!@#(*&!@#(*&!@#(*&!@#
// TEST MODE SET HERE
// 1!@)#*&!@#)*&!@#)(*!@!
var testMode = false;

// **************************
// initialize schedule array
// **************************
var startTime = 1527037200000; // 9 PM EST Friday 5/22/2018 (Spofie start) found https://www.epochconverter.com/
//var startTime = (new Date()).getTime(); // now (used for testing)
var thirtyMinsInMillis = 1000 * 60 * 30; // 30 minutes in milliseconds
var hourInMillies = 1000 * 60 * 60; // 1 hour in milliseconds
var secondsInMillies = 1000; // 1 second in milliseconds (used for testing)

var testSchedule = [];
var test1 = {
		'username': 'CrevLM',
		'seconds': 100.5
};
testSchedule.push(test1);
var test2 = {
		'username': 'Heal_zebub',
		'seconds': 100
};
testSchedule.push(test2);
var test3 = {
		'username': 'HealmeHarry',
		'seconds': 100
};
testSchedule.push(test3);



// REAL SCHEDULE HERE
var realSchedule = [];
var caster1 = {
		'username': 'spofie',
		'hours': 5
};
realSchedule.push(caster1);
var caster2 = {
		'username': 'healmeharry',
		'hours': 8
};
realSchedule.push(caster2);
var caster3 = {
		'username': 'crevlm',
		'hours': 6
};
realSchedule.push(caster3);
/*var caster4 = {
		'username': 'unknown',
		'hours': 5
};
realSchedule.push(caster4);*/
var caster5 = {
		'username': 'avalonstar',
		'hours': 6
};
realSchedule.push(caster5);
var caster6 = {
		'username': 'fooga',
		'hours': 5
};
realSchedule.push(caster6);
var caster7 = {
		'username': 'shamanom',
		'hours': 5
};
realSchedule.push(caster7);
var caster8 = {
		'username': 'therogueflame',
		'hours': 5
};
realSchedule.push(caster8);
var caster9 = {
		'username': 'pookajutsu',
		'hours': 5
};
realSchedule.push(caster9);
var caster10 = {
		'username': 'tequilashots1500',
		'hours': 5
};
realSchedule.push(caster10);
var caster11 = {
		'username': 'spofie',
		'hours': 5
};
realSchedule.push(caster11);
var caster12 = {
		'username': 'therogueflame',
		'hours': 5
};
realSchedule.push(caster12);
var caster13 = {
		'username': 'cyaniablu',
		'hours': 5
};
realSchedule.push(caster13);
var caster14 = {
		'username': 'tequilashots1500',
		'hours': 5
};
realSchedule.push(caster14);
var caster15 = {
		'username': 'arcaneseamstress',
		'hours': 5
};
realSchedule.push(caster15);
var caster16 = {
		'username': 'shamanom',
		'hours': 5
};
realSchedule.push(caster16);
var caster17 = {
		'username': 'healmeharry',
		'hours': 5
};
realSchedule.push(caster17);
var caster18 = {
		'username': 'fooga',
		'hours': 5
};
realSchedule.push(caster18);
var caster19 = {
		'username': 'iselenis',
		'hours': 5
};
realSchedule.push(caster19);
var caster20 = {
		'username': 'spofie',
		'hours': 6
};
realSchedule.push(caster20);

function getLiveUserFromSchedule() {
	// get the current time
	var now = new Date();
	console.log('inside getLiveUserFromSchedule()');
	console.log('now is: ' + now);
	// loop through each person in the array and check if currrent time is between their start and end date
	var currentStart = startTime;
	var currentEnd = null;
	var currentUser = null;
	var schedule = realSchedule;
	if (testMode) {
		schedule = testSchedule;
	}
	try {
		for (var i = 0; i < schedule.length; i++) {
			// get currentEnd time for this user
			currentUser = schedule[i].username;
			console.log('checking user schedule for: ' + currentUser);
			var hours, secs;
			if (schedule[i].hours != undefined) {
				hours = parseFloat(schedule[i].hours);
				console.log('hours for this user: ' + hours);
				
				var hourInMilliesParsed = parseInt(hourInMillies);
				console.log('hourInMilliesParsed: ' + hourInMilliesParsed);
				
				var currentStartParsed = parseInt(currentStart);
				console.log('currentStartParsed: ' + currentStartParsed);
				
				var milliesParsed = hours * hourInMilliesParsed;
				console.log('milliesParsed: ' + milliesParsed);
				
				currentEnd = currentStartParsed + milliesParsed;
				console.log('currentEnd is: ' + currentEnd);
			}
			else if (schedule[i].seconds != undefined) {
				secs = parseFloat(schedule[i].seconds);
				console.log('secs for this user: ' + secs);
				var secondsParsed = parseFloat(secs);
				console.log('secondsParsed: ' + secondsParsed);
				var secondsInMilliesParsed = parseInt(secondsInMillies);
				console.log('secondsInMilliesParsed: ' + secondsInMilliesParsed);
				var currentStartParsed = parseInt(currentStart);
				console.log('currentStartParsed: ' + currentStartParsed);
				var milliesParsed = secondsParsed * secondsInMilliesParsed;
				console.log('milliesParsed: ' + milliesParsed);
				currentEnd = currentStartParsed + milliesParsed;
				console.log('currentEnd is: ' + currentEnd);
			}
			var startDate = new Date(currentStart);
			var endDate = new Date(currentEnd);
			if (now > startDate && now < endDate) {
				// found the current scheduled user
				console.log('Inside getLiveUserFromSchedule() found a schedule match! returning username: ' + currentUser);
				return currentUser;
			}
			else {
				// set currentStart to currentEnd and continue loop
				console.log('did not find match for startDate: ' + startDate + ' and endDate: ' + endDate);
				currentStart = currentEnd;
			}
		}
		console.log('NOTE: DID NOT FIND A VALID USERNAME FROM SCHEDULE IN getLiveUserFromSchedule()');
	}
	catch (err) {
		console.log('CAUGHT ERROR RUNNING getLiveUserFromSchedule():');
		console.log(err);
	}
	return ''; // default so nothing blows up lol
}

var updateViewerPoints = function() {
	console.log('inside updateViewerPoints function');
	const restClient = require('node-rest-client').Client;
	const theRestClient = new restClient();
	var currentLiveChannel = getLiveUserFromSchedule().toLowerCase();
	console.log('currentLiveChannel received is: ' + currentLiveChannel);
	const url = "http://tmi.twitch.tv/group/user/" + currentLiveChannel + "/chatters";
	theRestClient.get(url, function (data, response) {
		try {
			console.log('got back the following data for url: ' + url);
			console.log(data);
			var chatters = data.chatters;
		    var noOverlapMap = {}; // used to make sure people aren't counted twice if they are multiple types of chatters
		    if (chatters != undefined && chatters != null) {
		    	for (var chatterType in chatters) {
		    		chattersArr = chatters[chatterType];
		    		for (var i = 0; i < chattersArr.length; i++) {
		    			var chatterName = chattersArr[i];
		    			if (noOverlapMap[chatterName] == undefined) {
		    				var currentViewerPoints = viewerPointsMap[chatterName];
			    			if (currentViewerPoints == undefined || currentViewerPoints == null) {
			    				viewerPointsMap[chatterName] = 1;
			    			}
			    			else {
			    				viewerPointsMap[chatterName] = parseInt(currentViewerPoints) + 1;
			    			}
			    			noOverlapMap[chatterName] = 1;
		    			}
		    		}
		    	}
		    }
		    console.log('finished point updates, map is:');
		    console.log(viewerPointsMap);
		    updateTop20();
		}
	    catch (err) {
	    	console.log('CAUGHT ERROR RUNNING updateViewerPoints():');
			console.log(err);
	    }
	});
	setTimeout(updateViewerPoints, updateViewerPointsInterval); // repeat myself
}
setTimeout(updateViewerPoints, updateViewerPointsInterval);
// sort function to keep top20 in front of array
function updateTop20() {
	top20 = [];
	for (var username in viewerPointsMap) {
		if (username != 'aethernet_bot') {
			var userPointsObj = {
					'username': username,
					'points': viewerPointsMap[username]
			}
			top20.push(userPointsObj);
		}
	}
	function compare(a,b) {
		if (a.points > b.points)
			return -1;
		if (a.points < b.points)
			return 1;
		return 0;
	}
	top20.sort(compare);
}

function removePoints(username, pointsToRemove) {
	var currentPoints = viewerPointsMap[username];
	if (currentPoints != undefined || currentPoints != null) {
		var newPointTotal = parseInt(currentPoints, 10) - pointsToRemove;
		viewerPointsMap[username] = newPointTotal;
	}
}

function addAnima(username, amount) {
	var points = viewerPointsMap[username];
	if (points == undefined || points == null) {
		points = 0;
	}
	viewerPointsMap[username] = parseInt(points, 10) + parseInt(amount, 10);
}

function getPoints(username) {
	var points = viewerPointsMap[username];
	if (points == undefined || points == null) {
		points = 0;
	}
	return points;
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

var raffleTicketContainer = []; // could contain multiple if people buy more than 1 ticket
// function used to spend anima on tickets
function buyTickets(username, ticketAmount) {
	// check if user has the points
	console.log('inside buytTickets() function!');
	var userPointTotal = getPoints(username);
	if (userPointTotal < 3) {
		// not enough points, avoid chat spam and just ignore this users request to buy tickets
		console.log('user ' + username + ' tried to buy tickets buy only has ' + userPointTotal + ' points');
		return;
	}
	var maxTickets = userPointTotal / 3;
	if (ticketAmount > maxTickets) {
		// user requested more tickets than they can afford, just give them max tickets
		ticketAmount = maxTickets;
	}
	for (let i = 0; i < ticketAmount; i++) {
		raffleTicketContainer.push(username);
	}
	// deduct points
	var pointsToDeduct = ticketAmount * 3;
	removePoints(username, pointsToDeduct);
}

function drawWinnerAndReturnUsername() {
	var randomResult = getRandomInt(raffleTicketContainer.length - 1);
	var winnerUsername = raffleTicketContainer[randomResult];
	return winnerUsername;
}

client.on("emotesets", function(sets, obj) {
	console.log('emote sets:');
	console.log(obj);
	availableEmoteMap = {}; // reset so this doesn't grow each time its called (i think this gets called when the bot gets a new sub gifted)
    // Make a map of available emotes for aethernet_bot
	for (var emoteSetId in obj) {
		console.log('checking emoteSetId:' + emoteSetId);
		if (emoteSetId != '0') {
			// found an emote set that's not default/global
			console.log('found emote set not 0');
			var emotesArr = obj[emoteSetId];
			console.log(emotesArr);
		    for (var i = 0; i < emotesArr.length; i++) {
		    	console.log('adding ' + emotesArr[i].code + ' to availableEmoteMap');
		    	availableEmoteMap[emotesArr[i].code] = 1;
		    }
		}
	}
    for (var i = 0; i < aethernetEmoteArr.length; i++) {
    	var emote = aethernetEmoteArr[i];
    	console.log('checking emote: ' + emote);
    	console.log('checking availableEmoteMap[emote]' + availableEmoteMap[emote]);
    	if (availableEmoteMap[emote] !== undefined && availableEmoteMap[emote] !== null && availableEmoteMap[emote] == '1') {
    		console.log('adding emote ' + emote + ' to hype command');
    		hypeMsg = hypeMsg + ' ' + emote;
    	}
    	else {
    		console.log('emote ' + emote + ' not available to aethernet_bot');
    	}
    }
});

/**
 * Function to parse chat message for bot commands
 */
client.on('chat', function(channel, user, message, self) {
	if (self) return;
	try {
		var username = user['username'];
		var channelName = channel.split('#')[1];
		var msgObj = {
				'user': user,
				'message': message
		}
		/* ###########################
		 *      !website
		 * ##########################*/
		if (message.startsWith("!website")) {
			var responseMsg = "The Aethernet has launched a new website with many more features coming soon! Check it out: http://aethernet.tv/";
            client.action(channel, responseMsg);
		}
		/* ###########################
		 *      !hype
		 * ##########################*/
		else if (message.startsWith("!hype") && !testMode) {
			var responseMsg = hypeMsg + hypeMsg;
            client.say(channel, responseMsg);
		}
		/* ###########################
		 *      !testhype
		 * ##########################*/
		else if (message.startsWith("!testhype")) {
			var responseMsg = hypeMsg + hypeMsg;
            client.say(channel, responseMsg);
		}
		/* ###########################
		 *      !wipe
		 * ##########################*/
		else if ((user['mod'] || username === channelName) && message.startsWith("!wipe")) {
			wipeCounter++;
			if (wipeCounter % wipeCounterInterval == 0) {
				// STREAMER MUST DO SOMETHING CRAZY
				var responseMsg = 'ALERT! ALERT! ' + channelName + ' and the Aethernet Twitch Team have wiped ' + wipeCounter +
					' times! Every ' + wipeCounterInterval + ' wipes ' + channelName + ' has to: ' + wipeCounterTask;
				client.say(channel, responseMsg);
			}
			else {
				// just print out total wipes
				var responseMsg = channelName + ' and the Aethernet Twitch Team have wiped ' + wipeCounter + ' times!';
				client.say(channel, responseMsg);
			}
	    }
		/* ###########################
		 *      !wipereset
		 * ##########################*/
		else if (username === channelName && message.startsWith("!wipereset")) { // only channel owner can start this
			wipeCounter = 0;
		}
		/* ###########################
		 *      !setwipetask
		 * ##########################*/
		else if (username === channelName && message.startsWith("!setwipetask ")) { // only channel owner can start this
			var newTask = message.split('!setwipetask ')[1];
			if (newTask != undefined && newTask != null && newTask != '') {
				wipeCounterTask = newTask;
			}
		}
		/* ###########################
		 *      !anetcommands
		 * ##########################*/
		else if (message.startsWith("!anetcommands")) {
			var responseMsg = 'Available commands for the Aethernet Bot are: !website, !hype, !anima, !prizes and !buytickets';
			client.say(channel, responseMsg);
		}
		/* ###########################
		 *      !anima
		 * ##########################*/
		else if (message.startsWith("!anima")) {
			var currentAnima = getPoints(username);
			var responseMsg = username + ' currently has ' + currentAnima + ' anima.';
			client.say(channel, responseMsg);
		}
		/* ###########################
		 *      !addanima <amount>
		 * ##########################*/
		else if (username === channelName && message.startsWith("!addanima")) {
			function isInt(value) {
			  return !isNaN(value) && 
			         parseInt(Number(value)) == value && 
			         !isNaN(parseInt(value, 10));
			}
			var responseMsg = "Incorrect usage of the !addanima command. Example usage: !addanima meastoso 20";
			var cmdModifier = message.split('!addanima ')[1];
			if (cmdModifier == undefined || cmdModifier == null) {
				client.say(channel, responseMsg);
				return;
			}
			var cmdModifierArr = cmdModifier.split(' ');
			if (cmdModifierArr.length != 2) {
				client.say(channel, responseMsg);
				return;
			}
			var userToModify = cmdModifierArr[0];
			var amountToAdd = cmdModifierArr[1];
			if (userToModify == undefined || userToModify == null || userToModify == '' || !isInt(amountToAdd)) {
				client.say(channel, responseMsg);
				return;
			}
			// ALL GOOD TO GO
			addAnima(userToModify, amountToAdd);
			responseMsg = "Successfully added " + amountToAdd + " anima to " + userToModify;
			client.say(channel, responseMsg);
		}
		/* ###########################
		 *      !top20
		 * ##########################*/
		else if (message.startsWith("!top20")) {
			var top20Str = '';
			var topNum = 20;
			if (top20.length < 20) {
				topNum = top20.length;
			}
			for (var i = 0; i < topNum; i++) {
				top20Str = top20Str + ' ' + top20[i].username + ',';
			}
			var responseMsg = 'Top 20 Viewers for Aethernet 4.3 Event are:' + top20Str;
			client.say(channel, responseMsg);
		}
		/* ###########################
		 *      !prizes
		 * ##########################*/
		else if (message.startsWith("!prizes")) {
			var responseMsg = "The Aethernet's 4.3 Patch Event includes so many Giveaways it will make your head spin! Prizes include Mounts, Glamours and Emotes from Mogstation, Steam keys and more!";
			client.say(channel, responseMsg);
		}
		/* ###########################
		 *      !raffle <start|end>
		 * ##########################*/
		else if (username === channelName && message.startsWith("!raffle")) { // only channel owner can start this
			// figure out if user is starting a raffle or ending a raffle
			var cmdModifier = message.split('!raffle ')[1];
			if (cmdModifier == undefined || cmdModifier == null || (cmdModifier.toLowerCase() != 'start' && cmdModifier.toLowerCase() != 'end')) {
				var responseMsg = "Incorrect usage of the !raffle command. Please include 'start' or 'end' after the command, i.e. !raffle start";
				client.say(channel, responseMsg);
				return;
			}
			// if start, check that a raffle isn't currently in progress
			if (cmdModifier.toLowerCase() == 'start' && isRaffleOpen) {
				var responseMsg = "A raffle is already open, please end the existing raffle before beginning a new one.";
				client.say(channel, responseMsg);
				return;
			}
			// if end, check that a raffle is currently in progress
			if (cmdModifier.toLowerCase() == 'end' && !isRaffleOpen) {
				var responseMsg = "There are currently no raffles open.";
				client.say(channel, responseMsg);
				return;
			}
			// everything else checks out, proceed with the raffle logic...
			if (cmdModifier.toLowerCase() == 'start') {
				// nothing to do, let people start buying raffle tickets
				var responseMsg = username + " has started a raffle giveaway! Buy one or more raffle tickets to enter using the command !buytickets <amount>. Each ticket costs 3 anima.";
				client.say(channel, responseMsg);
				isRaffleOpen = true;
			}
			else if (cmdModifier.toLowerCase() == 'end') {
				if (raffleTicketContainer.length < 1) {
					var responseMsg = "Closing the raffle, there were no entries so there is no winner! sadface";
					client.say(channel, responseMsg);
					isRaffleOpen = false;
					return;
				}
				// process all the tickets
				var winnerUsername = drawWinnerAndReturnUsername();
				var totalEntries = raffleTicketContainer.length;
				var winnerNumberTickets = 0;
				for (let i = 0; i < raffleTicketContainer.length; i++) {
					if (raffleTicketContainer[i] == winnerUsername) {
						winnerNumberTickets++;
					}
				}
				var percentChance = Math.round((winnerNumberTickets / totalEntries * 1.0) * 100);
				var responseMsg = "With " + totalEntries + " total entries and " + percentChance + "% chance of winning, CONGRATULATIONS " + winnerUsername + " !";
				client.say(channel, responseMsg);
				raffleTicketContainer = []; // empty out the raffle container after drawing the winner
				isRaffleOpen = false;
			}
		}
		/* ###########################
		 *      !buytickets <amount>
		 * ##########################*/
		else if (message.startsWith("!buytickets")) {
			if (!isRaffleOpen) {
				var responseMsg = 'There are no raffles currently open.';
				client.say(channel, responseMsg);
				return;
			}
			var ticketAmount = message.split('!buytickets ')[1];
			console.log('found !buytickets command with ticketAmount: ' + ticketAmount);
			function isInt(value) {
			  return !isNaN(value) && 
			         parseInt(Number(value)) == value && 
			         !isNaN(parseInt(value, 10));
			}
			if (ticketAmount == undefined || ticketAmount == null || !isInt(ticketAmount)) {
				var responseMsg = 'Incorrect usage of that command, ' + username + '. Example: !buytickets 2';
				client.say(channel, responseMsg);
				return;
			}
			buyTickets(username, parseInt(ticketAmount, 10));
		}
		/* ###########################
		 *      !testbuytickets <amount>
		 * ##########################*/
		else if (username === 'meastoso' && message.startsWith("!testbuytickets")) {
			if (!isRaffleOpen) {
				var responseMsg = 'There are no raffles currently open.';
				client.say(channel, responseMsg);
				return;
			}
			var secondMsg = message.split('!testbuytickets ')[1];
			var username = secondMsg.split(' ')[0];
			var ticketAmount = secondMsg.split(' ')[1];
			buyTickets(username, parseInt(ticketAmount, 10));
		}
		/* ###########################
		 *      !remove <user>
		 * ##########################*/
		else if (username === channelName && message.startsWith("!remove ")) { // only channel owner can start this
			try {
				var usernameToReset = message.split('!remove ')[1];
				viewerPointsMap[usernameToReset] = 0;
				updateTop20();
				var responseMsg = 'Successfully removed user ' + usernameToReset + ' from Top20.';
				client.say(channel, responseMsg);
			}
			catch (err) {
				console.log('Caught error trying to remove user from top20: ');
				console.log(err);
				// reply to chat and say failed to remove user check logs
				var responseMsg = 'Failed to remove user ' + usernameToReset + ' from Top20; PM @meastoso to check logs for error.';
				client.say(channel, responseMsg);
			}
		}
	}
	catch(error) {
		console.log("ERROR: " + error);
	}

});




