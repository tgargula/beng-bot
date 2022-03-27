const {
  applyMarkdown,
  getObjectType,
  mergeRichText,
  buildNotionDatabasePage,
  supportedBlocks,
} = require("../utils");

const databaseId = process.env.NOTION_TODO_DATABASE_ID;

class NotionTodo {
  constructor(notion) {
    this.notion = notion;
  }

  #transformProperties = ({ Status, Assign, Cost, Name, Priority, Tags }) => ({
    Status: Status && {
      type: "select",
      select: Status.select
        ? { name: Status.select.name, color: Status.select.color }
        : { name: "Backlog", color: "brown" },
    },
    Assign: Assign && {
      type: "people",
      people: Assign.people,
    },
    Cost: Cost && {
      type: "select",
      select: Cost.select && {
        name: Cost.select.name,
        color: Cost.select.color,
      },
    },
    Name: Name && {
      type: "title",
      title: Name.title,
    },
    Priority: Priority && {
      type: "select",
      select: Priority.select && {
        name: Priority.select.name,
        color: Priority.select.color,
      },
    },
    Tags: Tags && {
      type: "multi_select",
      multi_select: Tags.multi_select?.map(({ name, color }) => ({
        name,
        color,
      })),
    },
  });

  fetch = async (period) => {
    const after = period && new Date(new Date() - period);

    const filter = after && {
      last_edited_time: { after: after.toISOString() },
      property: "Updated at",
    };

    const { results } = await this.notion.databases.query({
      database_id: databaseId,
      filter,
    });

    return results;
  };

  fetchAndTransform = async (period) => {
    const results = await this.fetch(period);

    return Promise.all(
      results.map(
        async ({ id, properties, created_time, last_edited_time }) => {
          const title = mergeRichText(properties.Name.title);
          const { results } = await this.notion.blocks.children.list({
            block_id: id,
          });
          const texts = results.map((obj) => {
            const { type } = obj;
            if (!supportedBlocks.includes(type)) return "";
            const text = mergeRichText(obj[type].rich_text);
            const objectType = getObjectType(obj, type);
            return applyMarkdown(objectType, text);
          });
          const body = texts.join("\n");
          const status = properties.Status?.select?.name;
          const categories =
            properties.Tags?.multi_select?.map(({ name }) => name) || [];

          return {
            createdAt: new Date(created_time),
            updatedAt: new Date(last_edited_time),
            notionId: id,
            title,
            body,
            categories,
            status,
          };
        }
      )
    );
  }

  update = async (id, task) => {
    return this.notion.pages.update({
      page_id: id,
      properties: this.#transformProperties(task),
    });
  };

  updateIssueUrl = async ({ pageId, issueUrl }) => {
    await this.notion.pages.update({
      page_id: pageId,
      properties: {
        Issue: {
          rich_text: [
            {
              text: {
                content: issueUrl,
                link: { url: issueUrl },
              },
            },
          ],
        },
      },
    });
  };

  create = async (properties) => {
    const { userStoryTaskId } = properties;
    const url = buildNotionDatabasePage(userStoryTaskId);
    const userStory = {
      rich_text: [
        {
          type: "text",
          text: {
            content: url,
            link: { url },
          },
        },
      ],
    };
    return this.notion.pages.create({
      parent: { database_id: databaseId, type: "database_id" },
      properties: {
        ...this.#transformProperties(properties),
        "User story": userStory,
      },
    });
  };
}

module.exports = NotionTodo;
