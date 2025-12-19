import express from "express";
import taskController from "../controllers/tasks.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { upload } from "../utils/file-upload.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", upload.array("attachments", 5), taskController.createTask);
router.get("/", taskController.getAllTasks);
router.get("/:id", taskController.getTaskById);
router.put("/:id", upload.array("attachments", 5), taskController.updateTask);
router.patch("/:id/status", taskController.updateTaskStatus);
router.patch("/:id/assign", taskController.assignTask);
router.delete("/:id", taskController.deleteTask);

export default router;
