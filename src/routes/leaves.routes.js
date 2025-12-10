import express from 'express';
import leaveController from '../controllers/leaves.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post("/", leaveController.applyLeave);
router.get("/me", leaveController.getMyLeaves);
router.get("/balance", leaveController.getLeaveBalance);

// Approval routes (Admin/HR/Manager)
router.get("/pending", roleMiddleware(["Admin", "HR", "Manager"]), leaveController.getLeavesForApproval);
router.patch("/:id/approve", roleMiddleware(["Admin", "HR", "Manager"]), leaveController.approveLeave);
router.patch("/:id/reject", roleMiddleware(["Admin", "HR", "Manager"]), leaveController.rejectLeave);

export default router;
