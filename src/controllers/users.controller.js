import userService from '../services/users.service.js';

export const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    user.passwordHash = undefined;
    user.refreshToken = undefined;
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const result = await userService.getAllUsers(req.query);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = await userService.updateUserStatus(req.params.id, status);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.user.id);
        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
}

export default {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  getMe
};
