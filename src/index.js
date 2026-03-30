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
  let notificationTitle = "You've helped " + dailyPunchCount + " people today!";
  WindowsNotifications(notificationTitle, "Keep on punching!", selectedIconName, 2000);
});

window.preload.receive("reconnected", () => {
  moveLocalLogs(false);
});

window.preload.receive("hotKeyPressed", () => {
  LogText("from hot key");
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

window.preload.getVersion().then(v => {
  document.getElementById("appVersion").textContent = "v " + v;
});


const loadSettings = async () => {
  const returnedSettings = await window.preload.getSettings();
  let hotKey = returnedSettings.hotKey || "F9";
  let reminders = returnedSettings.reminders || false;
  let selectedIcon = returnedSettings.selectedIcon || "owl_ico";
  let icon128Path = "../images/" + selectedIcon + "_128.png";
  document.getElementById("mainOwlIconImage").src = icon128Path;
  document.querySelectorAll('input[name="hotKey"]').forEach(function (radioBtn) {
    if (radioBtn.value === hotKey) {
      radioBtn.checked = true;
    }
  });
  document.querySelectorAll('input[name="reminders"]').forEach(function (radioBtn) {
    if (radioBtn.value === reminders) {
      radioBtn.checked = true;
    }
  });
  document.getElementById("currentHotKey").value = hotKey;
  document.getElementById('urlPicker').value = returnedSettings.serverUrl || '';
  document.getElementById('keyPicker').value = returnedSettings.apiKey || '';
  window.preload.registerHotKey(hotKey);
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
      WindowsNotifications("Update!", notifyMessage, selectedIconName, 3500);
    } else {
      if (notifyIfZero) {
        let notifyMessage = "No local logs to move";
        WindowsNotifications("Update!", notifyMessage, selectedIconName, 3500);
      }
    }
  } catch (err) {
    window.preload.logError(err);
    WindowsNotifications("Cannot connect!", "Logs will save locally until connected to network", "exclamation_mark_64.png", 3500);
  }
}

// load all settings, fill out the settings tab with those values, set the hotkey, and move any local logs
loadSettings();
moveLocalLogs(false);

document.getElementById("logBtn").addEventListener("click", function () {
  LogText("add event listener");
});

document
  .getElementById("checkTotalsBtn")
  .addEventListener("click", function () {
    window.preload.send("getCurrentCount");
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
          savePath
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

const pickerConfig = {
  format: "M/D/YYYY",
  toString(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  },
  parse(dateString) {
    const parts = dateString.split("/");
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1] - 1, 10);
    const year = parseInt(parts[1], 10);
    return new Date(year, month, day);
  },
};

const startPicker = new Pikaday({ field: document.getElementById("startDate"), ...pickerConfig });
const endPicker = new Pikaday({ field: document.getElementById("endDate"), ...pickerConfig });

document.getElementById("savePicker").addEventListener("click", async () => {
  const chosenDir = await FileDialog();
  document.getElementById("saveFolderName").textContent = chosenDir;
  document.getElementById("savePath").value = chosenDir;
});

// saves settings. Remember to deregister current hotkey before assigning a new one
document.getElementById("saveBtn").addEventListener("click", async () => {
  try {
    let currentHotKey = document.getElementById("currentHotKey").value;
    let hotKeyChoice = document.querySelector('input[name="hotKey"]:checked').value;
    let remindersChoice = document.querySelector('input[name="reminders"]:checked').value;
    document.getElementById("currentHotKey").value = hotKeyChoice;
    let serverUrl = document.getElementById("urlPicker").value.trim();
    let apiKey = document.getElementById("keyPicker").value.trim();
    if (serverUrl !== "" && apiKey !== "") {
      await window.preload.setSetting("serverUrl", serverUrl);
      await window.preload.setSetting("apiKey", apiKey);
      await window.preload.setSetting("hotKey", hotKeyChoice);
      await window.preload.setSetting("reminders", remindersChoice);
      window.preload.send("remindersChanged");
      window.preload.unregisterHotKey(currentHotKey);
      window.preload.registerHotKey(hotKeyChoice);
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

// when the OS detects network connectivity, immediately attempt reconnect
window.addEventListener('online', () => {
  window.preload.send('reconnectTrigger');
});