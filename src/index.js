const LogText = window.preload.LogText;
const MoveLocalText = window.preload.MoveLocalText;
const Reports = window.preload.Reports;
const GetLogLocations = window.preload.GetLogLocations;
const FileDialog = window.preload.FileDialog;
const WindowsNotifications = window.preload.WindowsNotifications;

const iconpath = window.preload.getIconPath();
const warnIconPath = window.preload.getWarnIconPath();

// add tab elements, hide all but home tab

const tabSettings = {
  settingsTab: {
    style: [
      {
        name: "overflowY",
        value: "scroll",
      },
    ],
  },
  homeTab: {
    style: [
      {
        name: "overflowY",
        value: "hidden",
      },
    ],
  },
  reportsTab: {
    style: [
      {
        name: "overflowY",
        value: "hidden",
      },
    ],
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

// load all settings, fill out the settings tab with those values, set the hotkey, and move any local logs
window.preload.getSettings().then(async function (returnedSettings) {

  // load all the settings
  let hotKey = returnedSettings.hotKey || "F9";
  // let deskName = returnedSettings.deskName || "Desk";
  let reminders = returnedSettings.reminders || false;
  let assumeDisconnected = returnedSettings.assumeDisconnected || false;
  altNotifications = returnedSettings.altNotifications || false;
  let selectedIcon = returnedSettings.selectedIcon || "owl_ico";
  let selectedIconName = selectedIcon + "_64.png";
  let icon128Path = "../images/" + selectedIcon + "_128.png";
  let cloudPath = returnedSettings.cloudPath;
  let cloudAuth = returnedSettings.cloudAuth;

  // fill out the settings tab with those settings
  document.getElementById("mainOwlIconImage").src = icon128Path;
  // document.getElementById("deskPicker").value = deskName;
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
  document.getElementById("altNotifications").checked = altNotifications;
  const logPath = returnedSettings.logPath.display || "Not defined";
  const logPathValue = returnedSettings.logPath.display || "Not defined";
  document.getElementById("logPath").value = logPathValue;

  document.getElementById("cloudAuth").value = cloudAuth || "";
  document.getElementById("cloudPath").value = cloudPath || "";

  // set the hotkey
  window.preload.registerHotKey(hotKey, window);

  // move any local logs
  const logsMovedObj = await MoveLocalText(window);
  let logsMoved = logsMovedObj.logsMoved;
  if (logsMoved !== false) {
    if (logsMoved > 0) {
      let notifyMessage =
        "Moved " + logsMoved + " logs from local storage to shared file";
      WindowsNotifications(
        "Update!",
        notifyMessage,
        selectedIconName,
        3500,
        altNotifications,
        window
      );
    }
  } else {
    WindowsNotifications(
      "Cannot connect!",
      "Logs will save locally until connected to network drive",
      "exclamation_mark_64.png",
      3500,
      altNotifications,
      window
    );
  }



});

document.getElementById("logBtn").addEventListener("click", function () {
  LogText(window, "add event listener");
});

document
  .getElementById("checkTotalsBtn")
  .addEventListener("click", function () {
    window.preload.send("getCurrentCount");
  });

document.getElementById("moveLocalBtn").addEventListener("click", async () => {
  const logsMovedObj = MoveLocalText(window);
  let logsMoved = logsMovedObj.logsMoved;
  let selectedIcon = logsMovedObj.selectedIcon;
  let selectedIconName = selectedIcon + "_64.png";
  if (logsMoved !== false) {
    if (logsMoved > 0) {
      let notifyMessage =
        "Moved " + logsMoved + " logs from local storage to shared file";
      WindowsNotifications(
        "Update!",
        notifyMessage,
        selectedIconName,
        3500,
        altNotifications,
        window
      );
    } else {
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
  } else {
    WindowsNotifications(
      "Cannot connect!",
      "Logs will save locally until connected to network drive",
      "exclamation_mark_64.png",
      3500,
      altNotifications,
      window
    );
  }
});


document
  .getElementById("generateReportBtn")
  .addEventListener("click", async () => {
    let myDeskOnly = document.getElementById("myDesk").checked;
    const timeRadios = document.getElementsByName('time');
    let timeDetail = 'day';
    timeRadios.forEach(radio => {
      if(radio.checked) {
        timeDetail = radio.value
      }
    });
    let startDate = document.getElementById("startDate").value;
    let endDate = document.getElementById("endDate").value;
    let savePath = document.getElementById("savePath").value;
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
  });

var startPicker = new Pikaday({
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

var endPicker = new Pikaday({
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
    let chosenDir = document.getElementById("logPath").value;
    let cloudPathEntry = document.getElementById("cloudPath").value;
    let cloudPath = cloudPathEntry.trim();
    cloudPath = cloudPath.replace(/[\uE000-\uF8FF]/g, "");
    let cloudAuthEntry = document.getElementById("cloudAuth").value;
    let cloudAuth = cloudAuthEntry.trim();
    cloudAuth = cloudAuth.replace(/[\uE000-\uF8FF]/g, "");
    // let deskNameEntry = document.getElementById("deskPicker").value;
    // let deskName = deskNameEntry.trim();
    // deskName = deskName.replace(/[\uE000-\uF8FF]/g, "");
    let assumeDisconnected = document.getElementById(
      "assumeDisconnectedCheck"
    ).checked;
    let altNotifications = document.getElementById("altNotifications").checked;
    let settingsObj = {};
    if (cloudPath != "" && cloudAuth != "") {
      const logPath = await GetLogLocations(chosenDir);
      await window.preload.setSetting("logPath", logPath);
      //await window.preload.setSetting("deskName", deskName);
      await window.preload.setSetting("hotKey", hotKeyChoice);
      await window.preload.setSetting("reminders", remindersChoice);
      window.preload.send("remindersChanged");
      await window.preload.setSetting(
        "assumeDisconnected",
        assumeDisconnected
      );
      await window.preload.setSetting(
        "altNotifications",
        altNotifications
      );
      await window.preload.setSetting("cloudPath", cloudPath);
      await window.preload.setSetting("cloudAuth", cloudAuth);
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
    console.log(err)
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

document.getElementById("validateBtn").addEventListener("click", () => {
  let cloudPathEntry = document.getElementById("cloudPath").value;
  let cloudPath = cloudPathEntry.trim();
  cloudPath = cloudPath.replace(/[\uE000-\uF8FF]/g, "");
  let cloudAuthEntry = document.getElementById("cloudAuth").value;
  let cloudAuth = cloudAuthEntry.trim();
  cloudAuth = cloudAuth.replace(/[\uE000-\uF8FF]/g, "");
});

window.preload.on("reminderNotify", (dailyPunchCountObj) => {
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
        "Please connect to network drive",
        "exclamation_mark_64.png",
        3500,
        altNotifications,
        window
      );
    }
  }
});

// change the main icon after user selects a new image
window.preload.on("newOwl", (owlPicked) => {
  let icon128Path = "../images/" + owlPicked + "_128.png";
  document.getElementById("mainOwlIconImage").src = icon128Path;
});
