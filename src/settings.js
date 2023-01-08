const iconpath = window.preload.getIconPath();
const warnIconPath = window.preload.getWarnIconPath();

// add listeners to page elements

document.getElementById("saveBtn").addEventListener("click", async () => {
  try {
    let hotKeyChoice = document.querySelector(
      'input[name="hotKey"]:checked'
    ).value;
    let remindersChoice = document.querySelector(
      'input[name="reminders"]:checked'
    ).value;
    let assumeDisconnected = document.getElementById(
      "assumeDisconnectedCheck"
    ).checked;
    let altNotifications = document.getElementById("altNotifications").checked;
    let urlEntry = document.getElementById("urlPicker").value;
    let url = urlEntry.trim();
    let keyEntry = document.getElementById("keyPicker").value;
    let key = keyEntry.trim();
    if (key != "" && url != "") {
      const logPath = url + "?key=" + key;
      await window.preload.setSetting("logPath", logPath);
      await window.preload.setSetting("hotKey", hotKeyChoice);
      await window.preload.setSetting("reminders", remindersChoice);
      await window.preload.setSetting("assumeDisconnected", assumeDisconnected);
      await window.preload.setSetting("altNotifications", altNotifications);
      await window.preload.setSetting("initialized", true);
      await window.preload.send("settingsComplete");
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
    console.log(err);
  }
});

/*const monitorScreen = screen.getPrimaryDisplay();
const monitorScreenHeight = monitorScreen.workAreaSize.height;
if (monitorScreenHeight < 925) {
    document.body.style.overflowY = "scroll";
}*/

document.body.style.overflowY = "scroll";
