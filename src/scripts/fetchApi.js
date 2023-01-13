const axios = require('axios');
const settings = require('electron-settings');
module.exports = {
    fetchApi: async (request = {}) => {
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
            return response;
        } catch (err) {
            console.log(err)
            await settings.set('disconnected', true)
            return err;
        }
    }
}