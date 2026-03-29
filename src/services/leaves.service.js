import Leave from '../models/leaves.model.js';
import User from '../models/users.model.js';
import emailService from './email.service.js';
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

  const savedLeave = await leave.save();

  // Notify admins and HRs
  (async () => {
    try {
      const applicant = await User.findById(userId);
      // Notify all active users with Admin or HR roles
      const recipients = await User.find({ 
          roleIds: { $in: ["Admin", "HR"] },
          status: "active" 
      }, "fullName email");

      if (recipients.length > 0) {
          await emailService.notifyLeaveApplication(recipients, {
              applicantName: applicant.fullName,
              leaveType: data.type,
              fromDate: data.fromDate,
              toDate: data.toDate,
              reason: data.reason,
              days: diffDays
          });
      }
    } catch (err) {
      console.error("Leave notification failed:", err.message);
    }
  })();

  return savedLeave;
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

  const savedLeave = await leave.save();

  // Notify applicant
  (async () => {
    try {
      const applicant = await User.findById(leave.userId);
      const approver = await User.findById(approverId);
      if (applicant && applicant.email) {
          emailService.notifyLeaveStatusUpdate(applicant.email, {
              applicantName: applicant.fullName,
              status: status,
              leaveType: leave.type,
              fromDate: leave.fromDate,
              toDate: leave.toDate,
              approverName: approver ? approver.fullName : 'Manager',
              rejectionReason: rejectionReason
          });
      }
    } catch (err) {
      console.error("Leave status notification failed:", err);
    }
  })();

  return savedLeave;
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
