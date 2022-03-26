const { default: axios } = require("axios");

const healthcheckJob = () => axios.get('/api/healthcheck');

module.exports = healthcheckJob;