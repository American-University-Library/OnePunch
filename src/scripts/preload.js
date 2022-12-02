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
    Reports: (startDate, endDate, showDetailByDesk, showDetailByHour, savePath, window) => Reports.generateReport(startDate, endDate, showDetailByDesk, showDetailByHour, savePath, window),
    GetLogLocations: (location) => GetLogLocations.getLogLocations(location),
    FileDialog: () => FileDialog.getFolder(),
    WindowsNotifications: (notificationTitle, notificationText, icon, hangTime, altNotifications, window) => WindowsNotifications.notify(notificationTitle, notificationText, icon, hangTime, altNotifications, window),
    Reminders: (returnedSettings) => Reminders.getDailyPunches(returnedSettings),
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
            const response = axios({
                method: 'post',
                url: returnedSettings.logPath,
                data: {}
            });
            return response;
        } catch (err) {
            console.log(err)
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