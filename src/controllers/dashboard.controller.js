import dashboardService from "../services/dashboard.service.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

export default {
  getDashboardStats,
};
