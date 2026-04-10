import express from "express";
import {
  receiveItem,
  getInventoryList,
  utilizeItem,
  getItemHistory,
  getGlobalUtilizationHistory,
} from "../controllers/inventory.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// All authenticated users can view, EXCEPT Accountants (as per user request)
// Note: We check roles in the frontend sidebar, and here we could also restrict if needed.
// However, the user said "All authenticate user can cee it expact Accounts role".
// We will use roleMiddleware to enforce this on the backend too.

// List all (Excluding Accountant)
router.get("/", roleMiddleware(["Admin", "HR", "Manager", "Employee"]), getInventoryList);

// Global Utilization History
router.get("/all-utilization", roleMiddleware(["Admin", "HR", "Manager", "Employee"]), getGlobalUtilizationHistory);

// Specific Item History
router.get("/history/:uniqueId", roleMiddleware(["Admin", "HR", "Manager", "Employee"]), getItemHistory);

// Receive & Utilize (Usually restricted to Admin/Manager/HR)
router.post("/receive", roleMiddleware(["Admin", "Manager", "HR"]), receiveItem);
router.post("/utilize", roleMiddleware(["Admin", "Manager", "HR", "Employee"]), utilizeItem);

export default router;
