const LogText = window.preload.LogText;
const MoveLocalText = window.preload.moveLocalText;
const Reports = window.preload.Reports;
const FileDialog = window.preload.fileDialog;
const WindowsNotifications = window.preload.WindowsNotifications;

const iconpath = window.preload.getIconPath();
const warnIconPath = window.preload.getWarnIconPath();

window.preload.receive("newOwl", owlIcon => {
  let icon128Path = "../images/" + owlIcon + "_128.png";
  document.getElementById("mainOwlIconImage").src = icon128Path;
});

window.preload.receive("reminderNotify", (dailyPunchCountObj) => {
  let dailyPunchCount = dailyPunchCountObj.punchCount;
  let selectedIcon = dailyPunchCountObj.selectedIcon || "owl_ico";
  let selectedIconName = selectedIcon + "_64.png";
  if (dailyPunchCountObj.sharedPunches !== false) {
    let notificationTitle =
      "You've helped " + dailyPunchCount + " people today!";
    WindowsNotifications(
      notificationTitle,
      "Keep on punching!",
      selectedIconName,
      2000,
      altNotifications,
      window
    );
  } else {
    if (dailyPunchCountObj.assumeDisconnected) {
      let notificationTitle =
        "You've helped " + dailyPunchCount + " people today!";
      WindowsNotifications(
        notificationTitle,
        "Keep on punching!",
        selectedIconName,
        2000,
        altNotifications,
        window
      );
    } else {
      WindowsNotifications(
        "Cannot connect!",
        "Please connect to network",
        "exclamation_mark_64.png",
        3500,
        altNotifications,
        window
      );
    }
  }
});

// add tab elements, hide all but home tab

const tabSettings = {
  settingsTab: {
    style: [{
      name: "overflowY",
      value: "scroll",
    },],
  },
  homeTab: {
    style: [{
      name: "overflowY",
      value: "hidden",
    },],
  },
  reportsTab: {
    style: [{
      name: "overflowY",
      value: "hidden",
    },],
  },
};

document.querySelectorAll(".tabControl").forEach(function (tabCtrl) {
  tabCtrl.addEventListener("click", function () {
    document.querySelectorAll(".tabControl").forEach(function (ctrls) {
      ctrls.classList.remove("active");
    });
    this.classList.add("active");
    let tabName = this.value;
    tabSettings[tabName].style.forEach(
      (style) => (document.body.style[style.name] = style.value)
    );
    document.querySelectorAll(".tabContent").forEach(function (tabCnt) {
      if (tabCnt.id === tabName) {
        tabCnt.style.display = "block";
      } else {
        tabCnt.style.display = "none";
      }
    });
  });
});

const appVersion = window.preload.getVersion();
document.getElementById("appVersion").textContent = "v " + appVersion;

//const monitorScreen = screen.getPrimaryDisplay();

// add vertical scroll bars for small screens
/*const monitorScreenHeight = monitorScreen.workAreaSize.height;
if (monitorScreenHeight < 925) {
    document.body.style.overflowY = "scroll";
}*/

const loadSettings = async () => {
  const returnedSettings = await window.preload.getSettings();
  // load all the settings
  let hotKey = returnedSettings.hotKey || "F9";
  let reminders = returnedSettings.reminders || false;
  let assumeDisconnected = returnedSettings.assumeDisconnected || false;
  altNotifications = returnedSettings.altNotifications || false;
  let selectedIcon = returnedSettings.selectedIcon || "owl_ico";
  let icon128Path = "../images/" + selectedIcon + "_128.png";
  // fill out the settings tab with those settings
  document.getElementById("mainOwlIconImage").src = icon128Path;
  document
    .querySelectorAll('input[name="hotKey"]')
    .forEach(function (radioBtn) {
      if (radioBtn.value === hotKey) {
        radioBtn.checked = true;
      }
    });
  document
    .querySelectorAll('input[name="reminders"]')
    .forEach(function (radioBtn) {
      if (radioBtn.value === reminders) {
        radioBtn.checked = true;
      }
    });
  document.getElementById("assumeDisconnectedCheck").checked =
    assumeDisconnected;
  document.getElementById("currentHotKey").value = hotKey;
  // document.getElementById("altNotifications").checked = altNotifications;
  const logPath = returnedSettings.logPath;
  const logSplit = logPath.split("?key=");
  document.getElementById('urlPicker').value = logSplit[0];
  document.getElementById('keyPicker').value = logSplit[1];

  // set the hotkey
  window.preload.registerHotKey(hotKey, window);
}

const moveLocalLogs = async notifyIfZero => {
  try {
    const logsMovedObj = await MoveLocalText();
    let logsMoved = logsMovedObj.logsMoved;
    let selectedIcon = logsMovedObj.selectedIcon;
    let selectedIconName = selectedIcon + "_64.png";
    if (logsMoved > 0) {
      let notifyMessage =
        "Moved " + logsMoved + " logs from local storage to network";
      WindowsNotifications(
        "Update!",
        notifyMessage,
        selectedIconName,
        3500,
        altNotifications,
        window
      );
    } else {
      if (notifyIfZero) {
        let notifyMessage = "No local logs to move";
        WindowsNotifications(
          "Update!",
          notifyMessage,
          selectedIconName,
          3500,
          altNotifications,
          window
        );
      }
    }
  } catch (err) {
    window.preload.logError(err);
    WindowsNotifications(
      "Cannot connect!",
      "Logs will save locally until connected to network",
      "exclamation_mark_64.png",
      3500,
      altNotifications,
      window
    );
  }
}

// load all settings, fill out the settings tab with those values, set the hotkey, and move any local logs
loadSettings();
moveLocalLogs(false);

document.getElementById("logBtn").addEventListener("click", function () {
  LogText(window, "add event listener");
});

document
  .getElementById("checkTotalsBtn")
  .addEventListener("click", function () {
    window.preload.send("getCurrentCount");
  });

document.getElementById("moveLocalBtn").addEventListener("click", async () => {
  await moveLocalLogs(true);
});

document.getElementById("reconnectBtn").addEventListener("click", async () => {
  await window.preload.reconnect();
});


document
  .getElementById("generateReportBtn")
  .addEventListener("click", async () => {
    let myDeskOnly = document.getElementById("myDesk").checked;
    const timeRadios = document.getElementsByName('time');
    let timeDetail = 'day';
    timeRadios.forEach(radio => {
      if (radio.checked) {
        timeDetail = radio.value
      }
    });
    let startDate = document.getElementById("startDate").value;
    let endDate = document.getElementById("endDate").value;
    let savePath = document.getElementById("savePath").value;
    try {
      if (startDate != "" && endDate != "" && savePath != "") {
        const reportingComplete = await Reports(
          startDate,
          endDate,
          myDeskOnly,
          timeDetail,
          savePath,
          window
        );
        if (reportingComplete) {
          window.preload.showMessageBox({
            message: "Report saved!",
            buttons: ["OK"],
            type: "info",
            icon: iconpath,
            title: "Saved",
          });
        } else {
          window.preload.showMessageBox({
            message: "There was an error generating your report",
            buttons: ["OK"],
            type: "info",
            icon: warnIconPath,
            title: "Error",
          });
        }
      } else {
        window.preload.showMessageBox({
          message: "Please choose report parameters",
          buttons: ["OK"],
          type: "info",
          icon: warnIconPath,
          title: "Alert",
        });
      }
    } catch (err) {
      window.preload.showMessageBox({
        message: "There was an error generating your report",
        buttons: ["OK"],
        type: "info",
        icon: warnIconPath,
        title: "Error",
      });
    }
  });

const startPicker = new Pikaday({
  field: document.getElementById("startDate"),
  format: "M/D/YYYY",
  toString(date, format) {
    // you should do formatting based on the passed format,
    // but we will just return 'D/M/YYYY' for simplicity
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    return `${month}-${day}-${year}`;
  },
  parse(dateString, format) {
    // dateString is the result of `toString` method
    let parts = dateString.split("/");
    let day = parseInt(parts[0], 10);
    let month = parseInt(parts[1] - 1, 10);
    let year = parseInt(parts[1], 10);
    return new Date(year, month, day);
  },
});

const endPicker = new Pikaday({
  field: document.getElementById("endDate"),
  format: "M/D/YYYY",
  toString(date, format) {
    // you should do formatting based on the passed format,
    // but we will just return 'D/M/YYYY' for simplicity
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    return `${month}-${day}-${year}`;
  },
  parse(dateString, format) {
    // dateString is the result of `toString` method
    let parts = dateString.split("/");
    let day = parseInt(parts[0], 10);
    let month = parseInt(parts[1] - 1, 10);
    let year = parseInt(parts[1], 10);
    return new Date(year, month, day);
  },
});

document.getElementById("savePicker").addEventListener("click", async () => {
  const chosenDir = await FileDialog();
  document.getElementById("saveFolderName").textContent = chosenDir;
  document.getElementById("savePath").value = chosenDir;
});

// saves settings. Remember to deregister current hotkey before assigning a new one
document.getElementById("saveBtn").addEventListener("click", async () => {
  try {
    let currentHotKey = document.getElementById("currentHotKey").value;
    let hotKeyChoice = document.querySelector(
      'input[name="hotKey"]:checked'
    ).value;
    let remindersChoice = document.querySelector(
      'input[name="reminders"]:checked'
    ).value;
    document.getElementById("currentHotKey").value = hotKeyChoice;
    let urlEntry = document.getElementById("urlPicker").value;
    let url = urlEntry.trim();
    let keyEntry = document.getElementById("keyPicker").value;
    let key = keyEntry.trim();
    if (url != "" && key != "") {
      const logPath = url + "?key=" + key;
      let assumeDisconnected = document.getElementById(
        "assumeDisconnectedCheck"
      ).checked;
      // let altNotifications = document.getElementById("altNotifications").checked;
      let altNotifications = false;
      await window.preload.setSetting("hotKey", hotKeyChoice);
      await window.preload.setSetting("reminders", remindersChoice);
      await window.preload.setSetting("reminders", remindersChoice);
      window.preload.send("remindersChanged");
      await window.preload.setSetting("logPath", logPath);
      await window.preload.setSetting(
        "assumeDisconnected",
        assumeDisconnected
      );
      await window.preload.setSetting(
        "altNotifications",
        altNotifications
      );
      window.preload.unregisterHotKey(currentHotKey);
      window.preload.registerHotKey(hotKeyChoice, window);
      window.preload.showMessageBox({
        message: "Settings saved!",
        buttons: ["OK"],
        type: "info",
        icon: iconpath,
        title: "Saved",
      });
    } else {
      window.preload.showMessageBox({
        message: "Please choose your settings",
        buttons: ["OK"],
        type: "info",
        icon: warnIconPath,
        title: "Alert",
      });
    }
  } catch (err) {
    window.preload.logError(err);
  }
});

// ask the main process to open the owl picking window
document.getElementById("mainOwlIcon").addEventListener("click", function () {
  window.preload.send("showOwlWindow");
});

// ask the main process to open the about window
document.getElementById("showAbout").addEventListener("click", function () {
  window.preload.send("showAboutWindow");
});