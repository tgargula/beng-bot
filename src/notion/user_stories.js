const { buildNotionDatabasePage } = require("../utils");

const databaseId = process.env.NOTION_USER_STORIES_DATABASE_ID;

class NotionUserStories {
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
    const { results } = await this.notion.databases.query({
      database_id: databaseId,
    });

    const after = period && new Date(new Date() - period);

    const filter = after && {
      last_edited_time: { after: after.toISOString() },
      property: "Updated At",
    };

    const tasks = await Promise.all(
      results.map(async ({ id }) => {
        const { results } = await this.notion.blocks.children.list({
          block_id: id,
        });
        const [childDatabase] = results.filter(
          ({ type, child_database }) =>
            type === "child_database" && child_database?.title === "Tasks split"
        );
        if (!childDatabase) {
          return [];
        }
        const { results: tasks } = await this.notion.databases.query({
          database_id: childDatabase.id,
          filter,
        });

        const mappedTasks = tasks.map(({ id, properties }) => {
          const { Name, Tags, Cost, Priority, Status, Assign } = properties;
          return {
            userStoryTaskId: id,
            updatedAt: new Date(properties["Updated At"].last_edited_time),
            createdAt: new Date(properties["Created At"].created_time),
            Name,
            Tags,
            Cost,
            Priority,
            Status,
            Assign,
          };
        });

        return mappedTasks;
      })
    );

    return tasks.flat();
  };

  update = async (userStoryTaskId, { properties }, todoTaskId) => {
    const url = todoTaskId && buildNotionDatabasePage(todoTaskId);
    const todoTask = url && {
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

    return this.notion.pages.update({
      page_id: userStoryTaskId,
      properties: { ...this.#transformProperties(properties), Task: todoTask },
    });
  };
}

module.exports = NotionUserStories;
