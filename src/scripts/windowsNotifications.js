module.exports = {
    notify: function (notificationTitle, notificationText, icon, hangTime) {
        const iconPath = '../images/' + icon;
        const notification = new Notification(notificationTitle, {
            icon: iconPath,
            body: notificationText,
            silent: true
        });
        notification.onshow = () => setTimeout(() => notification.close(), hangTime);
        notification.onerror = (err) => console.error(err);
    }
};
