import express from "express";
import dashboardController from "../controllers/dashboard.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/stats", dashboardController.getDashboardStats);

export default router;
