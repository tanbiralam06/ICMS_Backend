import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/users.model.js';
import Department from '../models/departments.model.js';
import config from '../config/index.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("MongoDB Connected for Seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Department.deleteMany({});
    console.log("Cleared existing data.");

    // Create Departments
    const techDept = await Department.create({
      name: "Technology",
      description: "Engineering and IT",
    });
    const hrDept = await Department.create({
      name: "Human Resources",
      description: "HR and Admin",
    });

    // Create Admin User
    const adminUser = await User.create({
      email: "admin@icms.com",
      passwordHash: "admin123", 
      fullName: "System Admin",
      employeeId: "ADM001",
      roleIds: ["Admin"],
      departmentId: hrDept._id,
    });
    console.log("Admin User Created:", adminUser.email);

    // Create Manager
    const managerUser = await User.create({
      email: "manager@icms.com",
      passwordHash: "manager123",
      fullName: "Tech Manager",
      employeeId: "MGR001",
      roleIds: ["Manager"],
      departmentId: techDept._id,
    });
    console.log("Manager User Created:", managerUser.email);

    // Create Employee
    const employeeUser = await User.create({
      email: "employee@icms.com",
      passwordHash: "employee123",
      fullName: "John Doe",
      employeeId: "EMP001",
      roleIds: ["Employee"],
      departmentId: techDept._id,
    });
    console.log("Employee User Created:", employeeUser.email);

    console.log("Seeding Completed Successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding Failed:", err);
    process.exit(1);
  }
};

seedData();
