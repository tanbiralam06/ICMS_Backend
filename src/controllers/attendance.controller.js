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

    // Detect device type from User-Agent
    const userAgent = req.headers["user-agent"] || "";
    const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
    const deviceType = isMobile ? "Mobile" : "Computer";

    // Geolocation validation
    const { calculateDistance } = await import("../utils/geoUtils.js");
    const CompanyProfile = (await import("../models/company.model.js")).default;

    // Try to get locations from database first
    const companyProfile = await CompanyProfile.findOne();
    const dbLocations = companyProfile?.officeLocations || [];

    let isWithinRange = false;
    let nearestLocationName = "Office";
    let nearestDistance = Infinity;

    if (dbLocations.length > 0) {
      // Check against all configured locations in DB
      for (const loc of dbLocations) {
        const distance = calculateDistance(
          latitude,
          longitude,
          loc.latitude,
          loc.longitude,
        );
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestLocationName = loc.name || "Office";
        }
        if (distance <= (loc.radiusMeters || 50)) {
          isWithinRange = true;
          break;
        }
      }

      console.log("--- Geolocation Debug ---");
      console.log(`Received: Lat ${latitude}, Lng ${longitude}`);
      console.log(`Checked ${dbLocations.length} location(s) from database`);
      console.log(`Nearest: ${nearestLocationName} at ${Math.round(nearestDistance)}m`);

      if (!isWithinRange) {
        const allowedRadius = dbLocations.find(
          (l) => l.name === nearestLocationName
        )?.radiusMeters || 50;
        return res.status(400).json({
          success: false,
          message: `You are not at any registered office. Nearest: ${nearestLocationName} (${Math.round(nearestDistance)}m away). Allowed radius: ${allowedRadius}m.`,
        });
      }
    } else if (process.env.OFFICE_LAT && process.env.OFFICE_LNG) {
      // Fallback to .env if no DB locations configured
      const officeLat = parseFloat(process.env.OFFICE_LAT);
      const officeLng = parseFloat(process.env.OFFICE_LNG);
      const allowedRadius = parseFloat(process.env.OFFICE_RADIUS_METERS || 50);

      console.log("--- Geolocation Debug (Fallback to .env) ---");
      console.log(`Received: Lat ${latitude}, Lng ${longitude}`);
      console.log(`Expected: Lat ${officeLat}, Lng ${officeLng}`);

      const distance = calculateDistance(latitude, longitude, officeLat, officeLng);

      if (distance > allowedRadius) {
        return res.status(400).json({
          success: false,
          message: `You are not at the office. You are ${Math.round(distance)}m away. Allowed radius: ${allowedRadius}m.`,
        });
      }
    }
    // If no locations in DB and no .env, allow punch (no geo-restriction)

    const result = await attendanceService.punch(req.user.id, deviceType, nearestLocationName);
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
