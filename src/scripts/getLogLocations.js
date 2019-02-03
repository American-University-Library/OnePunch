const SettingsScript = require('./settings_script');
const NetworkStrategy = require('./networkStrategy');
const GoogleStrategy = require('./googleStrategy');
const OfficeStrategy = require('./officeStrategy');
const CloudStrategy = require('./cloudStrategy');


module.exports = {

    // called to check where to go for getting logged interactions
    // dependent on user settings
    // as of 1.4.1 only shared drive logging is available

    getLogLocations: function(chosenDir, logStrategy) {
        return new Promise(function (resolve, reject) {
            if (logStrategy === "network") {
                NetworkStrategy.getLogLocation(chosenDir).then(function (logPath) {
                    resolve(logPath);
                });
            } else if (logStrategy === "google") {
                GoogleStrategy.getLogLocation(chosenDir).then(function (logPath) {
                    resolve(logPath);
                });
            } else if (logStrategy === "office") {
                OfficeStrategy.getLogLocation(chosenDir).then(function (logPath) {
                    resolve(logPath);
                });
            } else if (logStrategy === "cloud") {
                CloudStrategy.getLogLocation(chosenDir).then(function (logPath) {
                    resolve(logPath);
                });
            }

        });
    }
}
