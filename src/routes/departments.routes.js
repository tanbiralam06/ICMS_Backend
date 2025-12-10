import express from 'express';
import departmentController from '../controllers/departments.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

router.post("/", roleMiddleware(["Admin"]), departmentController.createDepartment);
router.get("/", departmentController.getAllDepartments);
router.get("/:id", departmentController.getDepartmentById);
router.put("/:id", roleMiddleware(["Admin"]), departmentController.updateDepartment);
router.delete("/:id", roleMiddleware(["Admin"]), departmentController.deleteDepartment);

export default router;
