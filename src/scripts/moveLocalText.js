const SettingsScript = require('./settings_script');
const NetworkStrategy = require('./networkStrategy');
const GoogleStrategy = require('./googleStrategy');
const OfficeStrategy = require('./officeStrategy');


module.exports = {

    moveText: function () {
        return new Promise(function (resolve, reject) {
            SettingsScript.getSetting()
                .then(function (returnedSettings) {
                    if (returnedSettings.localLogs) {
                        if (returnedSettings.logStrategy === "network") {
                            return NetworkStrategy.moveLocalText(returnedSettings);
                        } else if (returnedSettings.logStrategy === "google") {
                            return GoogleStrategy.moveLocalText(returnedSettings);
                        } else if (returnedSettings.logStrategy === "office") {
                            return OfficeStrategy.moveLocalText(returnedSettings);
                        }
                    } else {
                        return 0;
                    }
                }).then(function (logsMoved) {
                    resolve(logsMoved);
                }).catch(function (error) {
                    console.log("Failed!", error);
                });
        });
    }
}
