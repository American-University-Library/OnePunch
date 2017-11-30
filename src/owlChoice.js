const {
    ipcRenderer
} = require('electron');
const SettingsScript = require("./scripts/settings_script");

// highlight the currently selected owl
SettingsScript.getSetting("selectedIcon").then(function(settingsIconId){
    var selectedIconId = settingsIconId || "owl_ico";
    var owlIcons = document.querySelectorAll(".owlIcon");
        for (var i = 0; i < owlIcons.length; i++) {
            if (owlIcons[i].id == selectedIconId) {
                owlIcons[i].classList.add("selectedOwl");
                document.getElementById('selectedOwl').value = selectedIconId;
            }
        }
})

// there's no real reason why I decided to add this event listener this way
// besides trying something new
document.body.addEventListener("click", function (event) {
    if (event.target.classList.contains("owlIcon")) {
        var selectedIconId = event.target.id;
        var owlIcons = document.querySelectorAll(".owlIcon");
        for (var i = 0; i < owlIcons.length; i++) {
            owlIcons[i].classList.remove("selectedOwl")
        }
        event.target.classList.add("selectedOwl")
        document.getElementById('selectedOwl').value = selectedIconId;
    }
});

// after saving the new owl settings, send the message back to the main process to close this window
// and change the icon in the main window
document.getElementById("saveBtn").addEventListener("click", function () {
    let selectedIcon = document.getElementById('selectedOwl').value
    SettingsScript.saveSetting('selectedIcon', selectedIcon).then(function (settingSaved) {
        ipcRenderer.send('owlSelected', selectedIcon);
    });
});
