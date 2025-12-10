import User from "../models/users.model.js";
import Leave from "../models/leaves.model.js";
import Attendance from "../models/attendance.model.js";
import Task from "../models/tasks.model.js";

export const getDashboardStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get last 7 days for attendance trend
  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 6);

  // Basic counts
  const totalUsers = await User.countDocuments({ status: "active" });
  const presentToday = await Attendance.countDocuments({
    date: { $gte: today, $lt: tomorrow },
    status: "Present",
  });
  const pendingLeaves = await Leave.countDocuments({ status: "Pending" });
  const activeTasks = await Task.countDocuments({
    status: { $in: ["Todo", "In Progress", "Review"] },
  });

  // Attendance trend (last 7 days)
  const attendanceTrend = await Attendance.aggregate([
    {
      $match: {
        date: { $gte: last7Days, $lt: tomorrow },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$date" },
        },
        present: {
          $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] },
        },
        absent: {
          $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Leave distribution by status
  const leaveDistribution = await Leave.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Task distribution by status
  const taskDistribution = await Task.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Department distribution
  const departmentDistribution = await User.aggregate([
    {
      $match: { status: "active" },
    },
    {
      $group: {
        _id: "$departmentId",
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "departments",
        localField: "_id",
        foreignField: "_id",
        as: "department",
      },
    },
    {
      $unwind: { path: "$department", preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        name: { $ifNull: ["$department.name", "Unassigned"] },
        count: 1,
      },
    },
  ]);

  // Recent leave requests (last 5)
  const recentLeaves = await Leave.find()
    .populate("userId", "fullName")
    .sort({ createdAt: -1 })
    .limit(5);

  // Upcoming tasks (due soon)
  const upcomingTasks = await Task.find({
    status: { $in: ["Todo", "In Progress"] },
    dueDate: { $gte: today },
  })
    .populate("assignedUsers", "fullName")
    .sort({ dueDate: 1 })
    .limit(5);

  // Today's attendance summary
  const todayAttendance = await Attendance.find({
    date: { $gte: today, $lt: tomorrow },
  })
    .populate("userId", "fullName employeeId")
    .limit(10);

  return {
    overview: {
      totalUsers,
      presentToday,
      pendingLeaves,
      activeTasks,
      attendancePercentage:
        totalUsers > 0 ? Math.round((presentToday / totalUsers) * 100) : 0,
    },
    charts: {
      attendanceTrend: attendanceTrend.map((item) => ({
        date: item._id,
        present: item.present,
        absent: item.absent,
      })),
      leaveDistribution: leaveDistribution.map((item) => ({
        status: item._id,
        count: item.count,
      })),
      taskDistribution: taskDistribution.map((item) => ({
        status: item._id,
        count: item.count,
      })),
      departmentDistribution: departmentDistribution.map((item) => ({
        name: item.name,
        count: item.count,
      })),
    },
    recent: {
      leaves: recentLeaves,
      tasks: upcomingTasks,
      attendance: todayAttendance,
    },
  };
};

export default {
  getDashboardStats,
};
