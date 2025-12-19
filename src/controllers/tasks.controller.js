import taskService from "../services/tasks.service.js";

export const createTask = async (req, res, next) => {
  try {
    const taskData = { ...req.body };
    if (req.files && req.files.length > 0) {
      taskData.attachments = req.files.map((file) =>
        file.path.replace(/\\/g, "/"),
      );
    }
    const task = await taskService.createTask(req.user.id, taskData);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

export const getAllTasks = async (req, res, next) => {
  try {
    const result = await taskService.getAllTasks(req.query);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const taskData = { ...req.body };
    if (req.files && req.files.length > 0) {
      taskData.attachments = req.files.map((file) =>
        file.path.replace(/\\/g, "/"),
      );
    }

    const task = await taskService.updateTask(
      req.params.id,
      taskData,
      req.user,
    );
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const task = await taskService.updateTaskStatus(
      req.params.id,
      status,
      req.user,
    );
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

export const assignTask = async (req, res, next) => {
  try {
    const { assignedUsers } = req.body;
    const task = await taskService.assignTask(req.params.id, assignedUsers);
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.id, req.user);
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    next(err);
  }
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
