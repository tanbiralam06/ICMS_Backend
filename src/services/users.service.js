import User from '../models/users.model.js';

export const createUser = async (data) => {
  const existingUser = await User.findOne({
    $or: [{ email: data.email }, { employeeId: data.employeeId }],
  });
  if (existingUser) {
    throw { statusCode: 400, message: "Email or Employee ID already exists" };
  }

  const user = new User(data);
  return await user.save();
};

export const getAllUsers = async (query) => {
  const { page = 1, limit = 25, search, departmentId, role } = query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { employeeId: { $regex: search, $options: "i" } },
    ];
  }
  if (departmentId) {
    filter.departmentId = departmentId;
  }
  if (role) {
    filter.roleIds = role;
  }

  const users = await User.find(filter)
    .select("-passwordHash -refreshToken")
    .populate("departmentId", "name")
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(filter);

  return { users, total, page: parseInt(page), pages: Math.ceil(total / limit) };
};

export const getUserById = async (id) => {
  const user = await User.findById(id)
    .select("-passwordHash -refreshToken")
    .populate("departmentId", "name");
  if (!user) {
    throw { statusCode: 404, message: "User not found" };
  }
  return user;
};

export const updateUser = async (id, data) => {
  delete data.passwordHash;
  delete data.refreshToken;

  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).select("-passwordHash -refreshToken");

  if (!user) {
    throw { statusCode: 404, message: "User not found" };
  }
  return user;
};

export const updateUserStatus = async (id, status) => {
  const user = await User.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  ).select("-passwordHash -refreshToken");

  if (!user) {
    throw { statusCode: 404, message: "User not found" };
  }
  return user;
};

export default {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
};
