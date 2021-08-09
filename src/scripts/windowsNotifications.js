// A Windows update briefly prevented the app from accessing native notifications
// to get around this a new notification system was added using browser windows,
// and reading the users system to pick the correct notification style
// the fix ended up being to explicitly declare the appId in the main.js file
// I've left open the potential for falling back on the secondary notifications if needed in the future

/* const os = require('os');
const osRelease = os.release();
const osReleaseArray = osRelease.split(".");
const osReleaseNum = osReleaseArray[2]; */

module.exports = {

    notify: function (notificationTitle, notificationText, icon, hangTime, altNotifications,window) {

        //altNotifications = true;

        console.log('notify params',notificationTitle, notificationText, icon, hangTime, altNotifications,window)
        const iconPath = '../images/' + icon;
        if (altNotifications) {

            console.log('in alt')
            
            var msg = {
                title: notificationTitle,
                message: notificationText,
                width: 440,
                // height : 160, window will be autosized
                timeout: hangTime,
                icon: iconPath
            };
            window.preload.send('electron-toaster-message', msg);
        } else {
            console.log('In notifier')
            const options = {
                icon: iconPath,
                body: notificationText
            };
            const notification = new Notification(notificationTitle, options);
            notification.onshow = function () {
                setTimeout(function () {
                    notification.close();
                }, hangTime);
            }

            notification.onerror = err => {
                console.log('error', err)
            }

            console.log('notification', notification)
        }
    }
}
