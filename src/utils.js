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

const supportedBlocks = [...Object.keys(prefix), 'to_do'];

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

module.exports = {
  applyMarkdown,
  getObjectType,
  supportedBlocks,
};
