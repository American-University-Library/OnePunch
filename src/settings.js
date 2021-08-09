// Load library
//const GetLogLocations = window.preload.GetLogLocations;
//const FileDialog = window.preload.FileDialog;

const iconpath = window.preload.getIconPath();
const warnIconPath = window.preload.getWarnIconPath();

// add listeners to page elements

document.getElementById("networkPicker").addEventListener("click", function () {
    window.preload.FileDialog().then(function (chosenDir) {
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
        console.log(1)
        window.preload.GetLogLocations(chosenDir, logStrategy).then(function (logPath) {
            console.log(21)
            window.preload.setSetting('logPath', logPath)
                .then(function (settingSaved) {
                    console.log(2)
                    return window.preload.setSetting('deskName', deskName);
                }).then(function (settingSaved) {
                    return window.preload.setSetting('hotKey', hotKeyChoice);
                }).then(function (settingSaved) {
                    return window.preload.setSetting('logStrategy', logStrategy);
                }).then(function (settingSaved) {
                    return window.preload.setSetting('reminders', remindersChoice);
                }).then(function (settingSaved) {
                    return window.preload.setSetting('assumeDisconnected', assumeDisconnected);
                }).then(function (settingSaved) {
                    return window.preload.setSetting('altNotifications', altNotifications);
                }).then(function (settingSaved) {
                    return window.preload.setSetting('initialized', true);
                }).then(function (settingSaved) {
                    window.preload.send('settingsComplete');
                }).catch(function (error) {
                    console.log("Failed!", error);
                });
        });
    } else {
        window.preload.showMessageBox({
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