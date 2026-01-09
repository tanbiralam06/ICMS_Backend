import attendanceService from "../services/attendance.service.js";

export const punch = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;

    // Check if coordinates are provided
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Location access is required to mark attendance.",
      });
    }

    // Check distance if office coordinates are set
    if (process.env.OFFICE_LAT && process.env.OFFICE_LNG) {
      // Dynamic import to avoid issues if file doesn't exist yet,
      // effectively treating it as a new dependency.
      const { calculateDistance } = await import("../utils/geoUtils.js");

      const officeLat = parseFloat(process.env.OFFICE_LAT);
      const officeLng = parseFloat(process.env.OFFICE_LNG);
      const allowedRadius = parseFloat(process.env.OFFICE_RADIUS_METERS || 50);

      console.log("--- Geolocation Debug ---");
      // console.log(`Received: Lat ${latitude}, Lng ${longitude}`);
      // console.log(`Expected: Lat ${officeLat}, Lng ${officeLng}`);

      const distance = calculateDistance(
        latitude,
        longitude,
        officeLat,
        officeLng,
      );
      // console.log(`Calculated Distance: ${distance} meters`);

      if (distance > allowedRadius) {
        return res.status(400).json({
          success: false,
          message: `You are not at the office. You are ${Math.round(distance)}m away. Allowed radius: ${allowedRadius}m.`,
        });
      }
    }

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
