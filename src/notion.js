const { Client } = require("@notionhq/client");
const { applyMarkdown, getObjectType, supportedBlocks } = require("./utils");

const apiKey = process.env.NOTION_API_KEY;
const databaseId = process.env.NOTION_DATABASE_ID;

const mergeRichText = (richText) => {
  return richText.reduce((prev, { plain_text }) => `${prev}${plain_text}`, "");
};

class Notion {
  constructor() {
    this.notion = new Client({ auth: apiKey });
  }

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

          return {
            createdAt: new Date(created_time),
            updatedAt: new Date(last_edited_time),
            notionId: id,
            title,
            body,
          };
        }
      )
    );
  };

  update = async ({ pageId, issueUrl }) => {
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
}

module.exports = new Notion();
