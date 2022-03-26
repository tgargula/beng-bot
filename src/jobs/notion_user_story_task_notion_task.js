const notion = require("../notion");
const db = require("../database");
const { logger } = require("@tgargula/logger");

const PERIOD = 1000 * 60 * 30; // 30 minutes

const notionUserStoryTaskNotionTaskJob = async () => {
  try {
    const database = db.database;
    const [userStoryTasks, todoTasks] = await Promise.all([
      notion.userStories.fetch(),
      notion.todo.fetch(PERIOD),
    ]);
    const { newTasks, updatedUserStoryTasks, updatedTodoTasks } =
      await database.userStoryTask.detect(userStoryTasks, todoTasks);

    newTasks.map(async (task) => {
      const {
        id: todoTaskId,
        created_time: todoTaskCreatedAt,
        last_edited_time: todoTaskUpdatedAt,
      } = await notion.todo.create(task);

      await database.userStoryTask.create({
        userStoryTaskId: task.userStoryTaskId,
        userStoryTaskCreatedAt: task.createdAt,
        userStoryTaskUpdatedAt: task.updatedAt,
        todoTaskCreatedAt: new Date(todoTaskCreatedAt),
        todoTaskUpdatedAt: new Date(todoTaskUpdatedAt),
        todoTaskId,
      });

      logger.info(`Created a new task with id: ${todoTaskId}`);
    });

    updatedUserStoryTasks.map(async (task) => {
      const todoTaskId = await database.userStoryTask.getTodoTaskId(
        task.userStoryTaskId
      );
      if (!todoTaskId) return;
      const { last_edited_time: todoTaskUpdatedAt } = await notion.todo.update(
        todoTaskId,
        task
      );
      await database.userStoryTask.update(task.userStoryTaskId, {
        todoTaskUpdatedAt: new Date(todoTaskUpdatedAt),
        userStoryTaskUpdatedAt: new Date(task.updatedAt),
      });

      logger.info(`Updated a todo task with id: ${todoTaskId}`);
    });

    updatedTodoTasks.map(async (task) => {
      const userStoryTaskId = await database.userStoryTask.getUserStoryTaskId(
        task.id
      );
      if (!userStoryTaskId) return;
      const { last_edited_time: userStoryTaskUpdatedAt } =
        await notion.userStories.update(userStoryTaskId, task);

      await database.userStoryTask.update(userStoryTaskId, {
        todoTaskUpdatedAt: new Date(task.last_edited_time),
        userStoryTaskUpdatedAt: new Date(userStoryTaskUpdatedAt),
      });

      logger.info(
        `Updated a user story task associated with a todo task with id: ${task.id}`
      );
    });
  } catch (err) {
    logger.error("[NOTION_USER_STORY_TASK_NOTION_TASK_JOB ERROR]");
    console.error(err);
  }
};

module.exports = notionUserStoryTaskNotionTaskJob;
