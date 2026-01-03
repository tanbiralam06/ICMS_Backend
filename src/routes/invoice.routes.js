import express from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
} from "../controllers/invoice.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// Create: Admin or Manager
router.post("/", roleMiddleware(["Admin", "Manager"]), createInvoice);

// List/View: Any auth user (or restrict if needed)
router.get("/", getInvoices);
router.get("/:id", getInvoiceById);

export default router;
