import express from "express";
import attendanceController from "../controllers/attendance.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/punch", attendanceController.punch);
router.get("/me/today", attendanceController.getTodayAttendance);
router.get("/:employeeId/monthly", attendanceController.getMonthlyReport);
router.get("/daily", attendanceController.getDailyAttendance);

export default router;
