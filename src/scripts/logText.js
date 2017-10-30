const fs = require('fs');
const WindowsNotifications = require("./windowsNotifications");
const SettingsScript = require('./settings_script');

module.exports = {
    logText: function () {
        SettingsScript.getSetting().then(function (returnedSettings) {
            const logPath = returnedSettings.logPath.primary;
            const deskName = returnedSettings.deskName;
            const secondaryLogPath = returnedSettings.logPath.secondary;
            const tertiaryLogPath = returnedSettings.logPath.tertiary;
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
            const logText = currentWeekday + "," + currentMonth + "/" + currentDateString + "/" + currentYear + "," + currentHour + ":" + currentMinuteString + "," + deskName + '\r\n';
            const primary = logPath + "\\op_log.txt";
            const secondary = secondaryLogPath + "\\op_log.txt";
            const tertiary = tertiaryLogPath + "\\op_log.txt";
            fs.writeFile(
                primary,
                logText, {
                    encoding: "UTF-8",
                    flag: "a"
                },
                function (err) {
                    if (err) {
                        fs.writeFile(
                            secondary,
                            logText, {
                                encoding: "UTF-8",
                                flag: "a"
                            },
                            function (err) {
                                if (err) {
                                    fs.writeFile(
                                        tertiary,
                                        logText, {
                                            encoding: "UTF-8",
                                            flag: "a"
                                        },
                                        function (err) {
                                            if (err) {
                                                SettingsScript.getSetting('localLogs').then(function (localLogs) {
                                                    if (localLogs) {
                                                        localLogs.push(logText);
                                                        SettingsScript.saveSetting('localLogs', localLogs);
                                                        WindowsNotifications.notify("Logged locally!", "Please connect to shared drive.", "exclamation_mark_64.png", 3500);
                                                        return logText;
                                                    } else {
                                                        localLogs = [];
                                                        localLogs.push(logText);
                                                        SettingsScript.saveSetting('localLogs', localLogs);
                                                        WindowsNotifications.notify("Logged locally!", "Please connect to shared drive.", "exclamation_mark_64.png", 3500);
                                                        return logText;
                                                    }
                                                });
                                            } else {
                                                WindowsNotifications.notify("Logged!", "Logged to shared drive!", "owl_ico_64.png", 2000)
                                                return logText;
                                            }
                                        });
                                } else {
                                    WindowsNotifications.notify("Logged!", "Logged to shared drive!", "owl_ico_64.png", 2000)
                                    return logText;
                                }
                            });
                    } else {
                        WindowsNotifications.notify("Logged!", "Logged to shared file", "owl_ico_64.png", 2000)
                        return logText;
                    }
                });
        });
    }
}
