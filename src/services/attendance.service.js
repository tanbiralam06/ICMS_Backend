import Attendance from '../models/attendance.model.js';
import User from '../models/users.model.js';

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

export default {
  punch,
  getTodayAttendance,
  getMonthlyReport,
};
