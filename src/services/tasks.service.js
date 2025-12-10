import Task from '../models/tasks.model.js';

export const createTask = async (userId, data) => {
  const task = new Task({
    ...data,
    createdBy: userId,
  });
  return await task.save();
};

export const getAllTasks = async (query) => {
  const { page = 1, limit = 25, status, priority, assignedTo } = query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedUsers = assignedTo;

  const tasks = await Task.find(filter)
    .populate("assignedUsers", "fullName email")
    .populate("createdBy", "fullName")
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Task.countDocuments(filter);

  return { tasks, total, page: parseInt(page), pages: Math.ceil(total / limit) };
};

export const getTaskById = async (id) => {
  const task = await Task.findById(id)
    .populate("assignedUsers", "fullName email")
    .populate("createdBy", "fullName");
  if (!task) {
    throw { statusCode: 404, message: "Task not found" };
  }
  return task;
};

export const updateTask = async (id, data) => {
  const task = await Task.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!task) {
    throw { statusCode: 404, message: "Task not found" };
  }
  return task;
};

export const updateTaskStatus = async (id, status) => {
  const task = await Task.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
  if (!task) {
    throw { statusCode: 404, message: "Task not found" };
  }
  return task;
};

export const assignTask = async (id, userIds) => {
  const task = await Task.findByIdAndUpdate(
    id,
    { assignedUsers: userIds },
    { new: true }
  ).populate("assignedUsers", "fullName email");
  
  if (!task) {
    throw { statusCode: 404, message: "Task not found" };
  }
  return task;
};

export default {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  assignTask,
};
