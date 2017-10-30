// Load library
const LogText = require("./scripts/logText");
const MoveLocalText = require("./scripts/moveLocalText");
const Reports = require("./scripts/reporting");
const SettingsScript = require("./scripts/settings_script");
const AddLogLocations = require("./scripts/addLogLocations");
const FileDialog = require("./scripts/getFileDialog");
const Pikaday = require("./scripts/pikaday");
const WindowsNotifications = require("./scripts/windowsNotifications");

const {
    globalShortcut
} = require('electron').remote;

const {
    ipcRenderer,
    remote
} = require('electron');
var main = remote.require("./main.js");

// Function to add HotKey. Will be called after data loaded

function setHotKey(hotKey) {
    globalShortcut.register(hotKey, () => {
        LogText.logText();
    });
}

// hide all but home tab

document.querySelectorAll(".tabControl").forEach(function (tabCtrl) {
    tabCtrl.addEventListener("click", function () {
        document.querySelectorAll(".tabControl").forEach(function (ctrls) {
            ctrls.classList.remove("active");
        });
        this.classList.add("active");
        let tabName = this.value;
        document.querySelectorAll(".tabContent").forEach(function (tabCnt) {
            if (tabCnt.id === tabName) {
                tabCnt.style.display = "block";
            } else {
                tabCnt.style.display = "none";
            }
        });
    });
});

// load data and change settings tab to match current settings

SettingsScript.getSetting().then(function (returnedSettings) {
    const logPath = returnedSettings.logPath.display;
    const hotKey = returnedSettings.hotKey;
    const deskName = returnedSettings.deskName;
    const reminders = returnedSettings.reminders;
    setHotKey(hotKey);
    document.getElementById("deskPicker").value = deskName;
    document.getElementById("logPath").value = logPath;
    document.getElementById('logFolderName').textContent = logPath;
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

    document.getElementById("currentHotKey").value = hotKey;

    MoveLocalText.moveText().then(function (logsMoved) {
        if (logsMoved !== false) {
            if (logsMoved > 0) {
                let notifyMessage = "Moved " + logsMoved + " logs from local storage to shared file";
                WindowsNotifications.notify("Update!", notifyMessage, "owl_ico_64.png", 3500);
            }
        } else {
            WindowsNotifications.notify("Cannot connect!", "Logs will save locally until connected to network drive", "exclamation_mark_64.png", 3500);
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
    MoveLocalText.moveText().then(function (logsMoved) {
        if (logsMoved !== false) {
            if (logsMoved > 0) {
                let notifyMessage = "Moved " + logsMoved + " logs from local storage to shared file";
                WindowsNotifications.notify("Update!", notifyMessage, "owl_ico_64.png", 3500);
            } else {
                let notifyMessage = "No local logs to move";
                WindowsNotifications.notify("Update!", notifyMessage, "owl_ico_64.png", 3500);
            }
        } else {
            WindowsNotifications.notify("Cannot connect!", "Logs will save locally until connected to network drive", "exclamation_mark_64.png", 3500);
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
        Reports.generateReport(startDate, endDate, showDetailByDesk, showDetailByHour, savePath);
    } else {
        alert("Please choose report parameters");
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

// add listeners to page elements

document.getElementById("logPicker").addEventListener("click", function () {
    FileDialog.getFolder().then(function (chosenDir) {
        document.getElementById('logFolderName').textContent = chosenDir;
        document.getElementById("logPath").value = chosenDir;
    });
});

document.getElementById("savePicker").addEventListener("click", function () {
    FileDialog.getFolder().then(function (chosenDir) {
        document.getElementById('saveFolderName').textContent = chosenDir;
        document.getElementById("savePath").value = chosenDir;
    });
});

document.getElementById("saveBtn").addEventListener("click", function () {
    let deskNameEntry = document.getElementById("deskPicker").value;
    let currentHotKey = document.getElementById("currentHotKey").value;
    let hotKeyChoice = document.querySelector('input[name="hotKey"]:checked').value;
    let remindersChoice = document.querySelector('input[name="reminders"]:checked').value;
    document.getElementById("currentHotKey").value = hotKeyChoice;
    let chosenDir = document.getElementById("logPath").value;
    let settingsObj = {};
    if (deskNameEntry != "" && chosenDir != "") {
        AddLogLocations.addLogLocations(chosenDir).then(function (logPath) {
            SettingsScript.saveSetting('logPath', logPath)
                .then(function (settingSaved) {
                    return SettingsScript.saveSetting('deskName', deskNameEntry);
                }).then(function (settingSaved) {
                    return SettingsScript.saveSetting('hotKey', hotKeyChoice);
                }).then(function (settingSaved) {
                    ipcRenderer.send('remindersChanged', remindersChoice);
                    return SettingsScript.saveSetting('reminders', remindersChoice);
                }).then(function (settingSaved) {
                    globalShortcut.unregister(currentHotKey);
                    setHotKey(hotKeyChoice);
                }).then(function (settingSaved) {
                    alert("Settings saved!");
                }).catch(function (error) {
                    console.log("Failed!", error);
                });
        });
    } else {
        alert("Please choose your settings");
    }
});


ipcRenderer.on('reminderNotify', (event, arg) => {
    if (arg !== false) {
        let notificationTitle = "You've helped " + arg + " people today!";
        WindowsNotifications.notify(notificationTitle, "Keep on punching!", "owl_ico_64.png", 2000)
    } else {
        WindowsNotifications.notify("Cannot connect!", "Please connect to network drive", "exclamation_mark_64.png", 3500);
    }

});
