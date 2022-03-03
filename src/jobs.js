const database = require("./database");
const github = require("./github");
const notion = require("./notion");

const PERIOD = 1000 * 60 * 30; // 30 minutes

const notionListenerJob = async () => {
  try {
    const notionTasks = await notion.fetch(PERIOD);
    const { newTasks, updatedTasks } = await database.detect(notionTasks);

    newTasks.map(async ({ title, body, notionId, createdAt, updatedAt }) => {
      const { issueNo, issueUrl } = await github.createIssue({ title, body });
      await notion.update({ pageId: notionId, issueUrl });
      await database.create({ issueNo, notionId, createdAt, updatedAt });
    });

    updatedTasks.map(async ({ title, body, notionId, updatedAt }) => {
      const issueNo = await database.getIssue(notionId);
      await github.updateIssue({ issueNo, title, body });
      await database.update({ notionId, updatedAt });
    });
  } catch (err) {
    console.error(err);
  }
};

module.exports = notionListenerJob;
