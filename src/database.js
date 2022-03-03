const mongoose = require("mongoose");

const db = process.env.DATABASE_URI;

let collection;
const createCollection = async (db) => {
  collection = db?.model(
    "Task",
    new db.Schema({
      issueNo: Number,
      notionId: String,
      createdAt: Date,
      updatedAt: Date,
    })
  );
};

mongoose.connect(db).then(createCollection);

class Mongo {
  create = async ({ issueNo, notionId, createdAt, updatedAt }) => {
    collection?.({
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
      (await collection?.find({ notionId: { $in: notionIds } })) || [];

    const dbNotionIds = oldTasks.map(({ notionId }) => notionId);
    const newTasks = notionTasks.filter(
      ({ notionId }) => !dbNotionIds.includes(notionId)
    );

    const updatedTasks = notionTasks.filter(({ notionId, updatedAt }) => {
      const oldTask = oldTasks.find(
        ({ notionId: oldNotionId }) => notionId === oldNotionId
      );
      return oldTask && oldTask.updatedAt.toISOString() !== updatedAt.toISOString();
    });
    return { newTasks, updatedTasks };
  };

  getIssue = async (notionId) => {
    const result = await collection?.findOne({ notionId }).exec();
    return result?.issueNo;
  };

  update = async ({ notionId, updatedAt }) => {
    await collection?.findOneAndUpdate({ notionId }, { updatedAt });
  };
}

module.exports = new Mongo();
