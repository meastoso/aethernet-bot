const team = require('../team/team-members.js');
const testModeManager = require('../twitch-bot/testModeManager.js');
const pointsManager = require('../points/pointsManager.js');
const raffleSystem = require('../raffle/raffleSystem.js');

const testMode = testModeManager.isTestMode();

const handleMsg = function(client, channel, user, message) {
	try {
		var username = user['username'];
		var channelName = channel.split('#')[1];
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
			const hypeMsg = team.getHypeStr();
			var responseMsg = hypeMsg + hypeMsg;
         client.say(channel, responseMsg);
		}
		/* ###########################
		 *      !testhype
		 * ##########################*/
		else if (message.startsWith("!testhype")) {
			const hypeMsg = team.getHypeStr();
			var responseMsg = hypeMsg + hypeMsg;
         client.say(channel, responseMsg);
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
			var currentAnima = pointsManager.getPoints(username);
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
			pointsManager.addAnima(userToModify.toLowerCase(), amountToAdd);
			responseMsg = "Successfully added " + amountToAdd + " anima to " + userToModify;
			client.say(channel, responseMsg);
		}
		/* ###########################
		 *      !prizes
		 * ##########################*/
		else if (message.startsWith("!prizes")) {
			var responseMsg = "The Aethernet's 4.4 Patch Event includes so many Giveaways it will make your head spin! Prizes include Mounts, Glamours and Emotes from Mogstation, FFXIV Time Cards and more!";
			client.action(channel, responseMsg);
		}
		/* ###########################
		 *      !raffle <start|end>
		 * ##########################*/
		else if (username === channelName && message.startsWith("!raffle")) { // only channel owner can start this
			// figure out if user is starting a raffle or ending a raffle
			const isRaffleOpen = raffleSystem.isRaffleOpen();
			const drawTicketUsed = raffleSystem.hasDrawTicketBeenUsed();
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
			// if end and streamer hasn't drawn a winner, prevent this from accidently ending before they mean to
			if (cmdModifier.toLowerCase() == 'end' && !drawTicketUsed) {
				var responseMsg = "To prevent irreversible anima loss you cannot end a raffle before using !drawticket to select and announce a winner. If this was intentional please contact @meastoso.";
				client.say(channel, responseMsg);
				return;
			}
			// everything else checks out, proceed with the raffle logic...
			if (cmdModifier.toLowerCase() == 'start') {
				// nothing to do, let people start buying raffle tickets
				var responseMsg = username + " has started a raffle giveaway! Buy one or more raffle tickets to enter using the command !buytickets <amount>. Each ticket costs 1 anima.";
				client.say(channel, responseMsg);
				//isRaffleOpen = true;
				raffleSystem.openRaffle();
			}
			else if (cmdModifier.toLowerCase() == 'end') {
				if (!isRaffleOpen) {
					var responseMsg = "There are no raffles open to end.";
					client.say(channel, responseMsg);
					return;
				}
				raffleSystem.closeRaffle();
				var responseMsg = "The current raffle has been successfully closed.";
				client.say(channel, responseMsg);
			}
		}
		/* ###########################
		 *      !drawticket
		 * ##########################*/
		else if (username === channelName && message.startsWith("!drawticket")) { // only channel owner can start this
			const isRaffleOpen = raffleSystem.isRaffleOpen();
			if (!isRaffleOpen) {
				var responseMsg = "There are no raffles open to draw a winning ticket from.";
				client.say(channel, responseMsg);
				return;
			}
			// process all the tickets
			var winnerMsg = raffleSystem.drawWinnerAndReturnMessage();
			client.say(channel, winnerMsg);
		}
		/* ###########################
		 *      !buytickets <amount>
		 * ##########################*/
		else if (message.startsWith("!buytickets")) {
			const isRaffleOpen = raffleSystem.isRaffleOpen();
			const drawTicketUsed = raffleSystem.hasDrawTicketBeenUsed();
			if (!isRaffleOpen) {
				var responseMsg = 'There are no raffles currently open.';
				client.say(channel, responseMsg);
				return;
			}
			else if (drawTicketUsed) {
				var responseMsg = 'You cannot buy tickets once a winner has been drawn.';
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
			if (ticketAmount < 1) {
				var responseMsg = 'Nice try, ' + username + ' but no dice.';
				client.say(channel, responseMsg);
				return;
			}
			const successResponseMsg = raffleSystem.buyTickets(username, parseInt(ticketAmount, 10));
			client.say(channel, successResponseMsg);
		}
		/* ###########################
		 *      !testbuytickets <amount>
		 * ##########################*/
		else if (username === 'meastoso' && message.startsWith("!testbuytickets")) {
			const isRaffleOpen = raffleSystem.isRaffleOpen();
			if (!isRaffleOpen) {
				var responseMsg = 'There are no raffles currently open.';
				client.say(channel, responseMsg);
				return;
			}
			var secondMsg = message.split('!testbuytickets ')[1];
			var username = secondMsg.split(' ')[0];
			var ticketAmount = secondMsg.split(' ')[1];
			raffleSystem.buyTickets(username, parseInt(ticketAmount, 10));
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
}

// public methods
module.exports = {
		handleMsg: handleMsg
}