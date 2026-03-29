import Task from "../models/tasks.model.js";
import User from "../models/users.model.js";
import emailService from "./email.service.js";

const validateActiveUsers = async (userIds) => {
  if (!userIds || userIds.length === 0) return;

  const users = await User.find({ _id: { $in: userIds } });
  const inactiveUsers = users.filter((user) => user.status === "inactive");

  if (inactiveUsers.length > 0) {
    const inactiveNames = inactiveUsers.map((u) => u.fullName).join(", ");
    throw {
      statusCode: 400,
      message: `Cannot assign task to inactive active users: ${inactiveNames}`,
    };
  }
};

export const createTask = async (userId, data) => {
  if (data.assignedUsers) {
    await validateActiveUsers(data.assignedUsers);
  }

  const task = new Task({
    ...data,
    createdBy: userId,
  });
  const savedTask = await task.save();

  // Notify assigned users
  if (data.assignedUsers && data.assignedUsers.length > 0) {
    const creator = await User.findById(userId);
    const assignedUsers = await User.find({ _id: { $in: data.assignedUsers } }, "fullName email");
    
    emailService.notifyTaskAssignment(assignedUsers, {
        fullName: 'Team Member', // Handled by service now
        taskTitle: data.title,
        priority: data.priority,
        dueDate: data.dueDate,
        createdBy: creator.fullName,
        taskId: savedTask._id
    }).catch(err => console.error("Email notification failed:", err));
  }

  return savedTask;
};

export const getAllTasks = async (query) => {
  const {
    page = 1,
    limit = 25,
    status,
    priority,
    assignedTo,
    createdBy,
  } = query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedUsers = assignedTo;
  if (createdBy) filter.createdBy = createdBy;

  const tasks = await Task.find(filter)
    .populate("assignedUsers", "fullName email")
    .populate("createdBy", "fullName")
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Task.countDocuments(filter);

  return {
    tasks,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
  };
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

export const updateTask = async (id, data, user) => {
  if (data.assignedUsers) {
    await validateActiveUsers(data.assignedUsers);
  }

  const taskToCheck = await Task.findById(id).populate("createdBy", "_id");

  if (!taskToCheck) {
    throw { statusCode: 404, message: "Task not found" };
  }

  // Permission check: Allow Admin or Creator
  const isAdmin = user.roles && user.roles.includes("Admin");
  const isCreator = taskToCheck.createdBy._id.toString() === user.id;

  if (!isAdmin && !isCreator) {
    throw {
      statusCode: 403,
      message: "You don't have permission to update this task details",
    };
  }

  const task = await Task.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate("assignedUsers", "fullName email")
    .populate("createdBy", "fullName");

  // Note: timestamps (updatedAt) are handled automatically by mongoose { timestamps: true } option in model
  return task;
};

export const updateTaskStatus = async (id, status, user) => {
  const task = await Task.findById(id)
    .populate("assignedUsers", "_id")
    .populate("createdBy", "_id");

  if (!task) {
    throw { statusCode: 404, message: "Task not found" };
  }

  // Permission check: Allow Admin, Creator, or Assigned Users
  const isAdmin = user.roles && user.roles.includes("Admin");
  const isCreator = task.createdBy._id.toString() === user.id;
  const isAssignedUser = task.assignedUsers.some(
    (assignedUser) => assignedUser._id.toString() === user.id,
  );

  if (!isAdmin && !isCreator && !isAssignedUser) {
    throw {
      statusCode: 403,
      message: "You don't have permission to update this task",
    };
  }

  // Update the status
  const oldStatus = task.status;
  task.status = status;
  await task.save();

  // Notify creator if task is completed
  if (status === "Completed" && oldStatus !== "Completed") {
    const creator = await User.findById(task.createdBy);
    if (creator && creator.email) {
        emailService.notifyTaskStatusUpdate(creator.email, {
            creatorName: creator.fullName,
            taskTitle: task.title,
            status: status,
            updatedBy: user.fullName
        }).catch(err => console.error("Email notification failed:", err));
    }
  }

  return task;
};

export const assignTask = async (id, userIds) => {
  await validateActiveUsers(userIds);

  const task = await Task.findByIdAndUpdate(
    id,
    { assignedUsers: userIds },
    { new: true },
  ).populate("assignedUsers", "fullName email");

  if (!task) {
    throw { statusCode: 404, message: "Task not found" };
  }

  // Notify newly assigned users
  emailService.notifyTaskAssignment(task.assignedUsers, {
      fullName: 'Team Member', // Handled by service now
      taskTitle: task.title,
      priority: task.priority,
      dueDate: task.dueDate,
      createdBy: 'Your Manager', 
      taskId: task._id
  }).catch(err => console.error("Email notification failed:", err));

  return task;
};

export const deleteTask = async (id, user) => {
  const task = await Task.findById(id).populate("createdBy", "_id");

  if (!task) {
    throw { statusCode: 404, message: "Task not found" };
  }

  // Permission check: Allow Admin or Creator
  const isAdmin = user.roles && user.roles.includes("Admin");
  const isCreator = task.createdBy._id.toString() === user.id;

  if (!isAdmin && !isCreator) {
    throw {
      statusCode: 403,
      message: "You don't have permission to delete this task",
    };
  }

  await Task.findByIdAndDelete(id);
  return { message: "Task deleted successfully" };
};

export default {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  assignTask,
  deleteTask,
};
