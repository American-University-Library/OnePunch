const NetworkStrategy = require('./archive/networkStrategy');
const GoogleStrategy = require('../googleStrategy');
const OfficeStrategy = require('./archive/officeStrategy');
const CloudStrategy = require('./cloudStrategy');


module.exports = {

    // called to check where to go for getting logged interactions
    // dependent on user settings
    // as of 1.4.1 only shared drive logging is available

    getLogLocations: function([url, key]) {
        return new Promise(function (resolve, reject) {
            resolve(url + "?key=" + key);
        });
    }
}
