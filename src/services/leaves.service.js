import Leave from '../models/leaves.model.js';
import User from '../models/users.model.js';
import mongoose from 'mongoose';

export const applyLeave = async (userId, data) => {
  if (new Date(data.fromDate) > new Date(data.toDate)) {
    throw { statusCode: 400, message: "From Date cannot be after To Date" };
  }

  const diffTime = Math.abs(new Date(data.toDate) - new Date(data.fromDate));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 

  const leave = new Leave({
    userId,
    ...data,
    days: diffDays,
  });

  return await leave.save();
};

export const getMyLeaves = async (userId) => {
  return await Leave.find({ userId }).sort({ createdAt: -1 });
};

export const getLeavesForApproval = async (managerId, role) => {
  return await Leave.find({ status: "Pending" })
    .populate("userId", "fullName email employeeId")
    .sort({ createdAt: 1 });
};

export const updateLeaveStatus = async (leaveId, status, approverId, rejectionReason) => {
  const leave = await Leave.findById(leaveId);
  if (!leave) {
    throw { statusCode: 404, message: "Leave request not found" };
  }

  if (leave.status !== "Pending") {
    throw { statusCode: 400, message: "Leave request is already processed" };
  }

  leave.status = status;
  leave.approverId = approverId;
  if (status === "Rejected" && rejectionReason) {
    leave.rejectionReason = rejectionReason;
  }

  return await leave.save();
};

export const getLeaveBalance = async (userId) => {
  const used = await Leave.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), status: "Approved" } },
    { $group: { _id: "$type", totalDays: { $sum: "$days" } } }
  ]);

  const allocation = {
    Sick: 10,
    Casual: 10,
    Earned: 15,
    Unpaid: 0 
  };

  const balance = { ...allocation };
  
  used.forEach(u => {
    if (balance[u._id] !== undefined) {
      balance[u._id] -= u.totalDays;
    }
  });

  return balance;
};

export default {
  applyLeave,
  getMyLeaves,
  getLeavesForApproval,
  updateLeaveStatus,
  getLeaveBalance,
};
