const iconpath = window.preload.getIconPath();
const warnIconPath = window.preload.getWarnIconPath();

document.getElementById("saveBtn").addEventListener("click", async () => {
  try {
    let hotKeyChoice = document.querySelector('input[name="hotKey"]:checked').value;
    let remindersChoice = document.querySelector('input[name="reminders"]:checked').value;
    let urlEntry = document.getElementById("urlPicker").value;
    let serverUrl = urlEntry.trim();
    let keyEntry = document.getElementById("keyPicker").value;
    let apiKey = keyEntry.trim();
    if (apiKey !== "" && serverUrl !== "") {
      await window.preload.setSetting("serverUrl", serverUrl);
      await window.preload.setSetting("apiKey", apiKey);
      await window.preload.setSetting("hotKey", hotKeyChoice);
      await window.preload.setSetting("reminders", remindersChoice);
      await window.preload.setSetting("disconnected", false);
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
    window.preload.logError(err);
  }
});

document.body.style.overflowY = "scroll";
