const { default: axios } = require("axios");

const healthcheckJob = () => axios.get('https://beng-bot.herokuapp.com/api/healthcheck');

module.exports = healthcheckJob;