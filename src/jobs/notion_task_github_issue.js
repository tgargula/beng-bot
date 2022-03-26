const { logger } = require("@tgargula/logger");
const database = require("../database");
const github = require("../github");
const notion = require("../notion");

const PERIOD = 1000 * 60 * 30; // 30 minutes
const ISSUE_BY_STATUS = ["To do", "In progress"];
const GITHUB_CATEGORIES = ["FE", "BE", "BL", "E2E", "DO", "MB"];

/**
 * Detects new or updated tasks in Notion To do database
 * and creates or updates Github issue accordingly
 */
const notionTaskGithubIssueJob = async () => {
  try {
    const notionTasks = await notion.todo.fetchAndTransform(PERIOD);
    const { newTasks, updatedTasks } = await database.detect(notionTasks);

    newTasks.map(
      async ({
        title,
        body,
        notionId,
        createdAt,
        updatedAt,
        categories,
        status,
      }) => {
        if (
          !ISSUE_BY_STATUS.includes(status) ||
          !GITHUB_CATEGORIES.some((category) => categories.includes(category))
        )
          return;

        const { issueNo, issueUrl } = await github.createIssue({ title, body });
        await notion.todo.updateIssueUrl({ pageId: notionId, issueUrl });
        await database.task.create({ issueNo, notionId, createdAt, updatedAt });
      }
    );

    updatedTasks.map(async ({ title, body, notionId, updatedAt }) => {
      const issueNo = await database.task.getIssue(notionId);
      await github.updateIssue({ issueNo, title, body });
      await database.task.update({ notionId, updatedAt });
    });
  } catch (err) {
    logger.error('[NOTION_TASK_GITHUB_ISSUE_JOB ERROR]');
    console.error(err);
  }
}

module.exports = notionTaskGithubIssueJob;
