
// highlight the currently selected owl
window.preload.getSettings().then(function({selectedIcon}){
    console.log('opening page', 'id', selectedIcon)
    var selectedIconId = selectedIcon || "owl_ico";
    var owlIcons = document.querySelectorAll(".owlIcon");
        for (var i = 0; i < owlIcons.length; i++) {
            if (owlIcons[i].id == selectedIcon) {
                owlIcons[i].classList.add("selectedOwl");
                document.getElementById('selectedOwl').value = selectedIcon;
            }
        }
})

// there's no real reason why I decided to add this event listener this way
// besides trying something new
document.body.addEventListener("click", function (event) {
    console.log('clicking owl')
    if (event.target.classList.contains("owlIcon")) {
        
        var selectedIconId = event.target.id;
        console.log('selected id',selectedIconId)
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
    console.log('selected icon is ', selectedIcon)
    window.preload.setSetting('selectedIcon', selectedIcon).then(function (settingSaved) {
        window.preload.send('owlSelected', selectedIcon);
    });
});
