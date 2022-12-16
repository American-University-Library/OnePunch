const {
    contextBridge,
    ipcRenderer
} = require('electron');

const electron = require('electron')

const app = electron.app || electron.remote.app
const globalShortcut = /* electron.globalShortcut ||  */ electron.remote.globalShortcut
const dialog = electron.dialog || electron.remote.dialog
const process = electron.process || electron.remote.process


const electronSettings = require('electron-settings')
const axios = require('axios');

// TO MOVE

const path = require('path');

const LogText = require("./logText");
const MoveLocalText = require("./moveLocalText");
const Reports = require("./reporting");
const GetLogLocations = require("./getLogLocations");
const FileDialog = require("./getFileDialog");
//const Pikaday = require("./pikaday");
const WindowsNotifications = require("./windowsNotifications");
const Reminders = require('./reminders');
const {
    settings
} = require('cluster');

const setHotKey = (hotKey, window) => {
    globalShortcut.register(hotKey, () => {
        LogText.logText(window, 'from hot key');
    });
}

contextBridge.exposeInMainWorld(
    'preload', {
    LogText: (window, source) => LogText.logText(window, source),
    MoveLocalText: window => MoveLocalText.moveText(window),
    Reports: async (startDate,
        endDate,
        myDeskOnly,
        timeDetail,
        savePath,
        window) => {
        try {
            const returnedSettings = await electronSettings.get();
            const all = !myDeskOnly;
            const url = `${returnedSettings.logPath}&start_date=${startDate}&end_date=${endDate}&all=${all}`
            const response = await axios.get(url);
            const cloudData = response.data;
            let localData = [];
            if (returnedSettings.localLogs) {
                localData = returnedSettings.localLogs;
            }
            const reportingComplete = await Reports.generateReport(
                timeDetail,
                savePath,
                cloudData,
                localData,
                window)
            return reportingComplete;
        } catch (err) {
            console.log(err);
            return false;
        }
    },
    GetLogLocations: (location) => GetLogLocations.getLogLocations(location),
    FileDialog: () => FileDialog.getFolder(),
    WindowsNotifications: (notificationTitle, notificationText, icon, hangTime, altNotifications, window) => WindowsNotifications.notify(notificationTitle, notificationText, icon, hangTime, altNotifications, window),
    Reminders: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const returnedSettings = await electronSettings.get();
                const response = await axios.get(returnedSettings.logPath);
                const sharedPunchCount = response.data.length;
                let localPunches = 0;
                let sharedPunches = true;
                if (returnedSettings.localLogs) {
                    localPunches = returnedSettings.localLogs.length;
                }
                if (!sharedPunchCount && sharedPunchCount !== 0) {
                    sharedPunches = false;
                }
                resolve({
                    punchCount: localPunches + sharedPunchCount,
                    sharedPunches: sharedPunches
                });
            } catch (err) {
                reject(err);
            }
        });
    },
    getIconPath: () => {
        const iconpath = path.join(__dirname, '/images/owl_ico_16.png');
        return iconpath;
    },
    getWarnIconPath: () => {
        const warnIconPath = path.join(__dirname, '/images/exclamation_mark_64.png');
        return warnIconPath
    },
    getVersion: () => app.getVersion(),
    getElectronVersion: () => {
        return process.versions.electron;
    },
    getChromeVersion: () => {
        return process.versions.chrome;
    },
    registerHotKey: (hotKey, window) => {
        let validHotKeys = ['F9', 'Ctrl+F9', 'Ctrl+Alt+F9'];
        if (validHotKeys.includes(hotKey)) {
            setHotKey(hotKey, window)
        }
    },
    unregisterHotKey: hotKey => {
        let validHotKeys = ['F9', 'Ctrl+F9', 'Ctrl+Alt+F9'];
        if (validHotKeys.includes(hotKey)) {
            globalShortcut.unregister(hotKey)
        }
    },
    showMessageBox: msgObj => {
        dialog.showMessageBox(msgObj)
    },
    getSettings: async () => {
        const fetchedSettings = await electronSettings.get();
        return fetchedSettings;
    },
    setSetting: async (key, value) => {
        const validKeys = ['showUpdateSummary', 'selectedIcon', 'logPath', 'deskName', 'hotKey', 'reminders', 'assumeDisconnected', 'altNotifications', 'initialized', 'localLogs'];
        if (validKeys.includes(key)) {
            await electronSettings.set(key, value);
        }
    },
    deleteSetting: async (key) => {
        const validKeys = ['showUpdateSummary', 'selectedIcon', 'logPath', 'deskName', 'hotKey', 'reminders', 'assumeDisconnected', 'altNotifications', 'initialized', 'localLogs'];
        if (validKeys.includes(key)) {
            await electronSettings.unset(key);
        }
    },
    postLog: async () => {
        try {
            const returnedSettings = await electronSettings.get();
            const request = {
                method: 'post',
                url: returnedSettings.logPath,
                data: {}
            }
            const response = await axios(request);
            return response;
        } catch (err) {
            console.log(err)
            return false;
        }
    },
    send: (channel, data) => {
        let validChannels = ['getCurrentCount', 'remindersChanged', 'showOwlWindow', 'showAboutWindow', 'owlSelected', 'settingsComplete', 'electron-toaster-reply', 'electron-toaster-message'];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    on: (channel, func) => {
        let validChannels = ['reminderNotify', 'newOwl', 'updateCount'];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },

}
)