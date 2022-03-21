require("dotenv").config();
const cron = require("node-cron");
const notionListenerJob = require("./jobs");
const createServer = require("./server");

const main = async () => {
  createServer();

  cron.schedule("* * * * *", notionListenerJob);
};

main();
