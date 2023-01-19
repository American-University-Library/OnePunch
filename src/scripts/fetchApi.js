const axios = require('axios');
const settings = require('electron-settings');
const log = require('electron-log');
module.exports = {
    fetchApi: (request = {}) => {
        return new Promise(async (resolve, reject) => {
            try {
                const {
                    method = 'get',
                    params = {},
                    data = {}
                } = request;
                const {
                    logPath
                } = await settings.get();
                params.time = new Date().getTime();
                const response = await axios({
                    method: method,
                    url: logPath,
                    data: data,
                    params: params
                });
                await settings.set('disconnected', false)
                resolve(response);
            } catch (err) {
                await settings.set('disconnected', true)
                reject(err);
            }
        })
        
    }
}