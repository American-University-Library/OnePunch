module.exports = {

    // called to move locally stored logs from settings to log files
    // those functions are in the individual strategy files
    // dependent on user settings
    // as of 1.4.1 only shared drive logging is available

    moveText: function (window) {
        return new Promise(async (resolve, reject) => {
            try {
                const returnedSettings = await window.preload.getSettings();
                let logsMoved = 0;
                settings = returnedSettings;
                if (returnedSettings.localLogs) {
                    const localLogs = returnedSettings.localLogs;
                    console.log(localLogs)
                    logsMovedCount = localLogs.length;
                    for (log of localLogs) {
                        const res = await window.preload.postLog(log, true);
                        if (!res) {
                            throw new Error('Connection Error')
                        }
                    }
                }
                console.log(logsMovedCount)
                logsMovedObj = {};
                logsMovedObj.logsMoved = logsMovedCount;
                logsMovedObj.selectedIcon = settings.selectedIcon || "owl_ico";
                await window.preload.setSetting('disconnected', false)
                await window.preload.setSetting('localLogs', [])
                resolve(logsMovedObj);
            } catch (err) {
                await window.preload.setSetting('disconnected', true)
                reject(false)
            }


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
