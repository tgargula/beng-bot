const { logger } = require("@tgargula/logger");
const { default: axios } = require("axios");

const repoOwner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const user = process.env.GITHUB_USER;
const token = process.env.GITHUB_TOKEN;

const apiUrl = `https://api.github.com/repos/${repoOwner}/${repo}`;
const appUrl = `https://github.com/${repoOwner}/${repo}`;

class Github {
  createIssue = async ({ title, body }) => {
    const result = await axios.post(
      `${apiUrl}/issues`,
      { title, body },
      { headers: { Authorization: `token ${token}` } }
    );

    const issueNo = result?.data?.number;

    const issueUrl = `${appUrl}/issues/${issueNo}`;

    return { issueNo, issueUrl };
  };

  updateIssue = async ({ issueNo, title, body }) => {
    logger.info('Updating issue ' + issueNo);
    await axios.patch(
      `${apiUrl}/issues/${issueNo}`,
      { title, body },
      { headers: { Authorization: `token ${token}` } }
    );
  };
}

module.exports = new Github();
