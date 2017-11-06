

module.exports = {

    notify: function (notificationTitle, notificationText, icon, hangTime) {
        const iconPath = '../images/' + icon;
        const options = {
            icon: iconPath,
            body: notificationText
        };
        const notification = new Notification(notificationTitle, options);
        console.log(notification);
        notification.onshow = function () {
            setTimeout(function () {
                notification.close();
            }, hangTime);
        }


    }
}
