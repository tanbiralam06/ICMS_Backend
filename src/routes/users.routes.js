import express from "express";
import userController from "../controllers/users.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// Get own profile
router.get("/me", userController.getMe);
router.patch("/me", userController.updateProfile);

// Get user directory for dropdowns (any authenticated user)
router.get("/directory", userController.getDirectory);

// Admin/HR routes
router.post("/", roleMiddleware(["Admin", "HR"]), userController.createUser);
router.get(
  "/",
  roleMiddleware(["Admin", "HR", "Manager", "Accountant"]),
  userController.getAllUsers,
);
router.get(
  "/:id/details",
  roleMiddleware(["Admin", "HR", "Manager", "Accountant"]),
  userController.getUserDetails,
);
router.get(
  "/:id",
  roleMiddleware(["Admin", "HR", "Manager", "Accountant"]),
  userController.getUserById,
);
router.put("/:id", roleMiddleware(["Admin", "HR"]), userController.updateUser);
router.patch(
  "/:id/status",
  roleMiddleware(["Admin", "HR"]),
  userController.updateUserStatus,
);

export default router;
