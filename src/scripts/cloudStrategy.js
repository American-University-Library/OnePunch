// contains functions for writing and getting log data
// this one is for data stored on in a cloud database
// as of 1.4.1 only shared drive logging is available

const WindowsNotifications = require("./windowsNotifications");
const SaveLocalLog = require("./saveLocalLog");

module.exports = {
  //whatever is needed to turn the users chosen save location into the info needed for settings file
  getLogLocation: function ([url, key]) {
    return new Promise(function (resolve, reject) {
      resolve(url + "api_key=" + key);
    });
  },

  // actually saves the log
  enterLog: function (settingsLogObject) {
    return new Promise(function (resolve, reject) {
      try {
        const logObject = settingsLogObject.logObject;
        const assumeDisconnected = settingsLogObject.assumeDisconnected;
        const selectedIcon = settingsLogObject.selectedIcon || "owl_ico";
        const selectedIconName = selectedIcon + "_64.png";
        const altNotifications = settingsLogObject.altNotifications || false;
        const currentWeekday = logObject.currentWeekday;
        const currentMonth = logObject.currentMonth;
        const currentDateString = logObject.currentDateString;
        const currentYear = logObject.currentYear;
        const currentHour = logObject.currentHour;
        const currentMinuteString = logObject.currentMinuteString;
        const deskName = logObject.deskName;
        const logText =
          currentWeekday +
          "," +
          currentMonth +
          "/" +
          currentDateString +
          "/" +
          currentYear +
          "," +
          currentHour +
          ":" +
          currentMinuteString +
          "," +
          deskName +
          "\r\n";
        // perform fetch
        console.log(settingsLogObject);
        resolve(logObject);
      } catch (err) {
        SaveLocalLog.saveLocalLog(settingsLogObject, window).then(function (
          logObject
        ) {
          if (assumeDisconnected) {
            WindowsNotifications.notify(
              "Logged!",
              "Logged to local file!",
              selectedIconName,
              2000,
              altNotifications,
              window
            );
            resolve(logObject);
          } else {
            WindowsNotifications.notify(
              "Logged locally!",
              "Please connect to shared drive.",
              "exclamation_mark_64.png",
              3500,
              altNotifications,
              window
            );
            resolve(logObject);
          }
        });
      }
    });
  },

  // returns the number of punches in a given day
  getDailyTotal: function (returnedSettings) {
    return new Promise(function (resolve, reject) {
      console.log(returnedSettings);
      // get the number of punches today
      resolve(1);
    });
  },

  // returns an unsorted object with all the logs needed for the report as specified by user
  getReportData: function (
    startDate,
    endDate,
    showDetailByDesk,
    showDetailByHour,
    returnedSettings
  ) {
    return new Promise(function (resolve, reject) {
      console.log(
        startDate,
        endDate,
        showDetailByDesk,
        showDetailByHour,
        returnedSettings
      );
      // get report data
      let objectArray = [];
      let logObj = {};
      logObj.day = logEntryArray[0];
      logObj.date = logEntryArray[1];
      logObj.time = logEntryArray[2];
      logObj.desk = logEntryArray[3];
      logDateTimeString = logEntryArray[1] + " " + logEntryArray[2];
      logObj.jsDate = new Date(logDateTimeString);
      logObj.hour = logObj.jsDate.getHours();
      logObj.count = 1;
      objectArray.push(logObj);
      resolve(objectArray);
    });
  },

  // moves all logs saved locally in settings to the shared log location
  moveLocalText: function (returnedSettings) {
    return new Promise(function (resolve, reject) {
      console.log(returnedSettings);
      const localLogs = returnedSettings.localLogs;
      var len = localLogs.length;
      var i = 0;
      localLogs.forEach(function (logObject) {
        const currentWeekday = logObject.currentWeekday;
        const currentMonth = logObject.currentMonth;
        const currentDateString = logObject.currentDateString;
        const currentYear = logObject.currentYear;
        const currentHour = logObject.currentHour;
        const currentMinuteString = logObject.currentMinuteString;
        const deskName = logObject.deskName;
        const logText =
          currentWeekday +
          "," +
          currentMonth +
          "/" +
          currentDateString +
          "/" +
          currentYear +
          "," +
          currentHour +
          ":" +
          currentMinuteString +
          "," +
          deskName +
          "\r\n";
      });
      // load local logs
      resolve();
    });
  },
};
