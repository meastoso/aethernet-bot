const restClient = require('node-rest-client').Client;
const theRestClient = new restClient();
const scheduleManager = require('../schedule/scheduleManager.js');

var viewerPointsMap = {};

const updateViewerPoints = function() {
	console.log('inside updateViewerPoints function');	
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
				}
				catch (err) {
			    	console.log('CAUGHT ERROR RUNNING updateViewerPoints():');
					console.log(err);
			   }
			});
		})
		.catch(function(err) {
			console.log('caught error calling scheduleManager.getLiveUserFromSchedule()');
			console.log(err);
		});
}

const removePoints = function(username, pointsToRemove) {
	var currentPoints = viewerPointsMap[username];
	if (currentPoints != undefined || currentPoints != null) {
		var newPointTotal = parseInt(currentPoints, 10) - pointsToRemove;
		viewerPointsMap[username] = newPointTotal;
	}
}

const addAnima = function(username, amount) {
	var points = viewerPointsMap[username];
	if (points == undefined || points == null) {
		points = 0;
	}
	viewerPointsMap[username] = parseInt(points, 10) + parseInt(amount, 10);
}

const getPoints = function(username) {
	var points = viewerPointsMap[username];
	if (points == undefined || points == null) {
		points = 0;
	}
	return points;
}

const updateViewerPointsInterval = 900000; // 15-minutes
//var updateViewerPointsInterval = 10000; // used for testing
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
}