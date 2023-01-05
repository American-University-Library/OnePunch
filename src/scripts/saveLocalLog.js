// when there's no connection logs are saved as an array of objects in the app settings

module.exports = {
    saveLocalLog: function (settingsLogObject, window) {
        return new Promise(async (resolve, reject) => {
            const date = new Date().toUTCString();
            console.log(date);
            let localLogs = [];
            if (settingsLogObject.localLogs) {
                localLogs = settingsLogObject.localLogs
            }
            localLogs.push(date);
            await window.preload.setSetting('localLogs', localLogs);
            await window.preload.setSetting('disconnected', true);
            resolve(settingsLogObject.logObject);
            /* if (settingsLogObject.localLogs) {
                let localLogs = settingsLogObject.localLogs;
                localLogs.push(settingsLogObject.logObject);
                await window.preload.setSetting('localLogs', localLogs);
                resolve(settingsLogObject.logObject);
            } else {
                localLogs = [];
                localLogs.push(settingsLogObject.logObject);
                await window.preload.setSetting('localLogs', localLogs);
                resolve(settingsLogObject.logObject);
            } */
        });
    }

}
