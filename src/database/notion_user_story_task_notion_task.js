class NotionUserStoryTaskNotionTaskDatabase {
  constructor(collection) {
    this.collection = collection;
  }

  create = async ({
    userStoryTaskId,
    todoTaskId,
    userStoryTaskCreatedAt,
    userStoryTaskUpdatedAt,
    todoTaskCreatedAt,
    todoTaskUpdatedAt,
  }) => {
    console.log({
      userStoryTaskId,
      todoTaskId,
      userStoryTaskCreatedAt,
      userStoryTaskUpdatedAt,
      todoTaskCreatedAt,
      todoTaskUpdatedAt,
    });
    this.collection({
      userStoryTaskId,
      todoTaskId,
      userStoryTaskCreatedAt,
      userStoryTaskUpdatedAt,
      todoTaskCreatedAt,
      todoTaskUpdatedAt,
    }).save();
  };

  detect = async (userStoryTasks, todoTasks) => {
    const userStoryTasksIds = userStoryTasks.map(
      ({ userStoryTaskId }) => userStoryTaskId
    );
    const oldTasks =
      (await this.collection.find({
        userStoryTaskId: { $in: userStoryTasksIds },
      })) || [];

    const dbIds = oldTasks.map(({ userStoryTaskId }) => userStoryTaskId);
    const newTasks = userStoryTasks.filter(
      ({ userStoryTaskId }) => !dbIds.includes(userStoryTaskId)
    );

    const updatedUserStoryTasks = userStoryTasks.filter(
      ({ userStoryTaskId, updatedAt }) => {
        const oldTask = oldTasks.find(
          ({ userStoryTaskId: oldUserStoryTaskId }) =>
            userStoryTaskId === oldUserStoryTaskId
        );
        return (
          oldTask &&
          oldTask.userStoryTaskUpdatedAt.toISOString() !==
            updatedAt.toISOString()
        );
      }
    );

    const updatedTodoTasks = todoTasks.filter(({ id, last_edited_time: updatedAt }) => {
      const oldTask = oldTasks.find(
        ({ todoTaskId }) => id === todoTaskId
      );
      return (
        oldTask &&
        oldTask.todoTaskUpdatedAt.toISOString() !== updatedAt
      );
    });

    return { newTasks, updatedUserStoryTasks, updatedTodoTasks };
  };

  getTodoTaskId = async (userStoryTaskId) => {
    const result = await this.collection.findOne({ userStoryTaskId }).exec();
    return result?.todoTaskId;
  };

  getUserStoryTaskId = async (todoTaskId) => {
    const result = await this.collection.findOne({ todoTaskId }).exec();
    return result?.userStoryTaskId;
  };

  update = async (userStoryTaskId, updateProps) => {
    await this.collection.findOneAndUpdate({ userStoryTaskId }, updateProps);
  };
}

module.exports = NotionUserStoryTaskNotionTaskDatabase;
