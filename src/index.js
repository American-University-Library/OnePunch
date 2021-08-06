const LogText = require("./scripts/logText");
const MoveLocalText = require("./scripts/moveLocalText");
const Reports = require("./scripts/reporting");
const SettingsScript = require("./scripts/settings_script");
const GetLogLocations = require("./scripts/getLogLocations");
const FileDialog = require("./scripts/getFileDialog");
const Pikaday = require("./scripts/pikaday");
const WindowsNotifications = require("./scripts/windowsNotifications");
const NetworkStrategy = require('./scripts/networkStrategy');
const GoogleStrategy = require('./scripts/googleStrategy');
const OfficeStrategy = require('./scripts/officeStrategy');
const CloudStrategy = require('./scripts/cloudStrategy');

const {
    globalShortcut,
    dialog,
    app,
    screen
} = require('electron').remote;

const {
    ipcRenderer,
    remote
} = require('electron');
var main = remote.require("./main.js");
const path = require('path');
const iconpath = path.join(__dirname, '/images/owl_ico_16.png');
const warnIconPath = path.join(__dirname, '/images/exclamation_mark_64.png');

// Function to add HotKey. Will be called after data loaded

function setHotKey(hotKey) {
    globalShortcut.register(hotKey, () => {
        LogText.logText();
    });
}

// add tab elements, hide all but home tab

const tabSettings = {
    settingsTab: {
        style: [{
            name: 'overflowY',
            value: 'scroll'
        }]
    },
    homeTab: {
        style: [{
            name: 'overflowY',
            value: 'hidden'
        }]
    },
    reportsTab: {
        style: [{
            name: 'overflowY',
            value: 'hidden'
        }]
    }
}

document.querySelectorAll(".tabControl").forEach(function (tabCtrl) {
    tabCtrl.addEventListener("click", function () {
        document.querySelectorAll(".tabControl").forEach(function (ctrls) {
            ctrls.classList.remove("active");
        });
        this.classList.add("active");
        let tabName = this.value;
        tabSettings[tabName].style.forEach(style => document.body.style[style.name] = style.value);
        document.querySelectorAll(".tabContent").forEach(function (tabCnt) {
            if (tabCnt.id === tabName) {
                tabCnt.style.display = "block";
            } else {
                tabCnt.style.display = "none";
            }
        });
    });
});

const appVersion = app.getVersion();
document.getElementById('appVersion').textContent = 'v ' + appVersion;
const monitorScreen = screen.getPrimaryDisplay();

// add vertical scroll bars for small screens
/*const monitorScreenHeight = monitorScreen.workAreaSize.height;
if (monitorScreenHeight < 925) {
    document.body.style.overflowY = "scroll";
}*/

// load all settings, fill out the settings tab with those values, set the hotkey, and move any local logs
SettingsScript.getSetting().then(function (returnedSettings) {

    // load all the settings
    let hotKey = returnedSettings.hotKey || "F9";
    let deskName = returnedSettings.deskName || "Desk";
    let reminders = returnedSettings.reminders || false;
    let logStrategy = returnedSettings.logStrategy || "network";
    let assumeDisconnected = returnedSettings.assumeDisconnected || false;
    let altNotifications = returnedSettings.altNotifications || false;
    let selectedIcon = returnedSettings.selectedIcon || "owl_ico";
    let selectedIconName = selectedIcon + "_64.png";
    let icon128Path = "../images/" + selectedIcon + "_128.png";
    let cloudPath = returnedSettings.cloudPath;
    let cloudAuth = returnedSettings.cloudAuth;

    // fill out the settings tab with those settings
    document.getElementById('mainOwlIconImage').src = icon128Path;
    document.getElementById("deskPicker").value = deskName;
    document.querySelectorAll('input[name="hotKey"]').forEach(function (radioBtn) {
        if (radioBtn.value === hotKey) {
            radioBtn.checked = true;;
        }
    });
    document.querySelectorAll('input[name="reminders"]').forEach(function (radioBtn) {
        if (radioBtn.value === reminders) {
            radioBtn.checked = true;;
        }
    });
    document.getElementById("assumeDisconnectedCheck").checked = assumeDisconnected;
    document.getElementById("currentHotKey").value = hotKey;
    document.getElementById('altNotifications').checked = altNotifications
    const logPath = returnedSettings.logPath.display || "Not defined";
    const logPathValue = returnedSettings.logPath.display || "Not defined";
    document.getElementById("logPath").value = logPathValue;
    document.getElementById("logStrategy").value = logStrategy;
    document.getElementById('logFolderName').textContent = logPath;

    document.getElementById('cloudAuth').value = cloudAuth || '';
    document.getElementById('cloudPath').value = cloudPath || '';

    // set the hotkey
    setHotKey(hotKey);

    // move any local logs
    MoveLocalText.moveText().then(function (logsMovedObj) {
        let logsMoved = logsMovedObj.logsMoved;
        if (logsMoved !== false) {
            if (logsMoved > 0) {
                let notifyMessage = "Moved " + logsMoved + " logs from local storage to shared file";
                WindowsNotifications.notify("Update!", notifyMessage, selectedIconName, 3500, altNotifications);
            }
        } else {
            WindowsNotifications.notify("Cannot connect!", "Logs will save locally until connected to network drive", "exclamation_mark_64.png", 3500, altNotifications);
        }
    });
});

document.getElementById("logBtn").addEventListener("click", function () {
    LogText.logText();
});

document.getElementById("checkTotalsBtn").addEventListener("click", function () {
    ipcRenderer.send('getCurrentCount');
});

document.getElementById("moveLocalBtn").addEventListener("click", function () {
    MoveLocalText.moveText().then(function (logsMovedObj) {
        let logsMoved = logsMovedObj.logsMoved;
        let selectedIcon = logsMovedObj.selectedIcon;
        let selectedIconName = selectedIcon + "_64.png";
        if (logsMoved !== false) {
            if (logsMoved > 0) {
                let notifyMessage = "Moved " + logsMoved + " logs from local storage to shared file";
                WindowsNotifications.notify("Update!", notifyMessage, selectedIconName, 3500, altNotifications);
            } else {
                let notifyMessage = "No local logs to move";
                WindowsNotifications.notify("Update!", notifyMessage, selectedIconName, 3500, altNotifications);
            }
        } else {
            WindowsNotifications.notify("Cannot connect!", "Logs will save locally until connected to network drive", "exclamation_mark_64.png", 3500, altNotifications);
        }
    });
});
document.getElementById("generateReportBtn").addEventListener("click", function () {
    let showDetailByDesk = document.getElementById("deskCheck").checked;
    let showDetailByHour = document.getElementById("hourCheck").checked;
    let startDate = document.getElementById('startDate').value;
    let endDate = document.getElementById('endDate').value;
    let savePath = document.getElementById("savePath").value;
    if (startDate != "" && endDate != "" && savePath != "") {
        Reports.generateReport(startDate, endDate, showDetailByDesk, showDetailByHour, savePath).then(function (reportingComplete) {
            if (reportingComplete) {
                dialog.showMessageBox({
                    message: "Report saved!",
                    buttons: ["OK"],
                    type: "info",
                    icon: iconpath,
                    title: "Saved"
                });
            } else {
                dialog.showMessageBox({
                    message: "There was an error generating your report",
                    buttons: ["OK"],
                    type: "info",
                    icon: warnIconPath,
                    title: "Error"
                });
            }
        });
    } else {
        dialog.showMessageBox({
            message: "Please choose report parameters",
            buttons: ["OK"],
            type: "info",
            icon: warnIconPath,
            title: "Alert"
        });
    }
});

var startPicker = new Pikaday({
    field: document.getElementById('startDate'),
    format: 'M/D/YYYY',
    toString(date, format) {
        // you should do formatting based on the passed format,
        // but we will just return 'D/M/YYYY' for simplicity
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        return `${month}/${day}/${year}`;
    },
    parse(dateString, format) {
        // dateString is the result of `toString` method
        let parts = dateString.split('/');
        let day = parseInt(parts[0], 10);
        let month = parseInt(parts[1] - 1, 10);
        let year = parseInt(parts[1], 10);
        return new Date(year, month, day);
    }
});

var endPicker = new Pikaday({
    field: document.getElementById('endDate'),
    format: 'M/D/YYYY',
    toString(date, format) {
        // you should do formatting based on the passed format,
        // but we will just return 'D/M/YYYY' for simplicity
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        return `${month}/${day}/${year}`;
    },
    parse(dateString, format) {
        // dateString is the result of `toString` method
        let parts = dateString.split('/');
        let day = parseInt(parts[0], 10);
        let month = parseInt(parts[1] - 1, 10);
        let year = parseInt(parts[1], 10);
        return new Date(year, month, day);
    }
});


// -- change auth flow stuff starts here with the functionality of new buttons

document.getElementById("networkPicker").addEventListener("click", function () {
    console.log('picker clicked')
    FileDialog.getFolder().then(function (chosenDir) {
        console.log('chosen directory', chosenDir)
        document.getElementById('logFolderName').textContent = chosenDir;
        document.getElementById("logPath").value = chosenDir;
        document.getElementById("logStrategy").value = "network";
    }).catch(err => console.log('err', err));
    console.log('finished')
});

// These next three elements are hidden and do nothing until cloud support is added
document.getElementById("googlePicker").addEventListener("click", function () {
    //do whatever is needed to switch to using google
});

document.getElementById("officePicker").addEventListener("click", function () {
    //do whatever is needed to switch to using office
});


const strategyRadios = document.querySelectorAll('input[type=radio][name="strategy"]');
strategyRadios.forEach(radio => radio.addEventListener('change', () => {
    console.log(radio.value)
    const storageDivs = document.querySelectorAll('div.storage');
    console.log('divs', storageDivs);
    storageDivs.forEach(div => {
        const classList = div.classList;
        if (classList.contains(radio.value)) {
            div.style.display = 'inline-block';
        } else {
            div.style.display = 'none';
        }
    })
}));


// -- change auth flow stuff ends here


document.getElementById("savePicker").addEventListener("click", function () {
    FileDialog.getFolder().then(function (chosenDir) {
        document.getElementById('saveFolderName').textContent = chosenDir;
        document.getElementById("savePath").value = chosenDir;
    });
});

// saves settings. Remember to deregister current hotkey before assigning a new one
document.getElementById("saveBtn").addEventListener("click", function () {
    let deskNameEntry = document.getElementById("deskPicker").value;
    let deskName = deskNameEntry.trim();
    deskName = deskName.replace(/[\uE000-\uF8FF]/g, '');
    let currentHotKey = document.getElementById("currentHotKey").value;
    let hotKeyChoice = document.querySelector('input[name="hotKey"]:checked').value;
    let remindersChoice = document.querySelector('input[name="reminders"]:checked').value;
    document.getElementById("currentHotKey").value = hotKeyChoice;
    let chosenDir = document.getElementById("logPath").value;
    let logStrategy = document.getElementById("logStrategy").value;
    let assumeDisconnected = document.getElementById('assumeDisconnectedCheck').checked;
    let altNotifications = document.getElementById('altNotifications').checked;

    let cloudPath = document.getElementById("cloudPath").value;
    let cloudAuth = document.getElementById("cloudAuth").value;


    let settingsObj = {};
    if (deskName != "" && chosenDir != "") {
        GetLogLocations.getLogLocations(chosenDir, logStrategy).then(function (logPath) {
            SettingsScript.saveSetting('logPath', logPath)
                .then(function (settingSaved) {
                    return SettingsScript.saveSetting('deskName', deskName);
                }).then(function (settingSaved) {
                    return SettingsScript.saveSetting('hotKey', hotKeyChoice);
                }).then(function (settingSaved) {
                    return SettingsScript.saveSetting('logStrategy', logStrategy);
                }).then(function (settingSaved) {
                    return SettingsScript.saveSetting('reminders', remindersChoice);
                }).then(function (settingSaved) {
                    ipcRenderer.send('remindersChanged');
                }).then(function (settingSaved) {
                    return SettingsScript.saveSetting('assumeDisconnected', assumeDisconnected);
                }).then(function (settingSaved) {
                    return SettingsScript.saveSetting('altNotifications', altNotifications);
                }).then(function (settingSaved) {
                    return SettingsScript.saveSetting('cloudPath', cloudPath);
                }).then(function (settingSaved) {
                    return SettingsScript.saveSetting('cloudAuth', cloudAuth);
                }).then(function (settingSaved) {
                    globalShortcut.unregister(currentHotKey);
                    setHotKey(hotKeyChoice);
                }).then(function (settingSaved) {
                    dialog.showMessageBox({
                        message: "Settings saved!",
                        buttons: ["OK"],
                        type: "info",
                        icon: iconpath,
                        title: "Saved"
                    });
                }).catch(function (error) {
                    console.log("Failed!", error);
                });
        });
    } else {
        dialog.showMessageBox({
            message: "Please choose your settings",
            buttons: ["OK"],
            type: "info",
            icon: warnIconPath,
            title: "Alert"
        });
    }
});

// ask the main process to open the owl picking window
document.getElementById("mainOwlIcon").addEventListener("click", function () {
    ipcRenderer.send('showOwlWindow');
});

// ask the main process to open the about window
document.getElementById("showAbout").addEventListener("click", function () {
    ipcRenderer.send('showAboutWindow');
});

document.getElementById('validateBtn').addEventListener('click', () => {
    SettingsScript.getSetting().then(({cloudPath, cloudAuth}) => {
        console.log(cloudPath, cloudAuth)
    })
})



ipcRenderer.on('reminderNotify', (event, dailyPunchCountObj) => {
    let dailyPunchCount = dailyPunchCountObj.punchCount;
    let selectedIcon = dailyPunchCountObj.selectedIcon || "owl_ico";
    let selectedIconName = selectedIcon + "_64.png";
    if (dailyPunchCountObj.sharedPunches !== false) {
        let notificationTitle = "You've helped " + dailyPunchCount + " people today!";
        WindowsNotifications.notify(notificationTitle, "Keep on punching!", selectedIconName, 2000)
    } else {
        if (dailyPunchCountObj.assumeDisconnected) {
            let notificationTitle = "You've helped " + dailyPunchCount + " people today!";
            WindowsNotifications.notify(notificationTitle, "Keep on punching!", selectedIconName, 2000, altNotifications)
        } else {
            WindowsNotifications.notify("Cannot connect!", "Please connect to network drive", "exclamation_mark_64.png", 3500, altNotifications);
        }
    }
});

// change the main icon after user selects a new image
ipcRenderer.on('newOwl', (event, owlPicked) => {
    let icon128Path = "../images/" + owlPicked + "_128.png";
    document.getElementById('mainOwlIconImage').src = icon128Path;
});