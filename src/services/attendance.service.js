import Attendance from "../models/attendance.model.js";
import User from "../models/users.model.js";
import Leave from "../models/leaves.model.js";
import Holiday from "../models/holidays.model.js";

const getTodayStart = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

export const punch = async (userId) => {
  const today = getTodayStart();

  let attendance = await Attendance.findOne({ userId, date: today });

  if (!attendance) {
    const user = await User.findById(userId);
    attendance = new Attendance({
      userId,
      employeeId: user.employeeId,
      date: today,
      punchIn: new Date(),
      status: "Present",
    });
    await attendance.save();
    return { type: "Punch In", data: attendance };
  } else {
    attendance.punchOut = new Date();

    const diffMs = attendance.punchOut - attendance.punchIn;
    const diffHrs = diffMs / (1000 * 60 * 60);
    attendance.totalHours = parseFloat(diffHrs.toFixed(2));

    await attendance.save();
    return { type: "Punch Out", data: attendance };
  }
};

export const getTodayAttendance = async (userId) => {
  const today = getTodayStart();
  return await Attendance.findOne({ userId, date: today });
};

export const getMonthlyReport = async (userId, month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  return await Attendance.find({
    userId,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1 });
};

export const getDailyAttendance = async (dateStr) => {
  const date = new Date(dateStr);
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // 1. Get all active users
  const users = await User.find({ status: "active" })
    .select("fullName employeeId profilePicture")
    .lean();

  // 2. Get attendance records for the date
  const attendanceRecords = await Attendance.find({
    date: startOfDay,
  }).lean();

  // 3. Get approved leaves for the date
  // 3. Get approved leaves for the date
  const leaveRecords = await Leave.find({
    status: "Approved",
    fromDate: { $lte: endOfDay },
    toDate: { $gte: startOfDay },
  }).lean();

  // 3.5. Check for Holiday or Sunday
  // We check if the query date matches any holiday record
  const holiday = await Holiday.findOne({
    date: startOfDay,
  }).lean();

  const isSunday = date.getDay() === 0;

  // 4. Merge data
  const result = users.map((user) => {
    // Check attendance
    const attendance = attendanceRecords.find(
      (a) => a.userId.toString() === user._id.toString(),
    );

    // Check leave
    const leave = leaveRecords.find(
      (l) => l.userId.toString() === user._id.toString(),
    );

    let status = "Absent";
    let punchIn = null;
    let punchOut = null;
    let totalHours = 0;

    if (attendance) {
      status = attendance.status;
      punchIn = attendance.punchIn;
      punchOut = attendance.punchOut;
      totalHours = attendance.totalHours;
    } else if (leave) {
      status = "On Leave"; // Or specific leave type like "Sick Leave"
    } else if (holiday) {
      status = "Holiday";
    } else if (isSunday) {
      status = "Weekly Off";
    }

    return {
      userId: user._id,
      name: user.fullName,
      employeeId: user.employeeId,
      profilePicture: user.profilePicture,
      status,
      leaveType: leave ? leave.type : null,
      punchIn,
      punchOut,
      totalHours,
      holidayName: holiday ? holiday.name : null,
    };
  });

  return result;
};

export default {
  punch,
  getTodayAttendance,
  getMonthlyReport,
  getDailyAttendance,
};
