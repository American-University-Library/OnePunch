const axios = require('axios');

const buildLogUrl = (serverUrl, apiKey) => `${serverUrl}?key=${apiKey}`;
module.exports = {
    fetchApi: async ({ serverUrl, apiKey, method = 'get', params = {}, data = {} }) => {
        const url = buildLogUrl(serverUrl, apiKey);
        params.time = new Date().getTime();
        return axios({ method, url, data, params });
    },
    checkHealth: async (serverUrl, apiKey) => {
        try {
            await axios.head(buildLogUrl(serverUrl, apiKey));
            return true;
        } catch {
            return false;
        }
    }
};
