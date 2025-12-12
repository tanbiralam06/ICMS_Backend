import express from "express";
import authenticate from "../middlewares/auth.middleware.js";
import { getComments, addComment } from "../controllers/comments.controller.js";

const router = express.Router();

router.get("/:taskId", authenticate, getComments);
router.post("/", authenticate, addComment);

export default router;
