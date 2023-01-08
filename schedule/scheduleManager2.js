const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const raffleSystem = require("../raffle/raffleSystem");
const testModeManager = require("../twitch-bot/testModeManager");
const testMode = testModeManager.isTestMode();
const betaMode = testModeManager.isBetaMode();

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

let currentLiveUserCached = '';
// const MARATHON_START_DATE = new Date('August 23, 2022 00:00:00');
// const MARATHON_END_DATE = new Date('September 10, 2022 00:00:00');

const MARATHON_START_DATE = new Date('January 7, 2023 00:00:00');
const MARATHON_END_DATE = new Date('January 24, 2023 00:00:00');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listEvents(auth, timeMin, timeMax) {
    const calendar = google.calendar({version: 'v3', auth});
    const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin,
        timeMax: timeMax,
        singleEvents: true,
        orderBy: 'startTime',
    });
    const events = res.data.items;
    return events;
}

async function deleteEvent(auth, eventId) {
    const calendar = google.calendar({version: 'v3', auth});
    // const res = await calendar.events.list({
    //     calendarId: 'primary',
    //     timeMin: timeMin,
    //     timeMax: timeMax,
    //     singleEvents: true,
    //     orderBy: 'startTime',
    // });
    await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId
    });
}

const getLiveUserFromSchedule = async function() {
    const client = await authorize();
    const events = await listEvents(client, MARATHON_START_DATE, MARATHON_END_DATE);
    // loop through events and find which event has a start and end time that wraps RIGHT NOW
    for (let i = 0; i < events.length; i++) {
        const thisEvent = events[i];
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
                if (raffleSystem.isRaffleOpen() && raffleSystem.hasDrawTicketBeenUsed()) {
                    raffleSystem.closeRaffle();
                }
            }
            if (thisEvent && thisEvent.summary) {
                currentLiveUserCached = thisEvent.summary.toLowerCase();
            }
            if (testMode || betaMode) {
                console.log('currentLiveUserCached SUCCESS!: currentLiveUserCached is: ' + currentLiveUserCached);
            }
            return currentLiveUserCached
        }
    }
    return "no live user found";
}

const getLiveUserCached = function() {
    return currentLiveUserCached;
}

const getAllEventsForRange = async function(date1, date2) {
    const client = await authorize();
    const events = await listEvents(client);
    let eventsInRange = [];
    // loop through events and find which event has a start and end time
    for (let i = 0; i < events.length; i++) {
        const thisEvent = events[i];
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
    return eventsInRange;
}

const deleteOldEventsBeforeDate = async function(dateBefore) {
    const client = await authorize();
    const oneYearBefore = new Date(new Date().setFullYear(dateBefore.getFullYear() - 1))
    const events = await listEvents(client, oneYearBefore, dateBefore);
    for (let i = 0; i < events.length; i++) {
        const thisEvent = events[i];
        //const now = new Date();
        const startTime = new Date(thisEvent.start.dateTime);
        console.log("reviewing new event:");
        console.log(thisEvent.summary + " " + thisEvent.start.dateTime.toString());
        if (startTime < dateBefore) {
            // once found, return "summary" field which is the twitch streamers channel name that is scheduled to be live right now
            console.log("Deleting event: " + thisEvent.id);
            // google_calendar.events.delete(calendarId, thisEvent.id, function(err, data) {
            //     console.log("SUCCESS DELETED EVENT ID: " + thisEvent.id);
            //     console.log(data);
            //     console.log(err);
            // })
            await deleteEvent(client, thisEvent.id);
            console.log("success");
        }
    }
}

// public methods
module.exports = {
    getLiveUserFromSchedule: getLiveUserFromSchedule,
    getLiveUserCached: getLiveUserCached,
    getAllEventsForRange: getAllEventsForRange,
    deleteOldEventsBeforeDate: deleteOldEventsBeforeDate,
    // getEvent: getEvent
}