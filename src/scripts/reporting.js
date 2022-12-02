const fs = require('fs');
const { settings } = require('cluster');


module.exports = {

    // Basic flow: get the unsorted data, sort it, total it by day and/or hour, save it to a csv file
    // right now this doesn't overwrite file, so if there's a previously existing report it will just append this info

    generateReport: function (startDate, endDate, showDetailByDesk, showDetailByHour, savePath, window) {
        return new Promise(function (resolve, reject) {
            let returnedSettings;
            window.preload.getSettings()
                .then(function (settings) {
                    returnedSettings = { ...settings }
                    return CloudStrategy.getReportData(startDate, endDate, showDetailByDesk, showDetailByHour, returnedSettings);
                }).then(function (unsortedObjectArray) {
                    return sortLogObjectArray(unsortedObjectArray, showDetailByDesk, showDetailByHour);
                }).then(function (objectArray) {
                    return processObjectsToTotals(objectArray, showDetailByDesk, showDetailByHour);
                }).then(function (totalsArray) {
                    return writeTotalsToCsv(totalsArray, savePath, showDetailByDesk, showDetailByHour, startDate, endDate);
                }).then(function (reportingComplete) {
                    resolve(reportingComplete);
                }).catch(function (error) {
                    if (error === "connection error") {
                        window.preload.WindowsNotifications("Cannot connect!", "Please connect to network drive", "exclamation_mark_64.png", 3500, returnedSettings.altNotifications, window);
                    }
                });
        });
    }

}

function sortLogObjectArray(objectArray, showDetailByDesk, showDetailByHour) {
    return new Promise(function (resolve, reject) {
        for (i = 0; i < objectArray.length; i++) {
            let sortString = genSortString(objectArray[i].jsDate, objectArray[i].desk, showDetailByDesk, showDetailByHour);
            objectArray[i].sortString = sortString;
            if (i == objectArray.length - 1) {
                objectArray.sort(function (a, b) {
                    if (a.sortString > b.sortString) {
                        return 1;
                    } else if (a.sortString < b.sortString) {
                        return -1;
                    } else {
                        return 0;
                    }
                });
                resolve(objectArray);
            }
        }
    });
}

// not sure if there's a better way to total based on user selection (either by day or hour, and desk or no desk)

function processObjectsToTotals(objectArray, showDetailByDesk, showDetailByHour) {
    return new Promise(function (resolve, reject) {
        let totalsArray = [];
        totalsArray.push(objectArray[0]);
        let totalsArrayIndex = 0;
        for (i = 1; i < objectArray.length; i++) {
            if (showDetailByDesk) {
                if (showDetailByHour) {
                    if (objectArray[i].date == objectArray[i - 1].date && objectArray[i].hour == objectArray[i - 1].hour && objectArray[i].desk == objectArray[i - 1].desk) {
                        totalsArray[totalsArrayIndex].count += 1;
                    } else {
                        totalsArray.push(objectArray[i]);
                        totalsArrayIndex += 1;
                    }
                    if (i == objectArray.length - 1) {
                        resolve(totalsArray);
                    }
                } else {
                    if (objectArray[i].date == objectArray[i - 1].date && objectArray[i].desk == objectArray[i - 1].desk) {
                        totalsArray[totalsArrayIndex].count += 1;
                    } else {
                        totalsArray.push(objectArray[i]);
                        totalsArrayIndex += 1;
                    }
                    if (i == objectArray.length - 1) {
                        resolve(totalsArray);
                    }
                }
            } else {
                if (showDetailByHour) {
                    if (objectArray[i].date == objectArray[i - 1].date && objectArray[i].hour == objectArray[i - 1].hour) {
                        totalsArray[totalsArrayIndex].count += 1;
                    } else {
                        totalsArray.push(objectArray[i]);
                        totalsArrayIndex += 1;
                    }
                    if (i == objectArray.length - 1) {
                        resolve(totalsArray);
                    }
                } else {
                    if (objectArray[i].date == objectArray[i - 1].date) {
                        totalsArray[totalsArrayIndex].count += 1;
                    } else {
                        totalsArray.push(objectArray[i]);
                        totalsArrayIndex += 1;
                    }
                    if (i == objectArray.length - 1) {
                        resolve(totalsArray);
                    }
                }
            }
        }
    });
}

function writeTotalsToCsv(totalsArray, savePath, showDetailByDesk, showDetailByHour, startDate, endDate) {
    return new Promise(function (resolve, reject) {
        const jsStartDate = new Date(startDate);
        const jsEndDate = new Date(endDate);
        if (showDetailByDesk) {
            if (showDetailByHour) {
                outputString = "Date,Hour,Desk,Count";
            } else {
                outputString = "Date,Desk,Count";
            }
        } else {
            if (showDetailByHour) {
                outputString = "Date,Hour,Count";
            } else {
                outputString = "Date,Count";
            }
        }
        let fullSavePath = savePath + "\\op_report.csv";
        for (i = 0; i < totalsArray.length; i++) {
            if (showDetailByDesk) {
                if (showDetailByHour) {
                    outputString = outputString + '\r\n' + totalsArray[i].date + ',' + totalsArray[i].hour + ',"' + totalsArray[i].desk + '",' + totalsArray[i].count;
                    if (i == totalsArray.length - 1) {
                        fs.writeFile(
                            fullSavePath,
                            outputString, {
                            encoding: "UTF-8",
                            flag: "a"
                        },
                            function (err) {
                                if (err) {
                                    resolve(false);
                                } else {
                                    resolve(true);
                                }
                            });
                    }
                } else {
                    outputString = outputString + '\r\n' + totalsArray[i].date + ',"' + totalsArray[i].desk + '",' + totalsArray[i].count;
                    if (i == totalsArray.length - 1) {
                        fs.writeFile(
                            fullSavePath,
                            outputString, {
                            encoding: "UTF-8",
                            flag: "a"
                        },
                            function (err) {
                                if (err) {
                                    resolve(false);
                                } else {
                                    resolve(true);
                                }
                            });
                    }
                }
            } else {
                if (showDetailByHour) {
                    outputString = outputString + "\r\n" + totalsArray[i].date + "," + totalsArray[i].hour + "," + totalsArray[i].count;
                    if (i == totalsArray.length - 1) {
                        fs.writeFile(
                            fullSavePath,
                            outputString, {
                            encoding: "UTF-8",
                            flag: "a"
                        },
                            function (err) {
                                if (err) {
                                    resolve(false);
                                } else {
                                    resolve(true);
                                }
                            });
                    }
                } else {
                    outputString = outputString + "\r\n" + totalsArray[i].date + "," + totalsArray[i].count;
                    if (i == totalsArray.length - 1) {
                        fs.writeFile(
                            fullSavePath,
                            outputString, {
                            encoding: "UTF-8",
                            flag: "a"
                        },
                            function (err) {
                                if (err) {
                                    resolve(false);
                                } else {
                                    resolve(true);
                                }
                            });
                    }
                }
            }
        }
    });
}

// sorts by year, month, day, hour, desk. If desk name is longer than 15 characters this won't work

function genSortString(jsDate, deskName, showDetailByDesk, showDetailByHour) {
    let objHour = jsDate.getHours();
    let objDate = jsDate.getDate();
    let objMonth = jsDate.getMonth() + 1;
    let objYear = jsDate.getFullYear();
    let stringHour = ('0' + objHour).slice(-2);
    let stringMonth = ('0' + objMonth).slice(-2);
    let stringDate = ('0' + objDate).slice(-2);
    let sortString;
    zeroString = "000000000000000";
    if (showDetailByDesk) {
        sortString = objYear + stringMonth + stringDate;
        deskDiff = 15 - deskName.length;
        deskString = zeroString.substr(0, deskDiff) + deskName
        if (showDetailByHour) {
            sortString = sortString + stringHour + deskString;
            return sortString;
        } else {
            sortString = sortString + deskString;
            return sortString;
        }
    } else {
        sortString = jsDate;
        return sortString;
    }
}


