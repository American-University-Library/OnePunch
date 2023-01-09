const {
    contextBridge,
    ipcRenderer,
} = require('electron');
const electron = require('electron')
const app = electron.app || electron.remote.app
const globalShortcut = /* electron.globalShortcut ||  */ electron.remote.globalShortcut
const dialog = electron.dialog || electron.remote.dialog
const process = electron.process || electron.remote.process
const electronSettings = require('electron-settings')
const axios = require('axios');
const path = require('path');
const LogText = require("./logText");
const WindowsNotifications = require('./windowsNotifications');
const Reports = require("./reporting");
const {
    settings
} = require('cluster');
const {
    stringify
} = require('querystring');

const setHotKey = (hotKey, window) => {
    globalShortcut.register(hotKey, () => {
        LogText.logText(window, 'from hot key');
    });
}

contextBridge.exposeInMainWorld(
    'preload', {
    LogText: (window, source) => LogText.logText(window, source),
    moveLocalText: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const returnedSettings = await electronSettings.get();
                let logsMovedCount = 0;
                if (returnedSettings.localLogs) {
                    const localLogs = returnedSettings.localLogs;
                    logsMovedCount = localLogs.length;
                    for (log of localLogs) {
                        const res = await postLog(true, log);
                        if (!res) {
                            throw new Error('Connection Error')
                        }
                    }
                }
                logsMovedObj = {};
                logsMovedObj.logsMoved = logsMovedCount;
                logsMovedObj.selectedIcon = returnedSettings.selectedIcon || "owl_ico";
                await electronSettings.set('disconnected', false)
                await electronSettings.set('localLogs', [])
                resolve(logsMovedObj);
            } catch (err) {
                console.log(err)
                await electronSettings.set('disconnected', true)
                reject(false)
            }


        });
    },
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
            await electronSettings.set('disconnected', false)
            const cloudData = response.data;
            let localData = [];
            if (returnedSettings.localLogs) {
                localData = returnedSettings.localLogs;
            }
            const reportText = Reports.generateReportText(cloudData, timeDetail);
            const reportingComplete = await Reports.writeReportToCsv(reportText, savePath);
            return reportingComplete;
        } catch (err) {
            console.log(err);
            if (error === "connection error") {
                WindowsNotifications.notify("Cannot connect!", "Please connect to network", "exclamation_mark_64.png", 3500, returnedSettings.altNotifications, window);
            }
            await electronSettings.set('disconnected', true)
            return false;
        }
    },
    fileDialog: async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory']
        })
        const chosenDir = result.filePaths[0];
        return chosenDir;
    },
    WindowsNotifications: (notificationTitle, notificationText, icon, hangTime, altNotifications, window) => WindowsNotifications.notify(notificationTitle, notificationText, icon, hangTime, altNotifications, window),
    reminders: () => {
        return new Promise(async (resolve, reject) => {
            const returnedSettings = await electronSettings.get();
            let localPunches = 0;
            if (returnedSettings.localLogs) {
                localPunches = returnedSettings.localLogs.length;
            }
            try {
                if (returnedSettings.disconnected) {
                    throw new Error('Disconnected')
                }
                const response = await axios.get(returnedSettings.logPath);
                await electronSettings.set('disconnected', false)
                const sharedPunchCount = response.data.length;
                let sharedPunches = true;
                if (!sharedPunchCount && sharedPunchCount !== 0) {
                    sharedPunches = false;
                }
                resolve({
                    punchCount: localPunches + sharedPunchCount,
                    sharedPunches: sharedPunches
                });
            } catch (err) {
                console.log(err)
                await electronSettings.set('disconnected', true)
                reject(localPunches);
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
        const validKeys = ['showUpdateSummary', 'selectedIcon', 'logPath', 'deskName', 'hotKey', 'reminders', 'assumeDisconnected', 'altNotifications', 'localLogs', 'disconnected'];
        if (validKeys.includes(key)) {
            await electronSettings.set(key, value);
        }
    },
    deleteSetting: async (key) => {
        const validKeys = ['showUpdateSummary', 'selectedIcon', 'logPath', 'deskName', 'hotKey', 'reminders', 'assumeDisconnected', 'altNotifications', 'localLogs'];
        if (validKeys.includes(key)) {
            await electronSettings.unset(key);
        }
    },
    postLog: () => postLog(),
    send: (channel, data) => {
        let validChannels = ['getCurrentCount', 'remindersChanged', 'showOwlWindow', 'showAboutWindow', 'owlSelected', 'settingsComplete', 'electron-toaster-reply', 'electron-toaster-message', 'newOwl', 'openUrlInBrowser'];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    on: (channel, func) => {
        let validChannels = ['reminderNotify', 'newOwl', 'updateCount'];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, message) => {
                return message;
            });
        }
    },
    receive: (channel, func) => {
        let validChannels = ['reminderNotify', 'newOwl', 'updateCount'];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }

}
)

const postLog = async (forcePost, log) => {
    // to send specific time post time as GMT
    //    {
    //        "date": "2022-12-22T14:38:51.087Z"      
    //    }
    try {
        const data = {};
        if (log) {
            data.date = log;
        }
        const returnedSettings = await electronSettings.get();
        if (returnedSettings.disconnected && !forcePost) {
            throw new Error('Disconnected');
        }
        const request = {
            method: 'post',
            url: returnedSettings.logPath,
            data: data
        }
        const response = await axios(request);
        await electronSettings.set('disconnected', false)
        return response;
    } catch (err) {
        console.log(err);
        await electronSettings.set('disconnected', true)
        return false;
    }
}