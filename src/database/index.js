const { logger } = require("@tgargula/logger");
const mongoose = require("mongoose");
const NotionTaskGithubIssueDatabase = require("./notion_task_github_issue");
const NotionUserStoryTaskNotionTaskDatabase = require("./notion_user_story_task_notion_task");

const db = process.env.DATABASE_URI;

class Database {
  constructor({ task, userStoryTask }) {
    this.task = new NotionTaskGithubIssueDatabase(task);
    this.userStoryTask = new NotionUserStoryTaskNotionTaskDatabase(
      userStoryTask
    );
  }
}

const connectDatabase = async () => {
  const database = await mongoose.connect(db);
  logger.info("Connected to the database");

  const collections = {
    task: null,
    userStoryTask: null,
  };

  collections.task = database.model(
    "Task",
    new database.Schema({
      issueNo: Number,
      notionId: String,
      createdAt: Date,
      updatedAt: Date,
    })
  );
  logger.info("Created Task model");

  collections.userStoryTask = database.model(
    "UserStoryTask",
    new database.Schema({
      userStoryTaskId: String,
      todoTaskId: String,
      userStoryTaskCreatedAt: Date,
      userStoryTaskUpdatedAt: Date,
      todoTaskCreatedAt: Date,
      todoTaskUpdatedAt: Date,
    })
  );
  logger.info("Created UserStoryTask model");
  module.exports.database = new Database(collections);

  logger.success("Connected and created models");

  return database;
};

module.exports = {
  connectDatabase,
  database: null,
};
