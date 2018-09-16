var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var passport = require('passport');
var refresh = require('passport-oauth2-refresh')
var fs = require('fs');

/*
* Fetch google app client secret from local file
*/
var credentials = {};
try {
	credentials = JSON.parse(fs.readFileSync('twitch-credentials', 'utf8'));
}
catch (err) {
	console.log('ERROR: Could not read file "twitch-credentials" at project root. Please ensure this file exists and is populated');
	console.log(err);
}

const refreshToken = credentials["refresh-token"];
let currentAccessToken = '';

const strategy = new GoogleStrategy({
    clientID: credentials["google-client-id"],
    clientSecret: credentials["google-client-secret"],
    callbackURL: "http://localhost:3000/auth/callback",
    passReqToCallback: true 
  },
  function(req, accessToken, refreshToken, params, profile, done) {
    // find expiry_date so it can be save in the database, along with access and refresh token
    //const expiry_date = moment().add(params.expires_in, "s").format("X");
    console.log('access token is:');
    console.log(accessToken);
    console.log('refresh token is:');
    console.log(refreshToken);
    return done(null, profile);
  }
);

// configure passport and refresh-passport
passport.use(strategy);
refresh.use(strategy);

const authenticate = passport.authenticate('google', {
		scope: ['openid', 'email', 'https://www.googleapis.com/auth/calendar'],
		accessType: 'offline',
		prompt: 'consent',
	});
	
const callback = passport.authenticate('google', { session: false, failureRedirect: '/auth' });

const getPassport = function() {
	return passport;
}

const refreshAccessToken = function() {
	refresh.requestNewAccessToken('google', refreshToken, function(err, accessToken, refreshToken) {
	  // You have a new access token, store it in the user object,
	  // or use it to make a new request.
	  // `refreshToken` may or may not exist, depending on the strategy you are using.
	  // You probably don't need it anyway, as according to the OAuth 2.0 spec,
	  // it should be the same as the initial refresh token.
	 	currentAccessToken = accessToken;
	});
};

const getCurrentAccessToken = function() {
	return currentAccessToken;
}

// public methods
module.exports = {
		authenticate: authenticate,
		callback: callback,
		getPassport: getPassport,
		refreshAccessToken: refreshAccessToken,
		getCurrentAccessToken: getCurrentAccessToken
}