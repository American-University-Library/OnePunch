const NetworkStrategy = require('./networkStrategy');
const GoogleStrategy = require('../googleStrategy');
const OfficeStrategy = require('./officeStrategy');
const CloudStrategy = require('../cloudStrategy');


module.exports = {

    // called to check where to go for getting logged interactions
    // dependent on user settings
    // as of 1.4.1 only shared drive logging is available

    getLogLocations: function(location, logStrategy) {
        console.log('in get log',location,logStrategy)
        return new Promise(function (resolve, reject) {
            if (logStrategy === "network") {
                NetworkStrategy.getLogLocation(location).then(function (logPath) {
                    resolve(logPath);
                });
            } else if (logStrategy === "google") {
                GoogleStrategy.getLogLocation(location).then(function (logPath) {
                    resolve(logPath);
                });
            } else if (logStrategy === "office") {
                OfficeStrategy.getLogLocation(location).then(function (logPath) {
                    resolve(logPath);
                });
            } else if (logStrategy === "cloud") {
                CloudStrategy.getLogLocation(location).then(function (logPath) {
                    console.log(location, "log path", logPath)
                    resolve(logPath);
                });
            }

        });
    }
}
