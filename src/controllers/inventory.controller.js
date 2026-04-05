import InventoryReceipt from "../models/inventoryReceipt.model.js";
import InventoryStock from "../models/inventoryStock.model.js";
import InventoryUtilization from "../models/inventoryUtilization.model.js";

const generateInventoryId = async () => {
  const prefix = "BM";
  const lastItem = await InventoryReceipt.findOne({
    uniqueId: new RegExp(`^${prefix}\\d{4}$`),
  }).sort({ uniqueId: -1 });

  let nextSequence = 1;
  if (lastItem) {
    const parts = lastItem.uniqueId.split("-");
    const lastSeq = parseInt(parts[parts.length - 1]);
    if (!isNaN(lastSeq)) {
      nextSequence = lastSeq + 1;
    }
  }

  return `${prefix}${nextSequence.toString().padStart(4, "0")}`;
};

export const receiveItem = async (req, res) => {
  try {
    const uniqueId = await generateInventoryId();
    const {
      date,
      department,
      contactPersonId,
      materialName,
      totalUnits,
      unitType,
      invoiceAmount,
      location,
      poDate,
      poNumber,
      miscellaneous,
    } = req.body;

    // 1. Create Receipt Record
    const receipt = new InventoryReceipt({
      uniqueId,
      date,
      department,
      contactPersonId,
      materialName,
      totalUnits,
      unitType,
      invoiceAmount,
      location,
      poDate,
      poNumber,
      miscellaneous,
      createdBy: req.user.id,
    });

    await receipt.save();

    // 2. Initialize Stock Record
    const stock = new InventoryStock({
      receiptId: receipt._id,
      uniqueId,
      presentUnits: totalUnits,
      personId: contactPersonId, // Initial holder is the contact person
      location,
    });

    await stock.save();

    res.status(201).json({ receipt, stock });
  } catch (error) {
    res.status(500).json({ message: "Error receiving item", error: error.message });
  }
};

export const getInventoryList = async (req, res) => {
  try {
    const inventory = await InventoryStock.find()
      .populate("receiptId")
      .populate("personId", "fullName email")
      .sort({ updatedAt: -1 });

    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: "Error fetching inventory", error: error.message });
  }
};

export const utilizeItem = async (req, res) => {
  try {
    const { uniqueId, unitsUsed, utilizerId, description, locationAtUsage } = req.body;

    // 1. Find Current Stock
    const stock = await InventoryStock.findOne({ uniqueId });
    if (!stock) {
      return res.status(404).json({ message: "Item not found in stock" });
    }

    if (stock.presentUnits < unitsUsed) {
      return res.status(400).json({ message: "Insufficient units in stock" });
    }

    // 2. Create Utilization Log
    const log = new InventoryUtilization({
      receiptId: stock.receiptId,
      uniqueId,
      utilizedUnits: unitsUsed,
      utilizerId,
      description,
      locationAtUsage,
    });

    await log.save();

    // 3. Update Stock
    stock.presentUnits -= unitsUsed;
    stock.lastUpdated = new Date();
    await stock.save();

    res.status(200).json({ log, remainingStock: stock.presentUnits });
  } catch (error) {
    res.status(500).json({ message: "Error recording utilization", error: error.message });
  }
};

export const getItemHistory = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const history = await InventoryUtilization.find({ uniqueId })
      .populate("utilizerId", "fullName email")
      .sort({ createdAt: -1 });

    const receipt = await InventoryReceipt.findOne({ uniqueId })
      .populate("contactPersonId", "fullName email");

    const stock = await InventoryStock.findOne({ uniqueId })
      .populate("personId", "fullName email");

    res.status(200).json({ receipt, history, stock });
  } catch (error) {
    res.status(500).json({ message: "Error fetching history", error: error.message });
  }
};
export const getGlobalUtilizationHistory = async (req, res) => {
  try {
    const history = await InventoryUtilization.find()
      .populate({
        path: "receiptId",
        select: "materialName unitType uniqueId",
      })
      .populate("utilizerId", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching global history", error: error.message });
  }
};
