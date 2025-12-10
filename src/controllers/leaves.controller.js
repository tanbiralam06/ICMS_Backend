import leaveService from '../services/leaves.service.js';

export const applyLeave = async (req, res, next) => {
  try {
    const leave = await leaveService.applyLeave(req.user.id, req.body);
    res.status(201).json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
};

export const getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await leaveService.getMyLeaves(req.user.id);
    res.json({ success: true, data: leaves });
  } catch (err) {
    next(err);
  }
};

export const getLeavesForApproval = async (req, res, next) => {
  try {
    const leaves = await leaveService.getLeavesForApproval(req.user.id, req.user.roles);
    res.json({ success: true, data: leaves });
  } catch (err) {
    next(err);
  }
};

export const approveLeave = async (req, res, next) => {
  try {
    const leave = await leaveService.updateLeaveStatus(req.params.id, "Approved", req.user.id);
    res.json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
};

export const rejectLeave = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const leave = await leaveService.updateLeaveStatus(req.params.id, "Rejected", req.user.id, reason);
    res.json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
};

export const getLeaveBalance = async (req, res, next) => {
  try {
    const balance = await leaveService.getLeaveBalance(req.user.id);
    res.json({ success: true, data: balance });
  } catch (err) {
    next(err);
  }
};

export default {
  applyLeave,
  getMyLeaves,
  getLeavesForApproval,
  approveLeave,
  rejectLeave,
  getLeaveBalance,
};
