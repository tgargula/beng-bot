class NotionTaskGithubIssueDatabase {
  constructor(collection) {
    this.collection = collection;
  }

  create = async ({ issueNo, notionId, createdAt, updatedAt }) => {
    this.collection({
      issueNo,
      notionId,
      createdAt,
      updatedAt,
    }).save();
  };

  detect = async (notionTasks) => {
    if (!notionTasks?.length) {
      return { newTasks: [], updatedTasks: [] };
    }

    const notionIds = notionTasks.map(({ notionId }) => notionId);
    const oldTasks =
      (await this.collection.find({ notionId: { $in: notionIds } })) || [];

    const dbNotionIds = oldTasks.map(({ notionId }) => notionId);
    const newTasks = notionTasks.filter(
      ({ notionId }) => !dbNotionIds.includes(notionId)
    );

    const updatedTasks = notionTasks.filter(({ notionId, updatedAt }) => {
      const oldTask = oldTasks.find(
        ({ notionId: oldNotionId }) => notionId === oldNotionId
      );
      return (
        oldTask && oldTask.updatedAt.toISOString() !== updatedAt.toISOString()
      );
    });
    return { newTasks, updatedTasks };
  };

  getIssue = async (notionId) => {
    const result = await this.collection.findOne({ notionId }).exec();
    return result?.issueNo;
  };

  getNotionId = async (issueNo) => {
    const result = await this.collection.findOne({ issueNo }).exec();
    return result?.notionId;
  }

  update = async ({ notionId, updatedAt }) => {
    await this.collection.findOneAndUpdate({ notionId }, { updatedAt });
  };
}

module.exports = NotionTaskGithubIssueDatabase;
