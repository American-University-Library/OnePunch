// contains functions for writing and getting log data
// this one is for data stored on Office 365
// as of 1.4.1 only shared drive logging is available

const WindowsNotifications = require("../windowsNotifications");
const SaveLocalLog = require("../saveLocalLog");

module.exports = {

    //whatever is needed to turn the users chosen save location into the info needed for settings file
    getLogLocation: function (folderLocation) {
        return new Promise(function (resolve, reject) {
            resolve();
        });
    },

    // actually saves the log
    enterLog: function (settingsLogObject) {
        return new Promise(function (resolve, reject) {
            resolve();
        });
    },

    // returns the number of punches in a given day
    getDailyTotal: function (returnedSettings) {
        return new Promise(function (resolve, reject) {
            resolve();
        });
    },

    // returns an unsorted object with all the logs needed for the report as specified by user
    getReportData: function (startDate, endDate, showDetailByDesk, showDetailByHour, returnedSettings) {
        return new Promise(function (resolve, reject) {
            resolve();
        });
    },

    // moves all logs saved locally in settings to the shared log location
    moveLocalText: function (returnedSettings) {
        return new Promise(function (resolve, reject) {
            resolve();
        });
    }
}
