updateCount();

window.preload.on('updateCount', (owlPicked) => {
    updateCount();
});

const updateCount = async () => {

    const returnedSettings = await window.preload.getSettings();
    const dailyPunchCountObj = window.preload.Reminders(returnedSettings);
    let selectedIcon = returnedSettings.selectedIcon || "owl_ico";
    let icon128Path = "../images/" + selectedIcon + "_128.png";
    document.getElementById("remindersImage").src = icon128Path;
    let dailyPunchCount = dailyPunchCountObj.punchCount;
    
    if (dailyPunchCountObj.sharedPunches !== false) {
        let contentLineOne = "Your desk has helped " + dailyPunchCount + " people so far today!";
        document.getElementById('reminderLine1').textContent = contentLineOne;
        let contentLineTwo = "Keep on punching!";
        document.getElementById('reminderLine2').textContent = contentLineTwo;
    } else {
        if (returnedSettings.assumeDisconnected) {
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
    }
}
