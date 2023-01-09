

const highlightCurrentOwl = async () => {
    try {
        const { selectedIcon } = await window.preload.getSettings();
        const owlIcons = document.querySelectorAll(".owlIcon");
        for (let i = 0; i < owlIcons.length; i++) {
            if (owlIcons[i].id == selectedIcon) {
                owlIcons[i].classList.add("selectedOwl");
                document.getElementById('selectedOwl').value = selectedIcon;
            }
        }
    } catch (err) {
        console.log(err)
    }
}

// highlight the currently selected owl
highlightCurrentOwl();

// there's no real reason why I decided to add this event listener this way
// besides trying something new
document.body.addEventListener("click", function (event) {
    if (event.target.classList.contains("owlIcon")) {

        const selectedIconId = event.target.id;
        const owlIcons = document.querySelectorAll(".owlIcon");
        for (let i = 0; i < owlIcons.length; i++) {
            owlIcons[i].classList.remove("selectedOwl")
        }
        event.target.classList.add("selectedOwl")
        document.getElementById('selectedOwl').value = selectedIconId;
    }
});

// after saving the new owl settings, send the message back to the main process to close this window
// and change the icon in the main window
document.getElementById("saveBtn").addEventListener("click", async () => {
    let selectedIcon = document.getElementById('selectedOwl').value
    await window.preload.setSetting('selectedIcon', selectedIcon);
    window.preload.send('owlSelected', selectedIcon);
});
