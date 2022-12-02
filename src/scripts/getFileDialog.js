const { remote } = require('electron');
const { dialog } = remote;

// opens a folder picker. Returns the chosen folder
// note that this is for picking folders and not files

module.exports = {
    getFolder: function () {
        return new Promise(function (resolve, reject) {
            dialog.showOpenDialog({
                properties: ['openDirectory']
            }).then(result => {
                const chosenDir = result.filePaths[0];
                resolve(chosenDir);
            });
        });
    }
}
