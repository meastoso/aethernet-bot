const gcal = require('google-calendar');
const passportManager = require('../passport/passportManager.js');
const raffleSystem = require('../raffle/raffleSystem.js');
const testModeManager = require('../twitch-bot/testModeManager.js');
const testMode = testModeManager.isTestMode();
const betaMode = testModeManager.isBetaMode();

const calendarId = "aethernetbot@gmail.com";
let currentLiveUserCached = '';
const theOptions = {
	maxResults: 100,
	orderBy: 'startTime',
	singleEvents: true
}
const getLiveUserFromSchedule = function() {
	const accessToken = passportManager.getCurrentAccessToken();
	// console.log("access token is:");
	// console.log(accessToken);
	const google_calendar = new gcal.GoogleCalendar(accessToken);
	return new Promise((resolve, reject) => {
		// fetch all events from google calendar
		google_calendar.events.list(calendarId, theOptions, function(err, data) {
			if (err) {
				console.log("ERROR in schedule manager: ");
				console.log(err);
				passportManager.refreshAccessToken();
				//reject(err);
				return;
			}
			// console.log("number of schedule item: " + data.items.length);
			// loop through events and find which event has a start and end time that wraps RIGHT NOW		
			for (let i = 0; i < data.items.length; i++) {
				const thisEvent = data.items[i];
				const now = new Date();
				const startTime = new Date(thisEvent.start.dateTime);
				const endTime = new Date(thisEvent.end.dateTime);
				/*if (thisEvent.summary.toLowerCase() === "meastoso") {
					console.log("--------------------");
					console.log("found a meastoso event");
					console.log(thisEvent);
				}*/
				if (startTime < now && endTime > now) {
					// once found, return "summary" field which is the twitch streamers channel name that is scheduled to be live right now
					if (currentLiveUserCached !== thisEvent.summary.toLowerCase()) {
						// the live user has changed, close any open raffles
						raffleSystem.closeRaffle();
					}
					if (thisEvent && thisEvent.summary) {
						currentLiveUserCached = thisEvent.summary.toLowerCase();
					}
					if (testMode || betaMode) {
						console.log('currentLiveUserCached SUCCESS!: currentLiveUserCached is: ' + currentLiveUserCached);
					}
					resolve(currentLiveUserCached);
					return;
				}
			}
			resolve(null);
	  });
  });
}

const getLiveUserCached = function() {
	return currentLiveUserCached;
}

const getAllEventsForRange = function(date1, date2) {
    const accessToken = passportManager.getCurrentAccessToken();
    const google_calendar = new gcal.GoogleCalendar(accessToken);
    let eventsInRange = [];
    return new Promise((resolve, reject) => {
        // fetch all events from google calendar
        google_calendar.events.list(calendarId, theOptions, function(err, data) {
            if (err) {
                console.log("ERROR: ");
                console.log(err);
                passportManager.refreshAccessToken();
                reject(err);
                return;
            }
            // console.log('number of events: ' + data.items.length);
            // loop through events and find which event has a start and end time that wraps RIGHT NOW
            for (let i = 0; i < data.items.length; i++) {
                const thisEvent = data.items[i];
                //const now = new Date();
                const startTime = new Date(thisEvent.start.dateTime);
                const endTime = new Date(thisEvent.end.dateTime);
                // console.log("reviewing new event:");
                // console.log(thisEvent.summary + " " + thisEvent.start.dateTime.toString());
                if (startTime > date1 && endTime < date2) {
                    // once found, return "summary" field which is the twitch streamers channel name that is scheduled to be live right now
                    eventsInRange.push(thisEvent);
                    // console.log("added event to list");
                }
            }
			if (testMode || betaMode) {
				// console.log('eventsInRange SUCCESS!: eventsInRange is: ' + eventsInRange);
			}
            resolve(eventsInRange);
            // TODO SATURDAY:
			// verify tht you can handle the error response that comes back if the unauthenticated thing happens
			// call this API from the front-end
        });
    });
}

const deleteOldEventsBeforeDate = async function(dateBefore) {
	const accessToken = passportManager.getCurrentAccessToken();
	const google_calendar = new gcal.GoogleCalendar(accessToken);
	let eventsInRange = [];
	return new Promise(async (resolve, reject) => {
		// fetch all events from google calendar
		google_calendar.events.list(calendarId, async function(err, data) {
			if (err) {
				console.log("ERROR: ");
				console.log(err);
				passportManager.refreshAccessToken();
				reject(err);
				return;
			}
			console.log('number of events: ' + data.items.length);
			// loop through events and find which event has a start and end time that wraps RIGHT NOW
			for (let i = 0; i < data.items.length; i++) {
				const thisEvent = data.items[i];
				//const now = new Date();
				const startTime = new Date(thisEvent.start.dateTime);
				console.log("reviewing new event:");
				console.log(thisEvent.summary + " " + thisEvent.start.dateTime.toString());
				if (startTime < dateBefore) {
					// once found, return "summary" field which is the twitch streamers channel name that is scheduled to be live right now
					eventsInRange.push(thisEvent);
					console.log("Deleting event: " + thisEvent.id);
					google_calendar.events.delete(calendarId, thisEvent.id, function(err, data) {
						console.log("SUCCESS DELETED EVENT ID: " + thisEvent.id);
						console.log(data);
						console.log(err);
					})
				}
				await new Promise(r => setTimeout(r, 1000));
			}
			/*if (testMode || betaMode) {
				console.log('eventsInRange SUCCESS!: eventsInRange is: ');
				console.log(eventsInRange);
			}*/
			resolve(eventsInRange);
			// TODO SATURDAY:
			// verify tht you can handle the error response that comes back if the unauthenticated thing happens
			// call this API from the front-end
		});
	});
}

const getEvent = async function(eventId) {
	const accessToken = passportManager.getCurrentAccessToken();
	const google_calendar = new gcal.GoogleCalendar(accessToken);
	return new Promise(async (resolve, reject) => {
		// fetch all events from google calendar
		google_calendar.events.get("primary", eventId, async function(err, data) {
			if (err) {
				console.log("ERROR: ");
				console.log(err);
				passportManager.refreshAccessToken();
				reject(err);
				return;
			}
			console.log('SUCCESS GET EVENT');
			console.log(data)
			resolve(data);
		});
	});
}

// public methods
module.exports = {
	getLiveUserFromSchedule: getLiveUserFromSchedule,
	getLiveUserCached: getLiveUserCached,
    getAllEventsForRange: getAllEventsForRange,
	deleteOldEventsBeforeDate: deleteOldEventsBeforeDate,
	getEvent: getEvent
}