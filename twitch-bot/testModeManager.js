const testMode = false;
const betaMode = false;

const isTestMode = function() {
	return testMode;
}

const isBetaMode = function() {
	return betaMode
}

// public methods
module.exports = {
		isTestMode: isTestMode,
		isBetaMode: isBetaMode
}