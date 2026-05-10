import * as documentService from "../services/document.service.js";

/**
 * GET /api/documents/upload-url
 * Returns a presigned PUT URL for direct upload to R2.
 */
export const getUploadUrl = async (req, res) => {
  try {
    const { fileName, fileType, category, path } = req.query;

    if (!fileName || !fileType) {
      return res
        .status(400)
        .json({ message: "fileName and fileType are required" });
    }

    const result = await documentService.getUploadUrl(
      fileName,
      fileType,
      category,
      path,
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getUploadUrl:", error);
    res
      .status(500)
      .json({ message: "Error generating upload URL", error: error.message });
  }
};

/**
 * POST /api/documents/confirm
 * Confirms a successful upload and saves metadata.
 */
export const confirmUpload = async (req, res) => {
  try {
    const doc = await documentService.confirmUpload(req.body, req.user.id);
    res.status(201).json(doc);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error confirming upload", error: error.message });
  }
};

/**
 * GET /api/documents
 * Lists documents with filters and pagination.
 */
export const listDocuments = async (req, res) => {
  try {
    const result = await documentService.listDocuments(req.query);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching documents", error: error.message });
  }
};

/**
 * GET /api/documents/:id
 * Gets a single document's metadata and logs a VIEW.
 */
export const getDocumentById = async (req, res) => {
  try {
    const doc = await documentService.getDocumentById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Log the view
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    await documentService.logView(req.params.id, req.user.id, ip);

    res.status(200).json(doc);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching document", error: error.message });
  }
};

/**
 * GET /api/documents/:id/download
 * Returns a presigned GET URL for download and logs it.
 */
export const downloadDocument = async (req, res) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const result = await documentService.getDownloadUrl(
      req.params.id,
      req.user.id,
      ip,
    );
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error generating download URL", error: error.message });
  }
};

/**
 * GET /api/documents/:id/logs (Admin Only)
 * Returns the audit trail for a document.
 */
export const getDocumentLogs = async (req, res) => {
  try {
    const result = await documentService.getDocumentLogs(
      req.params.id,
      req.query,
    );
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching document logs", error: error.message });
  }
};

/**
 * DELETE /api/documents/:id
 * Soft-deletes a document (removes from R2 too).
 */
export const deleteDocument = async (req, res) => {
  try {
    const doc = await documentService.deleteDocument(req.params.id);
    res.status(200).json({ message: "Document deleted", document: doc });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting document", error: error.message });
  }
};
