import User from "../models/users.model.js";
import Leave from "../models/leaves.model.js";
import Attendance from "../models/attendance.model.js";
import Task from "../models/tasks.model.js";

export const createUser = async (data) => {
  const existingUser = await User.findOne({
    $or: [{ email: data.email }, { employeeId: data.employeeId }],
  });
  if (existingUser) {
    throw { statusCode: 400, message: "Email or Employee ID already exists" };
  }

  const user = new User(data);
  return await user.save();
};

export const getAllUsers = async (query) => {
  const { page = 1, limit = 25, search, departmentId, role } = query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { employeeId: { $regex: search, $options: "i" } },
    ];
  }
  if (departmentId) {
    filter.departmentId = departmentId;
  }
  if (role) {
    filter.roleIds = role;
  }

  const users = await User.find(filter)
    .select("-passwordHash -refreshToken")
    .populate("departmentId", "name")
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(filter);

  return {
    users,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
  };
};

export const getUserById = async (id) => {
  const user = await User.findById(id)
    .select("-passwordHash -refreshToken")
    .populate("departmentId", "name");
  if (!user) {
    throw { statusCode: 404, message: "User not found" };
  }
  return user;
};

export const updateUser = async (id, data) => {
  delete data.passwordHash;
  delete data.refreshToken;

  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).select("-passwordHash -refreshToken");

  if (!user) {
    throw { statusCode: 404, message: "User not found" };
  }
  return user;
};

export const updateUserStatus = async (id, status) => {
  const user = await User.findByIdAndUpdate(
    id,
    { status },
    { new: true },
  ).select("-passwordHash -refreshToken");

  if (!user) {
    throw { statusCode: 404, message: "User not found" };
  }
  return user;
};

export const getUserDetailsById = async (id) => {
  // Fetch user basic information
  const user = await User.findById(id)
    .select("-passwordHash -refreshToken")
    .populate("departmentId", "name");

  if (!user) {
    throw { statusCode: 404, message: "User not found" };
  }

  // Fetch user's leave applications
  const leaves = await Leave.find({ userId: id })
    .populate("approverId", "fullName")
    .sort({ createdAt: -1 })
    .limit(50); // Limit to recent 50 leaves

  // Fetch user's attendance records
  const attendance = await Attendance.find({ userId: id })
    .sort({ date: -1 })
    .limit(50); // Limit to recent 50 attendance records

  // Fetch user's assigned tasks
  const tasks = await Task.find({ assignedUsers: id })
    .populate("createdBy", "fullName")
    .populate("projectId", "name")
    .sort({ createdAt: -1 })
    .limit(50); // Limit to recent 50 tasks

  // Calculate attendance statistics
  const attendanceStats = {
    totalPresent: await Attendance.countDocuments({
      userId: id,
      status: "Present",
    }),
    totalAbsent: await Attendance.countDocuments({
      userId: id,
      status: "Absent",
    }),
    totalHalfDay: await Attendance.countDocuments({
      userId: id,
      status: "Half-day",
    }),
  };

  // Calculate leave statistics
  const leaveStats = {
    totalLeaves: await Leave.countDocuments({ userId: id }),
    approvedLeaves: await Leave.countDocuments({
      userId: id,
      status: "Approved",
    }),
    pendingLeaves: await Leave.countDocuments({
      userId: id,
      status: "Pending",
    }),
    rejectedLeaves: await Leave.countDocuments({
      userId: id,
      status: "Rejected",
    }),
  };

  // Calculate task statistics
  const taskStats = {
    totalTasks: tasks.length,
    todoTasks: tasks.filter((t) => t.status === "Todo").length,
    inProgressTasks: tasks.filter((t) => t.status === "In Progress").length,
    reviewTasks: tasks.filter((t) => t.status === "Review").length,
    doneTasks: tasks.filter((t) => t.status === "Done").length,
  };

  return {
    user,
    leaves,
    attendance,
    tasks,
    stats: {
      attendance: attendanceStats,
      leave: leaveStats,
      task: taskStats,
    },
  };
};

export default {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  getUserDetailsById,
};
