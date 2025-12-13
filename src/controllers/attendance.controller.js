import attendanceService from "../services/attendance.service.js";

export const punch = async (req, res, next) => {
  try {
    const result = await attendanceService.punch(req.user.id);
    res.json({
      success: true,
      message: result.type + " Successful",
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

export const getTodayAttendance = async (req, res, next) => {
  try {
    const attendance = await attendanceService.getTodayAttendance(req.user.id);
    res.json({ success: true, data: attendance });
  } catch (err) {
    next(err);
  }
};

export const getMonthlyReport = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    let targetUserId = req.user.id;

    if (req.params.employeeId && req.params.employeeId !== "me") {
      targetUserId = req.params.employeeId;
    }

    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ message: "Month and Year are required" });
    }

    const report = await attendanceService.getMonthlyReport(
      targetUserId,
      month,
      year,
    );
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

export const getDailyAttendance = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }
    const data = await attendanceService.getDailyAttendance(date);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default {
  punch,
  getTodayAttendance,
  getMonthlyReport,
  getDailyAttendance,
};
