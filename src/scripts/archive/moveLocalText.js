const NetworkStrategy = require('./networkStrategy');
const GoogleStrategy = require('../googleStrategy');
const OfficeStrategy = require('./officeStrategy');
const CloudStrategy = require('../cloudStrategy');

// const settings = require('electron-settings');

module.exports = {

    // called to move locally stored logs from settings to log files
    // those functions are in the individual strategy files
    // dependent on user settings
    // as of 1.4.1 only shared drive logging is available

    moveText: function (window) {
        return new Promise(function (resolve, reject) {
            window.preload.getSettings()
                .then(function (returnedSettings) {
                    settings = returnedSettings;
                    if (returnedSettings.localLogs) {
                        if (returnedSettings.logStrategy === "network") {
                            return NetworkStrategy.moveLocalText(returnedSettings,window);
                        } else if (returnedSettings.logStrategy === "google") {
                            return GoogleStrategy.moveLocalText(returnedSettings);
                        } else if (returnedSettings.logStrategy === "office") {
                            return OfficeStrategy.moveLocalText(returnedSettings);
                        } else if (returnedSettings.logStrategy === "cloud") {
                            return CloudStrategy.moveLocalText(returnedSettings);
                        }
                    } else {
                        return 0;
                    }
                }).then(function (logsMoved) {
                    logsMovedObj = {};
                    logsMovedObj.logsMoved = logsMoved;
                    logsMovedObj.selectedIcon = settings.selectedIcon || "owl_ico";
                    resolve(logsMovedObj);
                }).catch(function (error) {
                    console.log("Failed!", error);
                });
        });
    }
}
