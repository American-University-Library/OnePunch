// contains functions for writing and getting log data
// this one is for data stored on shared network drives
// as of 1.4.1 this is the only one available

const fs = require('fs');
const WindowsNotifications = require("./windowsNotifications");
const SaveLocalLog = require("./saveLocalLog");
//const { settings } = require('cluster');

const settings = require('electron-settings');

module.exports = {

    // substantially complicating this is the need to potentially use three different variants of the saved drive folder
    // drive mapping to get to the same folder is inconsistent (at my workplace) so the app stores all three possibilities and tests them
    // in an implementation anywhere else I assume this isn't necessary
    // and the latter two "(if err) --> try a different folder" calls wouldnt be needed in any of these functions

     //whatever is needed to turn the users chosen save location into the info needed for settings file
    getLogLocation: function (folderLocation) {
        return new Promise(function (resolve, reject) {
            let logPath = {};
            logPath.display = folderLocation;
            logPath.primary = folderLocation.toLowerCase();
            if (logPath.primary.indexOf("i:\\library\\") > -1) {
                logPath.secondary = logPath.primary.slice(0, 3) + logPath.primary.slice(11);
                logPath.tertiary = logPath.primary.replace("i:", "\\\\fs9.american.edu\\shared");
            } else if (logPath.primary.indexOf("\\\\fs") > -1) {
                logPath.secondary = logPath.primary.replace("\\\\fs9.american.edu\\shared", "i:");
                logPath.secondary = logPath.primary.replace("\\\\fs9.american.edu\\shared\\library", "i:");
            } else {
                logPath.secondary = logPath.primary.slice(0, 2) + "\\library" + logPath.primary.slice(2);
                if (logPath.primary.indexOf("i:\\") > -1) {
                    logPath.tertiary = logPath.secondary.replace("i:", "\\\\fs9.american.edu\\shared");
                } else {
                    logPath.tertiary = logPath.secondary;
                }

            }
            resolve(logPath);
        });
    },

    // actually saves the log
    enterLog: function (settingsLogObject,window) {
        console.log('firing enter log')
        return new Promise(function (resolve, reject) {
            const logPath = settingsLogObject.logPath.primary;
            const secondaryLogPath = settingsLogObject.logPath.secondary;
            const tertiaryLogPath = settingsLogObject.logPath.tertiary;
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
                                                SaveLocalLog.saveLocalLog(settingsLogObject, window).then(function (logObject) {
                                                    if (assumeDisconnected) {
                                                        WindowsNotifications.notify("Logged!", "Logged to local file!", selectedIconName, 2000, altNotifications,window)
                                                        resolve(logObject);
                                                    } else {
                                                        WindowsNotifications.notify("Logged locally!", "Please connect to shared drive.", "exclamation_mark_64.png", 3500, altNotifications,window);
                                                        resolve(logObject);
                                                    }
                                                });
                                            } else {
                                                WindowsNotifications.notify("Logged!", "Logged to shared file!", selectedIconName, 2000, altNotifications,window)
                                                resolve(logObject);
                                            }
                                        });
                                } else {
                                    WindowsNotifications.notify("Logged!", "Logged to shared file!", selectedIconName, 2000, altNotifications,window)
                                    resolve(logObject);
                                }
                            });
                    } else {
                        WindowsNotifications.notify("Logged!", "Logged to shared file", selectedIconName, 2000, altNotifications,window)
                        resolve(logObject);
                    }
                });
        });
    },

    // returns the number of punches in a given day
    getDailyTotal: function (returnedSettings) {
        return new Promise(function (resolve, reject) {
            const deskName = returnedSettings.deskName;
            const logPath = returnedSettings.logPath.primary;
            const secondaryLogPath = returnedSettings.logPath.secondary;
            const tertiaryLogPath = returnedSettings.logPath.tertiary;
            const primary = logPath + "\\op_log.txt";
            const secondary = secondaryLogPath + "\\op_log.txt";
            const tertiary = tertiaryLogPath + "\\op_log.txt";
            const current = new Date();
            const currentMonth = current.getMonth() + 1;
            const currentDate = current.getDate();
            const currentYear = current.getFullYear();
            let currentDateString = "" + currentDate;
            if (currentDateString.length < 2) {
                currentDateString = "0" + currentDateString;
            }
            const matchDateString = currentMonth + "/" + currentDateString + "/" + currentYear;
            let punchesCounter = 0;
            let logObj = {};
            fs.readFile(primary, "utf8", (err, data) => {
                if (err) {
                    console.log(err);
                    fs.readFile(secondary, "utf8", (err, data) => {
                        if (err) {
                            fs.readFile(tertiary, "utf8", (err, data) => {
                                if (err) {
                                    console.log(err)
                                    resolve(false);
                                } else {
                                    const logArray = data.split("\n");
                                    for (i = 0; i < logArray.length - 1; i++) {
                                        logEntryArray = logArray[i].split(",");
                                        logDate = logEntryArray[1];
                                        logDesk = logEntryArray[3];
                                        logDesk = logDesk.trim();
                                        if (logDate == matchDateString && logDesk == deskName) {
                                            punchesCounter += 1;
                                        }
                                        if (i == logArray.length - 2) {
                                            resolve(punchesCounter);
                                        }
                                    }
                                }
                            });
                        } else {
                            const logArray = data.split("\n");
                            for (i = 0; i < logArray.length - 1; i++) {
                                logEntryArray = logArray[i].split(",");
                                logDate = logEntryArray[1];
                                logDesk = logEntryArray[3];
                                logDesk = logDesk.trim();
                                if (logDate == matchDateString && logDesk == deskName) {
                                    punchesCounter += 1;
                                }
                                if (i == logArray.length - 2) {
                                    resolve(punchesCounter);
                                }
                            }
                        }
                    });
                } else {
                    const logArray = data.split("\n");
                    for (i = 0; i < logArray.length - 1; i++) {
                        logEntryArray = logArray[i].split(",");
                        logDate = logEntryArray[1];
                        logDesk = logEntryArray[3];
                        logDesk = logDesk.trim();
                        if (logDate == matchDateString && logDesk == deskName) {
                            punchesCounter += 1;
                        }
                        if (i == logArray.length - 2) {
                            resolve(punchesCounter);
                        }
                    }
                }
            });
        });
    },

    // returns an unsorted object with all the logs needed for the report as specified by user
    getReportData: function (startDate, endDate, showDetailByDesk, showDetailByHour, returnedSettings,window) {
        return new Promise(function (resolve, reject) {
            const jsStartDate = new Date(startDate);
            const jsEndDate = new Date(endDate);
            // add a day to the selected date to make the range inclusive
            const offsetMs = jsEndDate.getTime() + (1000 * 60 * 60 * 24);
            jsEndDate.setTime(offsetMs);
            const logPath = returnedSettings.logPath.primary;
            const secondaryLogPath = returnedSettings.logPath.secondary;
            const tertiaryLogPath = returnedSettings.logPath.tertiary;
            const primary = logPath + "\\op_log.txt";
            const secondary = secondaryLogPath + "\\op_log.txt";
            const tertiary = tertiaryLogPath + "\\op_log.txt";
            let objectArray = [];
            let logObj = {};
            fs.readFile(primary, "utf8", (err, data) => {
                if (err) {
                    fs.readFile(secondary, "utf8", (err, data) => {
                        if (err) {
                            fs.readFile(tertiary, "utf8", (err, data) => {
                                if (err) {
                                    reject("connection error");
                                } else {
                                    const logArray = data.split("\n");
                                    for (i = 0; i < logArray.length - 1; i++) {
                                        logEntryArray = logArray[i].split(",");
                                        logObj = {};
                                        logObj.day = logEntryArray[0];
                                        logObj.date = logEntryArray[1];
                                        logObj.time = logEntryArray[2];
                                        logObj.desk = logEntryArray[3];
                                        logDateTimeString = logEntryArray[1] + " " + logEntryArray[2];
                                        logObj.jsDate = new Date(logDateTimeString);
                                        logObj.hour = logObj.jsDate.getHours();
                                        logObj.count = 1;
                                        if (logObj.jsDate > jsStartDate && logObj.jsDate < jsEndDate) {
                                            objectArray.push(logObj);
                                        }
                                        if (i == logArray.length - 2) {
                                            resolve(objectArray);
                                        }
                                    }
                                }
                            });
                        } else {
                            const logArray = data.split("\n");
                            for (i = 0; i < logArray.length - 1; i++) {
                                logEntryArray = logArray[i].split(",");
                                logObj = {};
                                logObj.day = logEntryArray[0];
                                logObj.date = logEntryArray[1];
                                logObj.time = logEntryArray[2];
                                logObj.desk = logEntryArray[3];
                                logDateTimeString = logEntryArray[1] + " " + logEntryArray[2];
                                logObj.jsDate = new Date(logDateTimeString);
                                logObj.hour = logObj.jsDate.getHours();
                                logObj.count = 1;
                                if (logObj.jsDate > jsStartDate && logObj.jsDate < jsEndDate) {
                                    objectArray.push(logObj);
                                }
                                if (i == logArray.length - 2) {
                                    resolve(objectArray);
                                }
                            }
                        }
                    });
                } else {
                    const logArray = data.split("\n");
                    for (i = 0; i < logArray.length - 1; i++) {
                        logEntryArray = logArray[i].split(",");
                        logObj = {};
                        logObj.day = logEntryArray[0];
                        logObj.date = logEntryArray[1];
                        logObj.time = logEntryArray[2];
                        logObj.desk = logEntryArray[3];
                        logDateTimeString = logEntryArray[1] + " " + logEntryArray[2];
                        logObj.jsDate = new Date(logDateTimeString);
                        logObj.hour = logObj.jsDate.getHours();
                        logObj.count = 1;
                        if (logObj.jsDate > jsStartDate && logObj.jsDate < jsEndDate) {
                            objectArray.push(logObj);
                        }
                        if (i == logArray.length - 2) {
                            resolve(objectArray);
                        }
                    }
                }
            });
        });
    },

    // moves all logs saved locally in settings to the shared log location
    moveLocalText: function (returnedSettings,window) {
        return new Promise(function (resolve, reject) {
            const logPath = returnedSettings.logPath.primary;
            const secondaryLogPath = returnedSettings.logPath.secondary;
            const tertiaryLogPath = returnedSettings.logPath.tertiary;
            const primary = logPath + "\\op_log.txt";
            const secondary = secondaryLogPath + "\\op_log.txt";
            const tertiary = tertiaryLogPath + "\\op_log.txt";
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
                const logText = currentWeekday + "," + currentMonth + "/" + currentDateString + "/" + currentYear + "," + currentHour + ":" + currentMinuteString + "," + deskName + '\r\n';
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
                                                    resolve(false);
                                                } else {
                                                    i += 1;
                                                    if (i === len) {
                                                        window.preload.deleteSetting('localLogs').then(function (remainingSettings) {
                                                            resolve(len);
                                                        });
                                                    }
                                                }
                                            });
                                    } else {
                                        i += 1;
                                        if (i === len) {
                                            window.preload.deleteSetting('localLogs').then(function (remainingSettings) {
                                                resolve(len);
                                            });
                                        }
                                    }
                                });
                        } else {
                            i += 1;
                            if (i === len) {
                                window.preload.deleteSetting('localLogs').then(function (remainingSettings) {
                                    resolve(len);
                                });
                            }
                        }
                    });
            });
        });
    }
}
