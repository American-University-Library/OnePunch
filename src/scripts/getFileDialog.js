const { remote } = require('electron');
console.log(remote);
const { dialog } = remote;
console.log(dialog)

// opens a folder picker. Returns the chosen folder
// note that this is for picking folders and not files

module.exports = {
    getFolder: function () {
        console.log('getfolder')
        return new Promise(function (resolve, reject) {
            console.log('in promise')
            dialog.showOpenDialog({
                properties: ['openDirectory']
            }).then(result => {
                console.log('got file', result)
                const chosenDir = result.filePaths[0];
                resolve(chosenDir);
            });
        });
    }
}
