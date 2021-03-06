// ENUM where field is member name and property value is HYPE emote to be used
const members = {
	'spofie': 'sofiePog',
	'pookajutsu': 'pkjPantsu',
	'josgar': 'josgarPuggies',
	'arcane_arts': 'arcane2Hug',
	'hupo': 'hupoLove',
	'phoenixchao': 'fuganoSing',
	'meastoso': 'meastoLove',
	'crevlm': 'crevlmHype',
	'tequilashots1500': 'tequil3Cheers',
	'missrogueflame': 'mrfHype',
	'tuatime': 'tuaLove',
	'seika': 'seiLove',
	'rahhzay': 'rahhzLove',
	'galaxyaus': 'glxyHYPER',
	'glennangel': 'glennaSweet',
	'brianricardo': 'brianr1Ayaya',
	'psirisluno': 'psirisLOL',
	'chilifarmer': 'chilifHUG',
	'shleb': 'shlebHYPERS',
	'darianhart': 'darian5Hart',
	'deenuglife': 'deenugHype',
	'paopukomi': 'paopuHype',
	'ethysasher': 'ethPalm'
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
	availableEmoteMap = {}; // reset so this doesn't grow each time its called (i think this gets called when the bot gets a new sub gifted)
	const aethernetEmoteArr = getEmotes();
    // Make a map of available emotes for aethernet_bot
	for (var emoteSetId in obj) {
		//console.log('checking emoteSetId:' + emoteSetId);
		if (emoteSetId != '0') {
			// found an emote set that's not default/global
			var emotesArr = obj[emoteSetId];
			//console.log(emotesArr);
		    for (var i = 0; i < emotesArr.length; i++) {
		    	//console.log('Adding ' + emotesArr[i].code + ' to availableEmoteMap');
		    	availableEmoteMap[emotesArr[i].code] = 1;
		    }
		}
	}
	for (var i = 0; i < aethernetEmoteArr.length; i++) {
    	var emote = aethernetEmoteArr[i];
    	console.log('---------------------------')
    	console.log('checking emote: ' + emote);
    	//console.log('checking availableEmoteMap[emote]' + availableEmoteMap[emote]);
    	if (availableEmoteMap[emote] !== undefined && availableEmoteMap[emote] !== null && availableEmoteMap[emote] == '1') {
    		console.log('Adding emote ' + emote + ' to hype command');
    		hypeMsg = hypeMsg + ' ' + emote;
    	}
    	else {
    		console.log('ERROR: Emote ' + emote + ' not available to aethernet_bot');
    	}
	}
}

const getHypeStr = function() {
	return hypeMsg;
}

const isMember = function(username) {
	return members[username] !== undefined;
}

// public methods
module.exports = {
		getMembers: getMembers,
		getEmotes: getEmotes,
		updateHypeCommand: updateHypeCommand,
		getHypeStr: getHypeStr,
		isMember: isMember,
}