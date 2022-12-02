const NetworkStrategy = require('./networkStrategy');
const GoogleStrategy = require('../googleStrategy');
const OfficeStrategy = require('./officeStrategy');
const CloudStrategy = require('../cloudStrategy');

const settings = require('electron-settings');

// the logObject has a weekday, month, date (00 - 31), year, hour (00 - 23), minute (00 - 60), and desk name
// It's returned as an object attached to the settings object to make the settings available down the promise chain

function generateLogObject(returnedSettings) {
    return new Promise(function (resolve, reject) {
        const deskName = returnedSettings.deskName;
        const weekday = new Array(7);
        weekday[0] = "Sun";
        weekday[1] = "Mon";
        weekday[2] = "Tue";
        weekday[3] = "Wed";
        weekday[4] = "Thu";
        weekday[5] = "Fri";
        weekday[6] = "Sat";
        const current = new Date();
        const currentMonth = current.getMonth() + 1;
        const currentDate = current.getDate();
        const currentDay = current.getDay();
        const currentYear = current.getFullYear();
        const currentHour = current.getHours();
        const currentMinute = current.getMinutes();
        let currentMinuteString = "" + currentMinute;
        if (currentMinuteString.length < 2) {
            currentMinuteString = "0" + currentMinuteString;
        }
        let currentDateString = "" + currentDate;
        if (currentDateString.length < 2) {
            currentDateString = "0" + currentDateString;
        }
        const currentWeekday = weekday[currentDay];
        const logObject = {};
        logObject.currentWeekday = currentWeekday;
        logObject.currentMonth = currentMonth;
        logObject.currentDateString = currentDateString;
        logObject.currentYear = currentYear;
        logObject.currentHour = currentHour;
        logObject.currentMinuteString = currentMinuteString;
        logObject.deskName = deskName;
        returnedSettings.logObject = logObject
        resolve(returnedSettings);
    });
}

module.exports = {

    // called to actually log the text
    // those functions are in the individual strategy files
    // dependent on user settings
    // as of 1.4.1 only shared drive logging is available

    logText: function (window,source) {
        console.log('source is ', source)
        return new Promise(function (resolve, reject) {
            settings.get()
                .then(function (returnedSettings) {
                    return generateLogObject(returnedSettings);
                }).then(function (settingsLogObject) {
                    if (settingsLogObject.logStrategy === "network") {
                        return NetworkStrategy.enterLog(settingsLogObject,window);
                    } else if (settingsLogObject.logStrategy === "google") {
                        return GoogleStrategy.enterLog(settingsLogObject);
                    } else if (settingsLogObject.logStrategy === "office") {
                        return OfficeStrategy.enterLog(settingsLogObject);
                    } else if (settingsLogObject.logStrategy === "cloud") {
                        return CloudStrategy.enterLog(settingsLogObject, window);
                    }
                }).then(function (logObject) {
                    resolve(logObject);
                }).catch(function (error) {
                    console.log("Failed!", error);
                });
        });
    }
}
