const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const LogText = require("./logText");
const WindowsNotifications = require('./windowsNotifications');
const Reports = require("./reporting");
const { fetchApi } = require('./fetchApi');
const logger = require('electron-log/renderer');

// All settings access goes through the main process via IPC
const getSettings = () => ipcRenderer.invoke('settings:get');
const setSettingIPC = (key, value) => ipcRenderer.invoke('settings:set', key, value);

const iconpath = path.join(__dirname, '../images/owl_ico_16.png');
const warnIconPath = path.join(__dirname, '../images/exclamation_mark_64.png');

// postLog must be defined before contextBridge so the closure in LogText captures it
const postLog = async (forcePost, logEntry) => {
    try {
        const { serverUrl, apiKey, disconnected } = await getSettings();
        if (disconnected && !forcePost) throw new Error('Disconnected');
        const data = logEntry ? { date: logEntry } : {};
        const response = await fetchApi({ serverUrl, apiKey, method: 'post', data });
        await setSettingIPC('disconnected', false);
        return response;
    } catch (err) {
        logger.error(err);
        if (err.message !== 'Disconnected') {
            await setSettingIPC('disconnected', true);
        }
        ipcRenderer.send('reconnectTrigger');
        return false;
    }
};

contextBridge.exposeInMainWorld(
    'preload', {
        LogText: (source) => LogText.logText(postLog, source),
        moveLocalText: async () => {
            const settings = await getSettings();
            const localLogs = [...(settings.localLogs || [])];
            let logsMovedCount = 0;
            for (const log of localLogs) {
                const res = await postLog(true, log);
                if (!res) throw new Error('Connection Error');
                logsMovedCount++;
                await setSettingIPC('localLogs', localLogs.slice(logsMovedCount));
            }
            return {
                logsMoved: logsMovedCount,
                selectedIcon: settings.selectedIcon || "owl_ico"
            };
        },
        Reports: async (startDate, endDate, myDeskOnly, timeDetail, savePath) => {
            try {
                const { serverUrl, apiKey } = await getSettings();
                const params = { start_date: startDate, end_date: endDate, all: !myDeskOnly };
                const response = await fetchApi({ serverUrl, apiKey, params });
                const reportText = Reports.generateReportText(response.data, timeDetail);
                return await Reports.writeReportToCsv(reportText, savePath);
            } catch (err) {
                logger.error(err);
                return false;
            }
        },
        fileDialog: async () => ipcRenderer.invoke('showOpenDialog'),
        WindowsNotifications: (notificationTitle, notificationText, icon, hangTime) =>
            WindowsNotifications.notify(notificationTitle, notificationText, icon, hangTime),
        reminders: () => {
            return new Promise(async (resolve, reject) => {
                const settings = await getSettings();
                const localPunches = settings.localLogs?.length || 0;
                try {
                    if (settings.disconnected) throw new Error('Disconnected');
                    const { serverUrl, apiKey } = settings;
                    const response = await fetchApi({ serverUrl, apiKey });
                    resolve({
                        punchCount: localPunches + response.data.length,
                        sharedPunches: true,
                        logs: response.data
                    });
                } catch (err) {
                    logger.error(err);
                    reject(localPunches);
                }
            });
        },
        getIconPath: () => iconpath,
        getWarnIconPath: () => warnIconPath,
        getVersion: () => ipcRenderer.invoke('getVersion'),
        getElectronVersion: () => process.versions.electron,
        getChromeVersion: () => process.versions.chrome,
        registerHotKey: (hotKey) => ipcRenderer.invoke('registerHotKey', hotKey),
        unregisterHotKey: (hotKey) => ipcRenderer.invoke('unregisterHotKey', hotKey),
        showMessageBox: (msgObj) => ipcRenderer.invoke('showMessageBox', msgObj),
        getSettings: () => getSettings(),
        setSetting: (key, value) => setSettingIPC(key, value),
        deleteSetting: (key) => ipcRenderer.invoke('settings:unset', key),
        postLog: () => postLog(),
        send: (channel, data) => {
            const validChannels = ['getCurrentCount', 'remindersChanged', 'showOwlWindow', 'showAboutWindow', 'owlSelected', 'settingsComplete', 'newOwl', 'openUrlInBrowser', 'reconnectTrigger'];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            const validChannels = ['reminderNotify', 'newOwl', 'updateCount', 'reconnected', 'hotKeyPressed'];
            if (validChannels.includes(channel)) {
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        },
        logError: (err) => logger.error(err)
    }
);
