const { logger } = require("@tgargula/logger");
const db = require("../database");
const github = require("../github");
const notion = require("../notion");

const PERIOD = 1000 * 60 * 30; // 30 minutes
const ISSUE_BY_STATUS = ["To do", "In progress"];
const GITHUB_CATEGORIES = ["FE", "BE", "BL", "E2E", "DO", "MB"];

const createNewGithubIssues = (database, newTasks) => {
  return Promise.all(
    newTasks.map(
      async ({
        title,
        body,
        notionId,
        createdAt,
        updatedAt,
        categories,
        status,
        assignees,
      }) => {
        // Skip tasks that don't require a github issue
        if (
          !ISSUE_BY_STATUS.includes(status) ||
          !GITHUB_CATEGORIES.some((category) => categories.includes(category))
        )
          return;

        const { issueNo, issueUrl } = await github.createIssue({
          title,
          body,
          assignees,
        });
        await notion.todo.updateIssueUrl({ pageId: notionId, issueUrl });
        await database.task.create({ issueNo, notionId, createdAt, updatedAt });
      }
    )
  );
};

const updateGithubIssues = (database, updatedTasks) => {
  return Promise.all(
    updatedTasks.map(
      async ({ title, body, notionId, updatedAt, assignees }) => {
        const issueNo = await database.task.getIssue(notionId);
        await github.updateIssue({ issueNo, title, body, assignees });
        await database.task.update({ notionId, updatedAt });
      }
    )
  );
};

/**
 * Detects new or updated tasks in Notion To do database
 * and creates or updates Github issue accordingly
 */
const notionTaskGithubIssueJob = async () => {
  try {
    const database = db.database;
    const notionTasks = await notion.todo.fetchAndTransform(PERIOD);
    const { newTasks, updatedTasks } = await database.task.detect(notionTasks);

    await Promise.all([
      createNewGithubIssues(database, newTasks),
      updateGithubIssues(database, updatedTasks),
    ]);
  } catch (err) {
    logger.error("[NOTION_TASK_GITHUB_ISSUE_JOB ERROR]");
    console.error(err);
    throw err;
  }
};

module.exports = notionTaskGithubIssueJob;
