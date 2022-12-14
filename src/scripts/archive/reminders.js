const NetworkStrategy = require('./networkStrategy');
const GoogleStrategy = require('../googleStrategy');
const OfficeStrategy = require('./officeStrategy');
const CloudStrategy = require('../cloudStrategy');


module.exports = {

    // this pulls daily punch counts for the reminders. it combines shared file with local count

    getDailyPunches: function (returnedSettings) {
        return new Promise(function (resolve, reject) {
            let returnPunchCountObj = {};
            getSharedPunchCount(returnedSettings).then(function (sharedPunchCount) {
                // if the shared file can't be accessed
                if (!sharedPunchCount && sharedPunchCount !== 0) {
                    returnPunchCountObj.sharedPunches = false;
                    if (returnedSettings.localLogs) {
                        let localPunches = returnedSettings.localLogs.length;
                        returnPunchCountObj.punchCount = localPunches;
                        resolve(returnPunchCountObj);
                    } else {
                        let localPunches = 0
                        returnPunchCountObj.punchCount = localPunches;
                        resolve(returnPunchCountObj);
                    }
                } else {
                    returnPunchCountObj.sharedPunches = true;
                    if (returnedSettings.localLogs) {
                        let localPunches = returnedSettings.localLogs.length;
                        returnPunchCountObj.punchCount = localPunches + sharedPunchCount;
                        resolve(returnPunchCountObj);
                    } else {
                        let localPunches = 0
                        returnPunchCountObj.punchCount = localPunches + sharedPunchCount;
                        resolve(returnPunchCountObj);
                    }
                }
            });

        });
    }
}

// called to get the shared daily punch count
// dependent on user settings
// as of 1.4.1 only shared drive logging is available

function getSharedPunchCount(returnedSettings) {
    return new Promise(function (resolve, reject) {
        // get the number of punches today
        resolve(returnedSettings);
    });
}
