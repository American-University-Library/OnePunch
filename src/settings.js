// Load library
const SettingsScript = require("./scripts/settings_script");
const GetLogLocations = require("./scripts/getLogLocations");
const FileDialog = require("./scripts/getFileDialog");

const {
    ipcRenderer,
    remote
} = require('electron');
const {
    dialog,
    screen
} = require('electron').remote
var main = remote.require("./main.js");
const path = require('path');
const iconpath = path.join(__dirname, '/images/owl_ico_16.png');
const warnIconPath = path.join(__dirname, '/images/exclamation_mark_64.png');

// add listeners to page elements

document.getElementById("networkPicker").addEventListener("click", function () {
    FileDialog.getFolder().then(function (chosenDir) {
        document.getElementById('logFolderName').textContent = chosenDir;
        document.getElementById("logPath").value = chosenDir;
        document.getElementById("logStrategy").value = "network";
    });
});

document.getElementById("googlePicker").addEventListener("click", function () {
    //do whatever is needed to switch to using google
});

document.getElementById("officePicker").addEventListener("click", function () {
    //do whatever is needed to switch to using office
});

document.getElementById("cloudPicker").addEventListener("click", function () {
    //do whatever is needed to switch to using cloud
});

document.getElementById("saveBtn").addEventListener("click", function () {
    let deskNameEntry = document.getElementById("deskPicker").value;
    let deskName = deskNameEntry.trim();
    deskName = deskName.replace(/[\uE000-\uF8FF]/g, '');
    let hotKeyChoice = document.querySelector('input[name="hotKey"]:checked').value;
    let remindersChoice = document.querySelector('input[name="reminders"]:checked').value;
    let chosenDir = document.getElementById("logPath").value;
    let logStrategy = document.getElementById("logStrategy").value;
    let assumeDisconnected = document.getElementById('assumeDisconnectedCheck').checked;
    let altNotifications = document.getElementById('altNotifications').checked;
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
                    return SettingsScript.saveSetting('assumeDisconnected', assumeDisconnected);
                }).then(function (settingSaved) {
                    return SettingsScript.saveSetting('altNotifications', altNotifications);
                }).then(function (settingSaved) {
                    return SettingsScript.saveSetting('initialized', true);
                }).then(function (settingSaved) {
                    ipcRenderer.send('settingsComplete');
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

/*const monitorScreen = screen.getPrimaryDisplay();
const monitorScreenHeight = monitorScreen.workAreaSize.height;
if (monitorScreenHeight < 925) {
    document.body.style.overflowY = "scroll";
}*/

document.body.style.overflowY = "scroll";