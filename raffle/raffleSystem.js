const pointsManager = require('../points/pointsManager.js');

var raffleOpen = false;

// helper function
function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

let raffleTicketContainer = []; // could contain multiple if people buy more than 1 ticket
// function used to spend anima on tickets
const buyTickets = function(username, ticketAmount) {
	// check if user has the points
	console.log('inside buytTickets() function!');
	var userPointTotal = pointsManager.getPoints(username);
	const ticketCostInAnima = 1;
	if (userPointTotal < ticketCostInAnima) {
		// not enough points, avoid chat spam and just ignore this users request to buy tickets
		console.log('user ' + username + ' tried to buy tickets buy only has ' + userPointTotal + ' points');
		return;
	}
	var maxTickets = userPointTotal / ticketCostInAnima;
	if (ticketAmount > maxTickets) {
		// user requested more tickets than they can afford, just give them max tickets
		ticketAmount = maxTickets;
	}
	for (let i = 0; i < ticketAmount; i++) {
		raffleTicketContainer.push(username);
	}
	// deduct points
	var pointsToDeduct = ticketAmount * ticketCostInAnima;
	pointsManager.removePoints(username, pointsToDeduct);
	// success, respond to user who bought tickets
 	const responseMsg = username + ' bought ' + ticketAmount + ' tickets!';
	return responseMsg;
}

const drawWinnerAndReturnMessage = function() {
	var randomResult = getRandomInt(raffleTicketContainer.length - 1);
	var winnerUsername = raffleTicketContainer[randomResult];
	var totalEntries = raffleTicketContainer.length;
	var winnerNumberTickets = 0;
	for (let i = 0; i < raffleTicketContainer.length; i++) {
		if (raffleTicketContainer[i] == winnerUsername) {
			winnerNumberTickets++;
		}
	}
	var percentChance = Math.round((winnerNumberTickets / totalEntries * 1.0) * 100);
	var responseMsg = "With " + totalEntries + " total entries and " + percentChance + "% chance of winning, CONGRATULATIONS " + winnerUsername + " !";
	return responseMsg;
}

const isRaffleOpen = function() {
	return raffleOpen;
}

const openRaffle = function() {
	raffleOpen = true;
}

const closeRaffle = function() {
	raffleTicketContainer = []; // empty out the raffle container after drawing the winner
	raffleOpen = false;
}

// public methods
module.exports = {
		buyTickets: buyTickets,
		drawWinnerAndReturnMessage: drawWinnerAndReturnMessage,
		isRaffleOpen: isRaffleOpen,
		openRaffle: openRaffle,
		closeRaffle: closeRaffle
}