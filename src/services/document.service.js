import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import s3Client from "../config/s3.config.js";
import config from "../config/index.js";
import Document from "../models/document.model.js";
import DocumentLog from "../models/documentLog.model.js";

const BUCKET = config.r2.bucketName;

/**
 * Generate a presigned PUT URL for direct client-to-R2 upload.
 */
export const getUploadUrl = async (fileName, fileType, category) => {
  const ext = fileName.split(".").pop();
  const key = `documents/${category || "Other"}/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 }); // 10 min

  return { uploadUrl, key };
};

/**
 * Confirm upload by verifying the object exists in R2 and saving metadata in DB.
 */
export const confirmUpload = async (docData, userId) => {
  // Optional: verify the object actually landed in R2
  try {
    await s3Client.send(
      new HeadObjectCommand({ Bucket: BUCKET, Key: docData.key }),
    );
  } catch {
    throw new Error("File not found in storage. Upload may have failed.");
  }

  const doc = new Document({
    title: docData.title,
    originalName: docData.originalName,
    mimeType: docData.mimeType,
    size: docData.size,
    key: docData.key,
    category: docData.category || "Other",
    tags: docData.tags || [],
    metadata: docData.metadata || {},
    uploadedBy: userId,
  });

  await doc.save();
  return doc;
};

/**
 * List documents with optional filters and pagination.
 */
export const listDocuments = async (query) => {
  const { category, search, page = 1, limit = 25, status = "active" } = query;

  const filter = { status };

  if (category) filter.category = category;

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { originalName: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [documents, total] = await Promise.all([
    Document.find(filter)
      .populate("uploadedBy", "fullName email employeeId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Document.countDocuments(filter),
  ]);

  return {
    documents,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single document by ID.
 */
export const getDocumentById = async (id) => {
  const doc = await Document.findById(id).populate(
    "uploadedBy",
    "fullName email employeeId",
  );
  if (!doc || doc.status === "deleted") return null;
  return doc;
};

/**
 * Generate a presigned GET URL for secure download and log the action.
 */
export const getDownloadUrl = async (docId, userId, ipAddress) => {
  const doc = await Document.findById(docId);
  if (!doc || doc.status === "deleted") {
    throw new Error("Document not found");
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: doc.key,
    ResponseContentDisposition: `attachment; filename="${doc.originalName}"`,
  });

  const downloadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 300,
  }); // 5 min

  // Log the download
  await DocumentLog.create({
    documentId: docId,
    userId,
    action: "DOWNLOAD",
    ipAddress,
  });

  return { downloadUrl, document: doc };
};

/**
 * Log a VIEW event (when someone opens/previews a document).
 */
export const logView = async (docId, userId, ipAddress) => {
  await DocumentLog.create({
    documentId: docId,
    userId,
    action: "VIEW",
    ipAddress,
  });
};

/**
 * Get audit logs for a document (Admin only).
 */
export const getDocumentLogs = async (docId, query) => {
  const { page = 1, limit = 25 } = query;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    DocumentLog.find({ documentId: docId })
      .populate("userId", "fullName email employeeId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    DocumentLog.countDocuments({ documentId: docId }),
  ]);

  return {
    logs,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Soft-delete a document (also removes from R2).
 */
export const deleteDocument = async (docId) => {
  const doc = await Document.findById(docId);
  if (!doc) throw new Error("Document not found");

  // Remove from R2
  try {
    await s3Client.send(
      new DeleteObjectCommand({ Bucket: BUCKET, Key: doc.key }),
    );
  } catch (err) {
    console.error("R2 delete failed (proceeding with DB update):", err.message);
  }

  doc.status = "deleted";
  await doc.save();

  return doc;
};
