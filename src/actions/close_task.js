const { logger } = require("@tgargula/logger");
const db = require("../database");
const notion = require("../notion");

const closeTask = async (payload) => {
  const database = db.database;
  const issueNo = payload?.issue?.number;
  const notionId = await database.task.getNotionId(issueNo);
  if (!notionId) {
    throw new Error(`Notion id not found for issue #${issueNo}`);
  }
  await notion.todo.update(notionId, {
    Status: { type: "select", select: { name: "Done", color: "green" } },
  });
  logger.info(`Task with id: ${notionId} successfully updated to done`);
};

module.exports = closeTask;
