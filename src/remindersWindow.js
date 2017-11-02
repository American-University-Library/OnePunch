const SettingsScript = require('./scripts/settings_script');
const Reminders = require('./scripts/reminders')

SettingsScript.getSetting()
    .then(function (returnedSettings) {
        Reminders.getDailyPunches(returnedSettings).then(function (dailyPunchCount) {
            if (dailyPunchCount !== false) {
                let contentLineOne = "Your desk has helped " + dailyPunchCount + " people so far today!";
                document.getElementById('reminderLine1').textContent = contentLineOne;
                let contentLineTwo = "Keep on punching!";
                document.getElementById('reminderLine2').textContent = contentLineTwo;
            } else {
                let contentLineOne = "Cannot connect!";
                document.getElementById('reminderLine1').textContent = contentLineOne;
                let contentLineTwo = "Please connect to network drive";
                document.getElementById('reminderLine2').textContent = contentLineTwo;
            }
        });
    });
