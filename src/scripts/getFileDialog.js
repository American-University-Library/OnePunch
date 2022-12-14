const { remote } = require('electron');
const { dialog } = remote;

// opens a folder picker. Returns the chosen folder
// note that this is for picking folders and not files

module.exports = {
    getFolder: async () => {
        const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
        const chosenDir = result.filePaths[0];
        return chosenDir;
    }
}
