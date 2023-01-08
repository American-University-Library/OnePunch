window.preload.receive('updateCount', () => {
    updateCount();
});

const updateCount = async () => {
    const returnedSettings = await window.preload.getSettings();
    let selectedIcon = returnedSettings.selectedIcon || "owl_ico";
    let icon128Path = "../images/" + selectedIcon + "_128.png";
    document.getElementById("remindersImage").src = icon128Path;
    try {
        const dailyPunchCountObj = await window.preload.Reminders(returnedSettings);
        let dailyPunchCount = dailyPunchCountObj.punchCount;
        document.getElementById('reminderLine1').textContent = "Your desk has helped " + dailyPunchCount + " " + (dailyPunchCount > 1 || dailyPunchCount === 0 ? 'people' : 'person') + " so far today!";
        document.getElementById('reminderLine2').textContent = "Keep on punching!";
    } catch (localCount) {
        if (returnedSettings.assumeDisconnected) {
            document.getElementById('reminderLine1').textContent = "Your desk has helped " + localCount + " " + (localCount > 1 || localCount === 0 ? 'people' : 'person') + " so far today!";;
            document.getElementById('reminderLine2').textContent = "Keep on punching!";
        } else {
            document.getElementById('reminderLine1').textContent = "Cannot connect!";
            document.getElementById('reminderLine2').textContent = "Please connect to network";
        }
    }


}

updateCount();