const restClient = require('node-rest-client').Client;
const theRestClient = new restClient();
const scheduleManager = require('../schedule/scheduleManager.js');
const animaPointsDAO = require('../s3/animaPointsDAO.js');
const testModeManager = require('../twitch-bot/testModeManager.js');
const team = require('../team/team-members.js');

var viewerPointsMap = {};
const testMode = testModeManager.isTestMode();

const updateViewerPoints = function() {
	console.log('inside updateViewerPoints function');
	viewerPointsMap = animaPointsDAO.getCurrentAnimaCache();
	//var currentLiveChannel = getLiveUserFromSchedule().toLowerCase();
	//const currentLiveChannel = scheduleManager.getLiveUserFromSchedule().toLowerCase();
	scheduleManager.getLiveUserFromSchedule()
		.then(function(currentLiveChannel) {
			if (currentLiveChannel === null) {
				return; // null means we didn't find a valid current live channel but didn't catch errors calling Google API
			}
			console.log('currentLiveChannel received is: ' + currentLiveChannel);
			const url = "http://tmi.twitch.tv/group/user/" + currentLiveChannel + "/chatters";
			theRestClient.get(url, function (data, response) {
				try {
					if (testMode) {
						console.log('got back the following data for url: ' + url);
						console.log(data);
					}
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
					if (testMode) {
						console.log('finished point updates, map is:');
						console.log(viewerPointsMap);	
					}
					animaPointsDAO.updateCurrentAnima(viewerPointsMap);
				}
				catch (err) {
			    	console.log('CAUGHT ERROR RUNNING updateViewerPoints():');
					console.log(err);
			   }
			});
			theRestClient.on('error', function (err) {
				console.log('CAUGHT ERROR RUNNING updateViewerPoints()', err.request.options);
			});
		})
		.catch(function(err) {
			console.log('caught error calling scheduleManager.getLiveUserFromSchedule()');
			console.log(err);
		});
}

const removePoints = function(username, pointsToRemove) {
	var currentViewPointsMap = animaPointsDAO.getCurrentAnimaCache();
	var currentPoints = currentViewPointsMap[username];
	if (currentPoints != undefined || currentPoints != null) {
		var newPointTotal = parseInt(currentPoints, 10) - pointsToRemove;
		currentViewPointsMap[username] = newPointTotal;
		animaPointsDAO.updateCurrentAnima(currentViewPointsMap);
	}
}

const addAnima = function(username, amount) {
	var currentViewPointsMap = animaPointsDAO.getCurrentAnimaCache();
	var points = currentViewPointsMap[username];
	if (points == undefined || points == null) {
		points = 0;
	}
	currentViewPointsMap[username] = parseInt(points, 10) + parseInt(amount, 10);
	animaPointsDAO.updateCurrentAnima(currentViewPointsMap);
}

const getPoints = function(username) {
   var currentViewPointsMap = animaPointsDAO.getCurrentAnimaCache();
	var points = currentViewPointsMap[username];
	if (points == undefined || points == null) {
		points = 0;
	}
	return points;
}

const getLeaderBoardString = function() {
	var currentViewPointsMap = animaPointsDAO.getCurrentAnimaCache();
	var sorted = [];
	for (var username in currentViewPointsMap) {
		if (!team.isMember(username) && username !== 'aethernet_bot') {
			sorted.push([username, currentViewPointsMap[username]]);
		}
	}
	sorted.sort(function(a, b) {
		return b[1] - a[1];
	});
	return "🥇 " + sorted[0][0] + " (" + sorted[0][1] + ")\n" +
		"🥈 " + sorted[1][0] + " (" + sorted[1][1] + ")\n" +
		"🥉 " + sorted[2][0] + " (" + sorted[2][1] + ")\n" +
		"    4⃣ " + sorted[3][0] + " (" + sorted[3][1] + ")\n" +
		"    5⃣ " + sorted[4][0] + " (" + sorted[4][1] + ")\n" +
		"    6⃣ " + sorted[5][0] + " (" + sorted[5][1] + ")\n" +
		"    7⃣ " + sorted[6][0] + " (" + sorted[6][1] + ")\n" +
		"    8⃣ " + sorted[7][0] + " (" + sorted[7][1] + ")\n" +
		"    9⃣ " + sorted[8][0] + " (" + sorted[8][1] + ")\n" +
		"    🔟 " + sorted[9][0] + " (" + sorted[9][1] + ")";
}

let updateViewerPointsInterval = 900000; // 15-minutes
if (testMode) {
	updateViewerPointsInterval = 10000; // 10 seconds for testing
}
const getUpdateIntervalMS = function() {
	return updateViewerPointsInterval;
}

// public methods
module.exports = {
		updateViewerPoints: updateViewerPoints,
		removePoints: removePoints,
		addAnima: addAnima,
		getPoints: getPoints,
		getUpdateIntervalMS: getUpdateIntervalMS,
	getLeaderBoardString: getLeaderBoardString
}