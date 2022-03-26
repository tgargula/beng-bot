require("dotenv").config();
const cron = require("node-cron");
const { connectDatabase } = require("./database");
const {
  notionUserStoryTaskNotionTaskJob,
  notionTaskGithubIssueJob,
  healthcheckJob,
} = require("./jobs");
const createServer = require("./server");

const main = async () => {
  await connectDatabase();
  createServer();

  cron.schedule("* * * * *", notionTaskGithubIssueJob);
  cron.schedule("* * * * *", notionUserStoryTaskNotionTaskJob);
  cron.schedule("*/10 * * * *", healthcheckJob);
};

main();
