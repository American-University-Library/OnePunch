const settings = require('electron-settings');
const WindowsNotifications = require('./windowsNotifications')

module.exports = {

    // called to actually log the text

    logText: function (window, source) {
        return new Promise(async (resolve, reject) => {
            const returnedSettings = await settings.get();
            const assumeDisconnected = returnedSettings.assumeDisconnected;
            const selectedIcon = returnedSettings.selectedIcon || "owl_ico";
            const selectedIconName = selectedIcon + "_64.png";
            const altNotifications = false;
            try {
                const response = await window.preload.postLog();
                if (!response) {
                    throw new Error('Network Unavailable')
                }
                WindowsNotifications.notify("Logged!", "Logged to network", selectedIconName, 2000, altNotifications, window)
                resolve(true);
            } catch (err) {
                console.log(err)
                await saveLocalLog(returnedSettings, window);
                if (assumeDisconnected) {
                    WindowsNotifications.notify(
                        "Logged!",
                        "Logged to local file!",
                        selectedIconName,
                        2000,
                        altNotifications,
                        window
                    );
                    resolve(true);
                } else {
                    WindowsNotifications.notify(
                        "Logged locally!",
                        "Please connect to network.",
                        "exclamation_mark_64.png",
                        3500,
                        altNotifications,
                        window
                    );
                    resolve(true);
                }
            }
        });
    }
}

const saveLocalLog = async (returnedSettings, window) => {
    return new Promise(async (resolve, reject) => {
        try {
            const date = new Date().toUTCString();
            let localLogs = [];
            if (returnedSettings.localLogs) {
                localLogs = returnedSettings.localLogs
            }
            localLogs.push(date);
            await window.preload.setSetting('localLogs', localLogs);
            await window.preload.setSetting('disconnected', true);
            resolve(true);
        } catch(err) {
            console.log(err)
            reject(false)
        }
    })
}