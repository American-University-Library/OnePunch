const settings = require('electron-settings');
/* const SaveLocalLog = require('./saveLocalLog') */
const WindowsNotifications = require('./windowsNotifications')

// the logObject has a weekday, month, date (00 - 31), year, hour (00 - 23), minute (00 - 60), and desk name
// It's returned as an object attached to the settings object to make the settings available down the promise chain

/* function generateLogObject(returnedSettings) {
    return new Promise(function (resolve, reject) {
        // const deskName = returnedSettings.deskName;
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
        // logObject.deskName = deskName;
        returnedSettings.logObject = logObject
        resolve(returnedSettings);
    });
} */

module.exports = {

    // called to actually log the text
    // those functions are in the individual strategy files
    // dependent on user settings
    // as of 1.4.1 only shared drive logging is available

    logText: function (window, source) {
        return new Promise(async (resolve, reject) => {

            const returnedSettings = await settings.get();
/*             const settingsLogObject = await generateLogObject(returnedSettings);
            const logObject = settingsLogObject.logObject; */
            const assumeDisconnected = returnedSettings.assumeDisconnected;
            const selectedIcon = returnedSettings.selectedIcon || "owl_ico";
            const selectedIconName = selectedIcon + "_64.png";
            // const altNotifications = returnedSettings.altNotifications || false;
            const altNotifications = false;
/*             const currentWeekday = logObject.currentWeekday;
            const currentMonth = logObject.currentMonth;
            const currentDateString = logObject.currentDateString;
            const currentYear = logObject.currentYear;
            const currentHour = logObject.currentHour;
            const currentMinuteString = logObject.currentMinuteString; */
            // const deskName = logObject.deskName;
/*             const logText =
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
                "\r\n"; */
            try {

                const response = await window.preload.postLog();
                if (!response) {
                    throw new Error('Network Unavailable')
                }
                WindowsNotifications.notify("Logged!", "Logged to network", selectedIconName, 2000, altNotifications, window)
                resolve(true);
            } catch (err) {
                console.log('cloud post err', err)
                await saveLocalLog(returnedSettings, window);
                if (assumeDisconnected) {
                    WindowsNotifications.notify(
                        "Logged!",
                        "Logged to local file!",
                        selectedIconName,
                        2000,
                        altNotifications,
                        window
                    );
                    resolve(true);
                } else {
                    WindowsNotifications.notify(
                        "Logged locally!",
                        "Please connect to network.",
                        "exclamation_mark_64.png",
                        3500,
                        altNotifications,
                        window
                    );
                    resolve(true);
                }
            }




        });
    }
}

const saveLocalLog = async (returnedSettings, window) => {
    return new Promise(async (resolve, reject) => {
        try {
            const date = new Date().toUTCString();
            let localLogs = [];
            if (returnedSettings.localLogs) {
                localLogs = returnedSettings.localLogs
            }
            localLogs.push(date);
            await window.preload.setSetting('localLogs', localLogs);
            await window.preload.setSetting('disconnected', true);
            resolve(true);
        } catch(err) {
            console.log(err)
            reject(false)
        }
    })
}