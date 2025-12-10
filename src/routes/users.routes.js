import express from 'express';
import userController from '../controllers/users.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(authMiddleware);

// Get own profile
router.get("/me", userController.getMe);

// Admin/HR routes
router.post("/", roleMiddleware(["Admin", "HR"]), userController.createUser);
router.get("/", roleMiddleware(["Admin", "HR", "Manager"]), userController.getAllUsers); 
router.get("/:id", roleMiddleware(["Admin", "HR", "Manager"]), userController.getUserById);
router.put("/:id", roleMiddleware(["Admin", "HR"]), userController.updateUser);
router.patch("/:id/status", roleMiddleware(["Admin", "HR"]), userController.updateUserStatus);

export default router;
