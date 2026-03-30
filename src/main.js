const {
    app,
    dialog,
    Tray,
    Menu,
    ipcMain,
    shell,
    globalShortcut,
    BrowserWindow
} = require('electron');

const settings = require('electron-settings');
const path = require('path');
const { autoUpdater } = require("electron-updater");
const { fetchApi, checkHealth } = require("./scripts/fetchApi");

app.preventExit = true;

const log = require('electron-log/main');
log.initialize();
log.transports.file.level = 'error';

const exeName = path.basename(process.execPath);

app.setLoginItemSettings({
    openAtLogin: true,
    args: [
        '--processStart', `"${exeName}"`,
        '--process-start-args', `"--hidden"`
    ]
});

const iconpath = path.join(__dirname, '/images/owl_ico_16.png');
const preloadPath = path.join(__dirname, 'scripts/preload.js');

const windowWebPreferences = {
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: false,
    preload: preloadPath
};

autoUpdater.logger = log;
autoUpdater.logger["transports"].file.level = "info";

let mainWindow;
let remindersWindow = null;
let tray = null;
let reconnectInterval = null;
let remindersTimeout;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.focus();
        }
    });
}

function createSplashScreen() {
    let splashScreen = new BrowserWindow({
        width: 300,
        height: 300,
        frame: false,
        resizable: false,
        center: true,
        maximizable: false,
        fullscreenable: false,
        title: "OnePunch",
        icon: iconpath,
        show: false,
        webPreferences: windowWebPreferences
    });

    splashScreen.loadFile(path.join(__dirname, '/views/splash.html'));

    splashScreen.once('ready-to-show', () => {
        splashScreen.show();
        setTimeout(() => {
            createMainWindow();
            splashScreen.close();
        }, 1500);
    });

    splashScreen.on('closed', () => { splashScreen = null; });
}

function createUpdateSummaryWindow() {
    let updateSummary = new BrowserWindow({
        width: 350,
        useContentSize: true,
        resizable: true,
        center: true,
        maximizable: true,
        fullscreenable: true,
        title: "OnePunch",
        icon: iconpath,
        show: false,
        webPreferences: windowWebPreferences
    });

    updateSummary.loadFile(path.join(__dirname, '/views/updateSummary.html'));
    if (!app.isPackaged) updateSummary.webContents.openDevTools();

    updateSummary.once('ready-to-show', async () => {
        updateSummary.show();
        await settings.set('showUpdateSummary', false);
    });

    updateSummary.on('closed', () => { updateSummary = null; });
    updateSummary.setMenu(null);
}

function createAboutWindow() {
    let aboutWindow = new BrowserWindow({
        width: 350,
        useContentSize: true,
        resizable: false,
        center: true,
        maximizable: false,
        fullscreenable: false,
        title: "OnePunch",
        icon: iconpath,
        show: false,
        webPreferences: windowWebPreferences
    });

    aboutWindow.loadFile(path.join(__dirname, '/views/about.html'));
    if (!app.isPackaged) aboutWindow.webContents.openDevTools();

    aboutWindow.once('ready-to-show', () => { aboutWindow.show(); });
    aboutWindow.on('closed', () => { aboutWindow = null; });
    aboutWindow.setMenu(null);
}

function createOwlChoiceWindow() {
    let owlChoice = new BrowserWindow({
        useContentSize: true,
        resizable: false,
        center: true,
        maximizable: false,
        fullscreenable: false,
        title: "OnePunch",
        icon: iconpath,
        width: 580,
        height: 750,
        show: false,
        webPreferences: windowWebPreferences
    });

    owlChoice.loadFile(path.join(__dirname, '/views/owlChoice.html'));
    if (!app.isPackaged) owlChoice.webContents.openDevTools();

    owlChoice.once('ready-to-show', () => { owlChoice.show(); });
    owlChoice.on('closed', () => { owlChoice = null; });
    owlChoice.setMenu(null);
}

function createRemindersWindow() {
    if (remindersWindow !== null) {
        remindersWindow.webContents.send('updateCount');
    } else {
        remindersWindow = new BrowserWindow({
            width: 350,
            height: 600,
            resizable: false,
            show: true,
            center: true,
            maximizable: false,
            fullscreenable: false,
            title: "OnePunch",
            icon: iconpath,
            webPreferences: windowWebPreferences
        });

        remindersWindow.loadFile(path.join(__dirname, '/views/reminder.html'));
        if (!app.isPackaged) remindersWindow.webContents.openDevTools();
        remindersWindow.once('ready-to-show', () => { remindersWindow.show(); });
        remindersWindow.on('closed', () => { remindersWindow = null; });
        remindersWindow.setMenu(null);
    }
}

function createSettingsWindow() {
    let settingsWindow = new BrowserWindow({
        width: 350,
        height: 925,
        resizable: true,
        show: true,
        center: true,
        maximizable: true,
        fullscreenable: true,
        title: "OnePunch",
        icon: iconpath,
        webPreferences: windowWebPreferences
    });

    settingsWindow.loadFile(path.join(__dirname, '/views/settings.html'));
    if (!app.isPackaged) settingsWindow.webContents.openDevTools();
    settingsWindow.on('closed', () => { settingsWindow = null; });
    settingsWindow.setMenu(null);

    return settingsWindow;
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 350,
        height: 875,
        resizable: true,
        show: false,
        center: true,
        maximizable: true,
        fullscreenable: true,
        title: "OnePunch",
        icon: iconpath,
        webPreferences: windowWebPreferences
    });

    mainWindow.loadFile(path.join(__dirname, '/views/index.html'));
    if (!app.isPackaged) mainWindow.webContents.openDevTools();

    mainWindow.on('minimize', (event) => {
        event.preventDefault();
        mainWindow.hide();
    });

    mainWindow.on('close', (event) => {
        if (app.preventExit) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    mainWindow.on('closed', () => { mainWindow = null; });
    mainWindow.setMenu(null);
}

const startAppWithSettings = async (returnedSettings, settingsWindow) => {
    if (returnedSettings.reminders === "notifications" || returnedSettings.reminders === "popups") {
        loopReminders();
    }
    createSplashScreen();
    if (settingsWindow) {
        settingsWindow.close();
    }

    tray = new Tray(iconpath);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'How are we doing today?',
            click: () => { createNotificationReminder(); }
        },
        {
            label: 'Open OnePunch',
            click: () => { mainWindow.show(); }
        },
        {
            label: 'Quit',
            click: () => {
                app.isQuiting = true;
                app.preventExit = false;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('OnePunch');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => { mainWindow.show(); });

    if (returnedSettings.showUpdateSummary) {
        createUpdateSummaryWindow();
    }
};

app.on('ready', async () => {
    const returnedSettings = await settings.get();
    if (hasRequiredSettings(returnedSettings)) {
        await startAppWithSettings(returnedSettings);
        if (app.isPackaged) setTimeout(() => { autoUpdater.checkForUpdates().catch(err => log.error(err)); }, 2500);
        if (returnedSettings.disconnected) startReconnectLoop();
    } else {
        createSettingsWindow();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});

autoUpdater.on('update-downloaded', async () => {
    try {
        const { response } = await dialog.showMessageBox(mainWindow, {
            message: "Updates downloaded. Install and restart?",
            buttons: ["Yes", "Cancel"],
            type: "info",
            icon: iconpath,
            title: "OnePunch Updates"
        });
        if (response === 0) {
            await settings.set('showUpdateSummary', true);
            app.preventExit = false;
            setImmediate(() => autoUpdater.quitAndInstall(true, true));
        }
    } catch (err) {
        log.error(err);
    }
});

async function genReminders() {
    const currentSettings = await settings.get();
    if (currentSettings.disconnected) return;
    if (currentSettings.reminders === "popups") {
        createRemindersWindow();
    } else {
        createNotificationReminder();
    }
}

function loopReminders() {
    const reminderLagMs = 1000 * 60 * Math.floor(Math.random() * (80 - 40 + 1) + 40);
    remindersTimeout = setTimeout(async () => {
        await genReminders();
        loopReminders();
    }, reminderLagMs);
}

async function handleReconnect() {
    await settings.set('disconnected', false);
    if (reconnectInterval) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
    }
    if (mainWindow) {
        mainWindow.webContents.send('reconnected');
    }
}

function startReconnectLoop() {
    if (reconnectInterval) return;
    reconnectInterval = setInterval(async () => {
        const { serverUrl, apiKey } = await settings.get();
        const healthy = await checkHealth(serverUrl, apiKey);
        if (healthy) {
            await handleReconnect();
        }
    }, 30000);
}

const createNotificationReminder = async () => {
    const returnedSettings = await settings.get();
    if (returnedSettings.disconnected) return;
    let localPunches = returnedSettings.localLogs ? returnedSettings.localLogs.length : 0;
    const dailyPunchCountObj = {
        punchCount: localPunches,
        sharedPunches: false,
        selectedIcon: returnedSettings.selectedIcon
    };
    try {
        const response = await fetchApi({ serverUrl: returnedSettings.serverUrl, apiKey: returnedSettings.apiKey });
        dailyPunchCountObj.sharedPunches = true;
        dailyPunchCountObj.punchCount += response.data.length;
        mainWindow.webContents.send('reminderNotify', dailyPunchCountObj);
    } catch (err) {
        log.error(err);
        mainWindow.webContents.send('reminderNotify', dailyPunchCountObj);
    }
};

// IPC handlers

ipcMain.on('settingsComplete', async (event) => {
    const returnedSettings = await settings.get();
    const settingsWindow = BrowserWindow.fromWebContents(event.sender);
    if (hasRequiredSettings(returnedSettings)) {
        await startAppWithSettings(returnedSettings, settingsWindow);
        if (app.isPackaged) setTimeout(() => { autoUpdater.checkForUpdates().catch(err => log.error(err)); }, 2500);
    } else {
        createSettingsWindow();
    }
});

ipcMain.on('remindersChanged', async () => {
    const returnedSettings = await settings.get();
    clearTimeout(remindersTimeout);
    if (returnedSettings.reminders === "notifications" || returnedSettings.reminders === "popups") {
        loopReminders();
    }
});

ipcMain.on('getCurrentCount', () => { createRemindersWindow(); });

ipcMain.on('showOwlWindow', () => { createOwlChoiceWindow(); });

ipcMain.on('showAboutWindow', () => { createAboutWindow(); });

ipcMain.on('openUrlInBrowser', (event, url) => {
    const validUrls = [
        "https://www.flaticon.com/authors/becris",
        "https://www.flaticon.com/authors/dimitry-miroliubov",
        "http://www.freepik.com",
        "https://www.flaticon.com/authors/gregor-cresnar",
        "https://www.flaticon.com/authors/pixel-buddha",
        "https://www.flaticon.com/authors/roundicons",
        "https://www.flaticon.com/authors/vectors-market",
        "https://www.flaticon.com/",
        "http://creativecommons.org/licenses/by/3.0/",
        "https://github.com/American-University-Library/OnePunch"
    ];
    if (validUrls.includes(url)) {
        shell.openExternal(url);
    }
});

ipcMain.on('owlSelected', (event, selectedOwl) => {
    const owlWindow = BrowserWindow.getFocusedWindow();
    if (owlWindow) owlWindow.close();
    mainWindow.webContents.send('newOwl', selectedOwl);
});

ipcMain.on('reconnectTrigger', async () => {
    const { serverUrl, apiKey } = await settings.get();
    const healthy = await checkHealth(serverUrl, apiKey);
    if (healthy) {
        await handleReconnect();
    } else {
        startReconnectLoop();
    }
});

ipcMain.handle('showMessageBox', (event, msgObj) => {
    return dialog.showMessageBox(msgObj);
});

ipcMain.handle('registerHotKey', (event, hotKey) => {
    const validHotKeys = ['F9', 'Ctrl+F9', 'Ctrl+Alt+F9'];
    if (!validHotKeys.includes(hotKey)) return false;
    globalShortcut.register(hotKey, () => {
        if (mainWindow) mainWindow.webContents.send('hotKeyPressed');
    });
    return true;
});

ipcMain.handle('unregisterHotKey', (event, hotKey) => {
    const validHotKeys = ['F9', 'Ctrl+F9', 'Ctrl+Alt+F9'];
    if (validHotKeys.includes(hotKey)) {
        globalShortcut.unregister(hotKey);
    }
});

ipcMain.handle('getVersion', () => app.getVersion());

ipcMain.handle('settings:get', () => settings.get());

ipcMain.handle('settings:set', (_event, key, value) => {
    const validKeys = ['serverUrl', 'apiKey', 'hotKey', 'reminders', 'disconnected', 'localLogs', 'showUpdateSummary', 'selectedIcon'];
    if (!validKeys.includes(key)) throw new Error(`Invalid settings key: ${key}`);
    return settings.set(key, value);
});

ipcMain.handle('settings:unset', (event, key) => {
    const validKeys = ['serverUrl', 'apiKey', 'hotKey', 'reminders', 'disconnected', 'localLogs', 'showUpdateSummary', 'selectedIcon'];
    if (!validKeys.includes(key)) throw new Error(`Invalid settings key: ${key}`);
    return settings.unset(key);
});

ipcMain.handle('showOpenDialog', () => {
    return dialog.showOpenDialog({ properties: ['openDirectory'] })
        .then(result => result.filePaths[0]);
});

const hasRequiredSettings = ({ serverUrl, apiKey, hotKey }) => {
    return !!(serverUrl?.length && apiKey?.length && hotKey?.length);
};

app.setAppUserModelId(process.execPath);
