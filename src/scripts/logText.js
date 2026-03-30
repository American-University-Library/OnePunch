const { ipcRenderer } = require('electron');
const WindowsNotifications = require('./windowsNotifications');

module.exports = {
    logText: async function (doPost, source) {
        const returnedSettings = await ipcRenderer.invoke('settings:get');
        const selectedIconName = (returnedSettings.selectedIcon || "owl_ico") + "_64.png";
        try {
            const response = await doPost();
            if (!response) throw new Error('Network Unavailable');
            WindowsNotifications.notify("Logged!", "Logged to network", selectedIconName, 2000);
        } catch (err) {
            console.error(err);
            await saveLocalLog(returnedSettings);
            WindowsNotifications.notify("Logged!", "Logged locally", selectedIconName, 2000);
        }
    }
};

const saveLocalLog = async (returnedSettings) => {
    const date = new Date().toUTCString();
    const localLogs = returnedSettings.localLogs || [];
    localLogs.push(date);
    await ipcRenderer.invoke('settings:set', 'localLogs', localLogs);
    await ipcRenderer.invoke('settings:set', 'disconnected', true);
};
