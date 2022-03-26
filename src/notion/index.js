const { Client } = require("@notionhq/client");
const NotionTodo = require("./todo");
const NotionUserStories = require("./user_stories");

const apiKey = process.env.NOTION_API_KEY;

class Notion {
  constructor() {
    this.notion = new Client({ auth: apiKey });
    this.todo = new NotionTodo(this.notion);
    this.userStories = new NotionUserStories(this.notion);
  }
}

module.exports = new Notion();
