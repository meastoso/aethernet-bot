const gcal = require('google-calendar');
const passportManager = require('../passport/passportManager.js');

const calendarId = "aethernetbot@gmail.com";
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
					resolve(thisEvent.summary);
					return;
				}
			}
			resolve(null);
	  });
  });
}

// public methods
module.exports = {
		getLiveUserFromSchedule: getLiveUserFromSchedule,
}