// contains functions for writing and getting log data
// this one is for data stored on in a cloud database
// as of 1.4.1 only shared drive logging is available

const WindowsNotifications = require("../windowsNotifications");
const SaveLocalLog = require("../saveLocalLog");

module.exports = {
  

  // moves all logs saved locally in settings to the shared log location
  moveLocalText: function (returnedSettings) {
    return new Promise(function (resolve, reject) {
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
        // const deskName = logObject.deskName;
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
          currentMinuteString +/* 
          "," +
          deskName + */
          "\r\n";
      });
      // load local logs
      resolve();
    });
  },
};
