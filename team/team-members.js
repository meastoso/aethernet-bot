const animaPointsDAO = require('../s3/animaPointsDAO.js');

// ENUM where field is member name and property value is HYPE emote to be used
// TODO: EMOTES ARE NOT MANAGED HERE, THEY ARE MANAGED IN  EMOTES.JSON
const members = {
	"spofie": "sofiePog",
	"pookajutsu": "pkjPantsu",
	"josgar": "josgarPuggies",
	"arcane_arts": "arcane2Hug",
	"chaoiv": "chaoivHype",
	"meastoso": "meastoLove",
	"crev": "crevlmLove",
	"tequilashots1500": "teqCheers",
	"tuatime": "tuaLove",
	"seika": "seiLove",
	"rahhzay": "rahhzLove",
	"brianricardo": "ricardoDance",
	"psirisluno": "psirisLOL",
	"chilifarmer": "chilifHUG",
	"darianhart": "darian5Ahaha",
	"deenuglife": "deenugSteer",
	"paopukomi": "paopuWow",
	"curiousjoi": "curiousjoiKupo",
	"llamatodd": "toddllamaBORPA",
	"rookuri": "birdofPride",
	"mtqcapture": "mizzJAM",
	"midnababy": "midnabRave",
	"angelusdemonus": "angelu6Mimicbongo",
	"mo_ranes": "moraneHype",
	"stal": "stalalaBLANKIES",
	"dejavudea": "dejaBlankey",
	"sarahjane": "sjaneHype",
	"aiyanya": "aiyaCheersL"
}

let hypeMsg = '';

// gets an array of the team members in the members object
const getMembers = function() {
	let membersArr = [];
	for (const memberName in members) {
		membersArr.push(memberName);
	}
	return membersArr;
}

// gets an array of the emotes from the members object
const getEmotes = function() {
	let emotesArr = [];
	for (const memberName in members) {
		emotesArr.push(members[memberName]);
	}
	return emotesArr;
}

// TODO: javadocs
const updateHypeCommand = function(sets, obj) {
	hypeMsg = '';
	const availableEmoteMap = {}; // reset so this doesn't grow each time its called (i think this gets called when the bot gets a new sub gifted)
	const aethernetEmoteArr = getEmotes();
    // Make a map of available emotes for aethernet_bot
	console.log("EMOTE OBJ");
	console.log(obj);
	for (var emoteSetId in obj) {
		console.log('checking emoteSetId:' + emoteSetId);
		if (emoteSetId != '0') {
			// found an emote set that's not default/global
			var emotesArr = obj[emoteSetId];
		    for (var i = 0; i < emotesArr.length; i++) {
		    	console.log('Adding ' + emotesArr[i].code + ' to availableEmoteMap');
		    	availableEmoteMap[emotesArr[i].code] = 1;
		    }
		}
	}
	console.log("availableEmoteMap is: ");
	console.log(availableEmoteMap);
	for (var i = 0; i < aethernetEmoteArr.length; i++) {
    	var emote = aethernetEmoteArr[i];
    	console.log('---------------------------')
    	console.log('checking emote: ' + emote);
    	console.log('checking availableEmoteMap[emote]' + availableEmoteMap[emote]);
    	if (availableEmoteMap[emote] !== undefined && availableEmoteMap[emote] !== null && availableEmoteMap[emote] == '1') {
    		console.log('Adding emote ' + emote + ' to hype command');
    		hypeMsg = hypeMsg + ' ' + emote;
    	}
    	else {
    		console.log('ERROR: Emote ' + emote + ' not available to aethernet_bot');
    	}
	}
	/*const komiEmote = members['paopukomi'];
	const deeEmote = members['deenuglife'];
	const brianEmote = members['brianricardo'];
	hypeMsg = hypeMsg + ' ' + komiEmote + ' ' + deeEmote + ' ' + brianEmote;*/
}

const getHypeStr = function() {
	return hypeMsg;
}

const isMember = function(username) {
	return members[username] !== undefined;
}

const updateEmotesS3 = function() {
	animaPointsDAO.getEmotesJson().then((data) => {
		hypeMsg = '';
		for (const key in data.emotes) {
			hypeMsg = hypeMsg + data.emotes[key] + " ";
		}
	}).catch((err) => {
		console.log("EXCEPTION IN UPDATE EMOTES S3");
		console.log(err);
	});
}

// public methods
module.exports = {
	getMembers: getMembers,
	getEmotes: getEmotes,
	updateHypeCommand: updateHypeCommand,
	getHypeStr: getHypeStr,
	isMember: isMember,
	updateEmotesS3: updateEmotesS3
}