module.exports = {

    // called to move locally stored logs from settings to log files
    // those functions are in the individual strategy files
    // dependent on user settings
    // as of 1.4.1 only shared drive logging is available

    moveText: function (window) {
        return new Promise(function (resolve, reject) {
            window.preload.getSettings()
                .then(function (returnedSettings) {
                    settings = returnedSettings;
                    if (returnedSettings.localLogs) {
                        return moveLocalText(returnedSettings);
                    } else {
                        return 0;
                    }
                }).then(function (logsMoved) {
                    logsMovedObj = {};
                    logsMovedObj.logsMoved = logsMoved;
                    logsMovedObj.selectedIcon = settings.selectedIcon || "owl_ico";
                    resolve(logsMovedObj);
                }).catch(function (error) {
                    console.log("Failed!", error);
                });
        });
    }
}

const moveLocalText = (returnedSettings) => {
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
  }
