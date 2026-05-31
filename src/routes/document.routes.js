import express from "express";
import {
  getUploadUrl,
  confirmUpload,
  listDocuments,
  getDocumentById,
  downloadDocument,
  getDocumentLogs,
  deleteDocument,
  checkUrl,
} from "../controllers/document.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get a presigned upload URL
router.get("/upload-url", getUploadUrl);

// Check if a URL already exists
router.get("/check-url", checkUrl);

// Confirm upload and save metadata
router.post("/confirm", confirmUpload);

// List all documents (with filters & pagination)
router.get("/", listDocuments);

// Get single document details (also logs a VIEW)
router.get("/:id", getDocumentById);

// Get presigned download URL (logs a DOWNLOAD)
router.get("/:id/download", downloadDocument);

// Get audit logs for a document (Admin only)
router.get(
  "/:id/logs",
  roleMiddleware(["Admin"]),
  getDocumentLogs,
);

// Delete a document (Admin only)
router.delete(
  "/:id",
  roleMiddleware(["Admin"]),
  deleteDocument,
);

export default router;
