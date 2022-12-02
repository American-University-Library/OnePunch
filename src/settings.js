// Load library
//const GetLogLocations = window.preload.GetLogLocations;
//const FileDialog = window.preload.FileDialog;

const iconpath = window.preload.getIconPath();
const warnIconPath = window.preload.getWarnIconPath();

// add listeners to page elements

document.getElementById("saveBtn").addEventListener("click", async () => {
  try {
    let deskNameEntry =
      document.getElementById("deskPicker").value === ""
        ? "desk"
        : document.getElementById("deskPicker").value;
    let deskName = deskNameEntry.trim();
    deskName = deskName.replace(/[\uE000-\uF8FF]/g, "");
    let hotKeyChoice = document.querySelector(
      'input[name="hotKey"]:checked'
    ).value;
    let remindersChoice = document.querySelector(
      'input[name="reminders"]:checked'
    ).value;
    let chosenDir = document.getElementById("logPath").value;
    let assumeDisconnected = document.getElementById(
      "assumeDisconnectedCheck"
    ).checked;
    let altNotifications = document.getElementById("altNotifications").checked;
    let urlEntry = document.getElementById("urlPicker").value;
    let url = urlEntry.trim();
    let keyEntry = document.getElementById("keyPicker").value;
    let key = keyEntry.trim();

    let settingsObj = {};
    const location = [url, key];
    if (key != "" && url != "") {

      const logPath = await window.preload.GetLogLocations(
        location
      );
      await window.preload.setSetting("logPath", logPath);
      await window.preload.setSetting("deskName", deskName);
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
  } catch (error) {
    console.log("Failed!", error);
  }
});

/*const monitorScreen = screen.getPrimaryDisplay();
const monitorScreenHeight = monitorScreen.workAreaSize.height;
if (monitorScreenHeight < 925) {
    document.body.style.overflowY = "scroll";
}*/

document.body.style.overflowY = "scroll";
