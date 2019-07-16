"use strict";

/*
Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const AWS = require('aws-sdk');
AWS.config.loadFromPath('./credentials'); 
const s3 = new AWS.S3();
const animaBucket = 'aethernet-anima-backup';
const configKey = 'anima-patch-5-0';

let animaCache = {};

//const TEST_MODE = true;

// method to get the current global configuration for the bot
const getCurrentAnima = function() {
	return new Promise((resolve, reject) => {
		let params = {Bucket: animaBucket, Key: configKey};
		s3.getObject(params, function(err, data) {
			if (err) {
				console.log('Failed to get the current anima from S3...');
				console.log(err);
				reject(err);
			} else {
				console.log('Successfully retrieved current anima from S3...');
				resolve(JSON.parse(data.Body.toString()));
			}
		});
	});
}

// Method to update the configuration with the new config object specified
const updateCurrentAnima = function(updatedAnimaTotalsObj) {
	return new Promise((resolve, reject) => {
		let params = {Bucket: animaBucket, Key: configKey, Body: JSON.stringify(updatedAnimaTotalsObj)};
		s3.putObject(params, function(err, data) {
			if (err) {
				console.log('Failed to update the current anima in S3...');
				console.log(err);
				reject(err);
			} else {
				console.log('Successfully updated the current anima in S3...');
				resolve('OK');
			}
		});
	});
}

/*############################################################
 * When bot starts or restarts, load current anima into cache
 ############################################################*/
getCurrentAnima()
	.then((animaTotalsObj) => {
		console.log('Successfully current anima at startup...');
		// console.log(animaTotalsObj);
		animaCache = animaTotalsObj;
	})
	.catch((err) => {
		console.log('Error when trying to get current anima at startup...');
		console.log(err);
	});

//console.log('RESETTING ALL ANIMA RIGHT NOW!');
//updateCurrentAnima({});


// NOTE: The code below is useful when trying to get unique users for stats after the marathon
getCurrentAnima()
    .then((animaTotalsObj) => {
        console.log('Successfully current anima at startup...');
        //console.log(animaTotalsObj);
        animaCache = animaTotalsObj;
        //console.log('animaCache is:');
        console.log('Number of unique viewers: ' + Object.keys(animaCache).length);
        var totalCurrentAnima = 0;
        for (var username in animaCache) {
            if (animaCache.hasOwnProperty(username)) {
                totalCurrentAnima += parseInt(animaCache[username], 10);
            }
        }
        console.log('totalCurrentAnima is: ' + totalCurrentAnima);
    })
    .catch((err) => {
        console.log('Error when trying to get current anima at startup...');
        console.log(err);
    });

	
const getCurrentAnimaCache = function() {
	return animaCache;
}


// public methods
module.exports = {
		getCurrentAnimaCache: getCurrentAnimaCache,
		updateCurrentAnima: updateCurrentAnima,
}