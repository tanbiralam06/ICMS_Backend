import Invoice from "../models/invoice.model.js";
import CompanyProfile from "../models/company.model.js";

// Helper to generate next invoice number
// Format: YYYY-YY-XXXX (e.g., 2025-26-0001)
const generateInvoiceNumber = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const nextYear = (year + 1).toString().slice(-2);
  const financialYear = `${year}-${nextYear}`; // 2025-26

  const prefix = `${year}-${nextYear}-`;

  // Find last invoice created with this prefix
  const lastInvoice = await Invoice.findOne({
    invoiceNo: new RegExp(`^${prefix}`),
  }).sort({ createdAt: -1 });

  let nextSequence = 1;
  if (lastInvoice) {
    const parts = lastInvoice.invoiceNo.split("-");
    // Assuming format YYYY-YY-NNNN, last part is number
    const lastSeq = parseInt(parts[parts.length - 1]);
    if (!isNaN(lastSeq)) {
      nextSequence = lastSeq + 1;
    }
  }

  // Pad with leading zeros (e.g., 0001)
  const paddedSeq = nextSequence.toString().padStart(4, "0");
  return `${financialYear}-${paddedSeq}`;
};

export const createInvoice = async (req, res) => {
  try {
    // 1. Fetch Company Profile for Snapshot
    const companyProfile = await CompanyProfile.findOne();
    if (!companyProfile) {
      return res.status(400).json({
        message: "Company Profile is missing. Please set it up first.",
      });
    }

    // 2. Generate Invoice Number
    const invoiceNo = await generateInvoiceNumber();

    // 3. Prepare Invoice Data
    const newInvoice = new Invoice({
      ...req.body,
      invoiceNo,
      companyProfileSnapshot: {
        companyName: companyProfile.companyName,
        companyId: companyProfile.companyId,
        address: companyProfile.address,
        gstin: companyProfile.gstin,
        taxId: companyProfile.taxId,
        bankName: companyProfile.bankName,
        accountNumber: companyProfile.accountNumber,
        ifscCode: companyProfile.ifscCode,
        branch: companyProfile.branch,
        logoUrl: companyProfile.logoUrl,
        signatoryName: companyProfile.signatoryName,
        signatureUrl: companyProfile.signatureUrl,
      },
      createdBy: req.user.id, // Assuming auth middleware sets this
    });

    // 4. Save
    await newInvoice.save();

    res.status(201).json(newInvoice);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating invoice", error: error.message });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .select("invoiceNo date customerName totalAmount status") // Light select for list
      .sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching invoices", error: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.status(200).json(invoice);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching invoice", error: error.message });
  }
};
