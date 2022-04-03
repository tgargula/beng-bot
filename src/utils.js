const { NOTION_OWNER } = process.env;

const notionToGithubUser = {
  "tgargula@student.agh.edu.pl": "tgargula",
  "faciszewski@student.agh.edu.pl": "faci2000",
  "jbugajski@student.agh.edu.pl": "janbugajski",
  "pstecyk@student.agh.edu.pl": "piotreto",
  "pierog@student.agh.edu.pl": "Pirgo",
  "ukowski@student.agh.edu.pl": "t-ukowski",
};

const prefix = {
  paragraph: "\n",
  heading_1: "# ",
  heading_2: "## ",
  heading_3: "### ",
  to_do_checked: "- [X] ",
  to_do_unchecked: "- [ ] ",
  bulleted_list_item: "* ",
  numbered_list_item: "1. ",
  code: "```\n",
};

const suffix = {
  paragraph: "",
  heading_1: "",
  heading_2: "",
  heading_3: "",
  to_do_checked: "",
  to_do_unchecked: "",
  bulleted_list_item: "",
  numbered_list_item: "",
  code: "\n```",
};

const supportedBlocks = [...Object.keys(prefix), "to_do"];

const applyMarkdown = (type, text) => {
  return `${prefix[type]}${text}${suffix[type]}`;
};

const getObjectType = (obj, type) => {
  if (type === "to_do") {
    return obj[type].rich_text.checked ? "to_do_checked" : "to_do_unchecked";
  }
  if (!supportedBlocks.includes(type)) {
    return "paragraph";
  }
  return type;
};

const mergeRichText = (richText) => {
  return richText.reduce((prev, { plain_text }) => `${prev}${plain_text}`, "");
};

const buildNotionDatabasePage = (databaseId) => {
  return `https://notion.so/${NOTION_OWNER}/${databaseId.replaceAll("-", "")}`;
};

const parseNotionToGithubAssignees = (people) => {
  return people
    .filter(({ person: { email } }) =>
      Object.keys(notionToGithubUser).includes(email)
    )
    .map(({ person: { email } }) => notionToGithubUser[email]);
};

module.exports = {
  applyMarkdown,
  getObjectType,
  mergeRichText,
  buildNotionDatabasePage,
  parseNotionToGithubAssignees,
  supportedBlocks,
};
