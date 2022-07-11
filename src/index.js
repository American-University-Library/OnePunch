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

console.log(window.preload.getSettings());
// load all settings, fill out the settings tab with those values, set the hotkey, and move any local logs
window.preload.getSettings().then(async function (returnedSettings) {
  console.log("returned settings are", returnedSettings);

  // load all the settings
  let hotKey = returnedSettings.hotKey || "F9";
  let deskName = returnedSettings.deskName || "Desk";
  let reminders = returnedSettings.reminders || false;
  let logStrategy = returnedSettings.logStrategy || "cloud";
  let assumeDisconnected = returnedSettings.assumeDisconnected || false;
  altNotifications = returnedSettings.altNotifications || false;
  let selectedIcon = returnedSettings.selectedIcon || "owl_ico";
  let selectedIconName = selectedIcon + "_64.png";
  let icon128Path = "../images/" + selectedIcon + "_128.png";
  let cloudPath = returnedSettings.cloudPath;
  let cloudAuth = returnedSettings.cloudAuth;

  // fill out the settings tab with those settings
  document.getElementById("mainOwlIconImage").src = icon128Path;
  document.getElementById("deskPicker").value = deskName;
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
  document.getElementById("logStrategy").value = logStrategy;

  const strategyRadios = document.querySelectorAll(
    'input[type=radio][name="strategy"]'
  );

  strategyRadios.forEach((radio) => {
    if (radio.value === logStrategy) {
      radio.checked = true;
      const storageDivs = document.querySelectorAll("div.storage");
      storageDivs.forEach((div) => {
        const classList = div.classList;
        if (classList.contains(radio.value)) {
          div.style.display = "inline-block";
        } else {
          div.style.display = "none";
        }
      });
    } else {
      radio.checked = false;
    }
  });

  document.getElementById("cloudAuth").value = cloudAuth || "";
  document.getElementById("cloudPath").value = cloudPath || "";

  // set the hotkey
  window.preload.registerHotKey(hotKey, window);

  // move any local logs
  MoveLocalText(window).then(function (logsMovedObj) {
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
});

document.getElementById("logBtn").addEventListener("click", function () {
  LogText(window, "add event listener");
});

document
  .getElementById("checkTotalsBtn")
  .addEventListener("click", function () {
    window.preload.send("getCurrentCount");
  });

document.getElementById("moveLocalBtn").addEventListener("click", function () {
  MoveLocalText(window).then(function (logsMovedObj) {
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
});
document
  .getElementById("generateReportBtn")
  .addEventListener("click", function () {
    let showDetailByDesk = document.getElementById("deskCheck").checked;
    let showDetailByHour = document.getElementById("hourCheck").checked;
    let startDate = document.getElementById("startDate").value;
    let endDate = document.getElementById("endDate").value;
    let savePath = document.getElementById("savePath").value;
    if (startDate != "" && endDate != "" && savePath != "") {
      Reports(
        startDate,
        endDate,
        showDetailByDesk,
        showDetailByHour,
        savePath,
        window
      ).then(function (reportingComplete) {
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
      });
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
    return `${month}/${day}/${year}`;
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
    return `${month}/${day}/${year}`;
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

// -- change auth flow stuff starts here with the functionality of new buttons

document.getElementById("networkPicker").addEventListener("click", function () {
  FileDialog()
    .then(function (chosenDir) {
      document.getElementById("logFolderName").textContent = chosenDir;
      document.getElementById("logPath").value = chosenDir;
    })
    .catch((err) => console.log("err", err));
});

const strategyRadios = document.querySelectorAll(
  'input[type=radio][name="strategy"]'
);
strategyRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    const storageDivs = document.querySelectorAll("div.storage");
    storageDivs.forEach((div) => {
      const classList = div.classList;
      if (classList.contains(radio.value)) {
        div.style.display = "inline-block";
      } else {
        div.style.display = "none";
      }
    });
  });
});

// -- change auth flow stuff ends here

document.getElementById("savePicker").addEventListener("click", function () {
  FileDialog().then(function (chosenDir) {
    document.getElementById("saveFolderName").textContent = chosenDir;
    document.getElementById("savePath").value = chosenDir;
  });
});

// saves settings. Remember to deregister current hotkey before assigning a new one
document.getElementById("saveBtn").addEventListener("click", function () {
  let currentHotKey = document.getElementById("currentHotKey").value;
  let hotKeyChoice = document.querySelector(
    'input[name="hotKey"]:checked'
  ).value;
  let remindersChoice = document.querySelector(
    'input[name="reminders"]:checked'
  ).value;
  document.getElementById("currentHotKey").value = hotKeyChoice;

  let logStrategy = document.getElementById("logStrategy").value;

  let chosenDir = document.getElementById("logPath").value;

  let cloudPathEntry = document.getElementById("cloudPath").value;
  let cloudPath = cloudPathEntry.trim();
  cloudPath = cloudPath.replace(/[\uE000-\uF8FF]/g, "");

  let cloudAuthEntry = document.getElementById("cloudAuth").value;
  let cloudAuth = cloudAuthEntry.trim();
  cloudAuth = cloudAuth.replace(/[\uE000-\uF8FF]/g, "");

  let deskNameEntry = document.getElementById("deskPicker").value;
  let deskName = deskNameEntry.trim();
  deskName = deskName.replace(/[\uE000-\uF8FF]/g, "");

  let assumeDisconnected = document.getElementById(
    "assumeDisconnectedCheck"
  ).checked;
  let altNotifications = document.getElementById("altNotifications").checked;

  let settingsObj = {};
  if (deskName != "" && chosenDir != "") {
    GetLogLocations(chosenDir, logStrategy).then(function (logPath) {
      window.preload
        .setSetting("logPath", logPath)
        .then(function (settingSaved) {
          return window.preload.setSetting("deskName", deskName);
        })
        .then(function (settingSaved) {
          return window.preload.setSetting("hotKey", hotKeyChoice);
        })
        .then(function (settingSaved) {
          return window.preload.setSetting("logStrategy", logStrategy);
        })
        .then(function (settingSaved) {
          return window.preload.setSetting("reminders", remindersChoice);
        })
        .then(function (settingSaved) {
          window.preload.send("remindersChanged");
        })
        .then(function (settingSaved) {
          return window.preload.setSetting(
            "assumeDisconnected",
            assumeDisconnected
          );
        })
        .then(function (settingSaved) {
          return window.preload.setSetting(
            "altNotifications",
            altNotifications
          );
        })
        .then(function (settingSaved) {
          return window.preload.setSetting("cloudPath", cloudPath);
        })
        .then(function (settingSaved) {
          return window.preload.setSetting("cloudAuth", cloudAuth);
        })
        .then(async function (settingSaved) {
          window.preload.unregisterHotKey(currentHotKey);
          window.preload.registerHotKey(hotKeyChoice, window);
        })
        .then(function (settingSaved) {
          window.preload.showMessageBox({
            message: "Settings saved!",
            buttons: ["OK"],
            type: "info",
            icon: iconpath,
            title: "Saved",
          });
        })
        .catch(function (error) {
          console.log("Failed!", error);
        });
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

  console.log(cloudPath, cloudAuth);
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
