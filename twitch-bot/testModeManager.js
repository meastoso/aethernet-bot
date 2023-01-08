const testMode = false;
const betaMode = true;

/*
Properties of test mode:
 - Points check interval is 10 seconds vs. 15 minutes
 - !hype command checks if its not test AND not beta modes
 - Adds extra pointsManager logging
 - Bot only logs into the following channels: meastoso
 */
const isTestMode = function() {
	return testMode;
}

/*
Properties of Beta mode:
 - !hype command checks if its not test AND not beta modes
 */
const isBetaMode = function() {
	return betaMode
}

// public methods
module.exports = {
		isTestMode: isTestMode,
		isBetaMode: isBetaMode
}