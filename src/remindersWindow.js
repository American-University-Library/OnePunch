window.preload.receive('updateCount', () => {
    updateCount();
});

const pluralize = (n) => (n === 1 ? 'person' : 'people');
const widgetContainer = document.getElementById('reminderWidget');

const updateCount = async () => {
    const returnedSettings = await window.preload.getSettings();
    const selectedIcon = returnedSettings.selectedIcon || "owl_ico";
    document.getElementById("remindersImage").src = `../images/${selectedIcon}_128.png`;

    try {
        const result = await window.preload.reminders();
        const n = result.punchCount;
        document.getElementById('reminderLine1').textContent = `Your desk has helped ${n} ${pluralize(n)} so far today!`;
        document.getElementById('reminderLine2').textContent = "Keep on punching!";
        window.reminderWidget.render(widgetContainer, result.logs);
    } catch (localCount) {
        // Network unavailable — show local count, widget renders with empty bars
        const n = localCount || 0;
        document.getElementById('reminderLine1').textContent = `Your desk has helped ${n} ${pluralize(n)} so far today!`;
        document.getElementById('reminderLine2').textContent = "Keep on punching!";
        window.reminderWidget.render(widgetContainer, null);
    }
};

updateCount();
