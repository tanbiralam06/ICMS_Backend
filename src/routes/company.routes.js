import express from "express";
import {
  getCompanyProfile,
  upsertCompanyProfile,
} from "../controllers/company.controller.js";
import { uploadCompanyFiles } from "../middlewares/upload.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getCompanyProfile); // Any auth user can view
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Admin"]),
  uploadCompanyFiles,
  upsertCompanyProfile,
); // Only admin update

export default router;
