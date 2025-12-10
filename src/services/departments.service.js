import Department from '../models/departments.model.js';

export const createDepartment = async (data) => {
  const department = new Department(data);
  return await department.save();
};

export const getAllDepartments = async (query) => {
  return await Department.find(query).populate("managerId", "fullName email");
};

export const getDepartmentById = async (id) => {
  const department = await Department.findById(id).populate("managerId", "fullName email");
  if (!department) {
    throw { statusCode: 404, message: "Department not found" };
  }
  return department;
};

export const updateDepartment = async (id, data) => {
  const department = await Department.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!department) {
    throw { statusCode: 404, message: "Department not found" };
  }
  return department;
};

export const deleteDepartment = async (id) => {
  const department = await Department.findByIdAndDelete(id);
  if (!department) {
    throw { statusCode: 404, message: "Department not found" };
  }
  return department;
};

export default {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};
