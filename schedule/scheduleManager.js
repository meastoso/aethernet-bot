const gcal = require('google-calendar');
const passportManager = require('../passport/passportManager.js');
const raffleSystem = require('../raffle/raffleSystem.js');

const calendarId = "aethernetbot@gmail.com";
let currentLiveUserCached = '';
const getLiveUserFromSchedule = function() {
	const accessToken = passportManager.getCurrentAccessToken();
	const google_calendar = new gcal.GoogleCalendar(accessToken);
	return new Promise((resolve, reject) => {
		// fetch all events from google calendar
		google_calendar.events.list(calendarId, function(err, data) {
			if (err) {
				console.log("ERROR: ");
				console.log(err);
				passportManager.refreshAccessToken();
				//reject(err);
				return;
			}
			// loop through events and find which event has a start and end time that wraps RIGHT NOW		
			for (let i = 0; i < data.items.length; i++) {
				const thisEvent = data.items[i];
				const now = new Date();
				const startTime = new Date(thisEvent.start.dateTime);
				const endTime = new Date(thisEvent.end.dateTime);
				if (startTime < now && endTime > now) {
					// once found, return "summary" field which is the twitch streamers channel name that is scheduled to be live right now
					if (currentLiveUserCached !== thisEvent.summary) {
						// the live user has changed, close any open raffles
						raffleSystem.closeRaffle();
					}
                    currentLiveUserCached = thisEvent.summary;
					resolve(thisEvent.summary);
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
        google_calendar.events.list(calendarId, function(err, data) {
            if (err) {
                console.log("ERROR: ");
                console.log(err);
                passportManager.refreshAccessToken();
                reject(err);
                return;
            }
            // loop through events and find which event has a start and end time that wraps RIGHT NOW
            for (let i = 0; i < data.items.length; i++) {
                const thisEvent = data.items[i];
                //const now = new Date();
                const startTime = new Date(thisEvent.start.dateTime);
                const endTime = new Date(thisEvent.end.dateTime);
                if (startTime > date1 && endTime < date2) {
                    // once found, return "summary" field which is the twitch streamers channel name that is scheduled to be live right now
                    eventsInRange.push(thisEvent);
                }
            }
            resolve(eventsInRange);
            // TODO SATURDAY:
			// verify tht you can handle the error response that comes back if the unauthenticated thing happens
			// call this API from the front-end
        });
    });
}

// public methods
module.exports = {
	getLiveUserFromSchedule: getLiveUserFromSchedule,
	getLiveUserCached: getLiveUserCached,
    getAllEventsForRange: getAllEventsForRange
}