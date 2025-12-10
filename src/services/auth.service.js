import User from "../models/users.model.js";
import jwt from "jsonwebtoken";
import config from "../config/index.js";

const generateTokens = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    roles: user.roleIds,
  };

  const accessToken = jwt.sign(payload, config.jwtSecret, { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: "30d",
  });

  return { accessToken, refreshToken };
};

export const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw { statusCode: 401, message: "Invalid email or password" };
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw { statusCode: 401, message: "Invalid email or password" };
  }

  const tokens = generateTokens(user);

  user.refreshToken = tokens.refreshToken;
  await user.save();

  return { user, tokens };
};

export const refresh = async (refreshToken) => {
  if (!refreshToken) {
    throw { statusCode: 401, message: "Refresh Token required" };
  }

  try {
    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      throw { statusCode: 403, message: "Invalid Refresh Token" };
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return tokens;
  } catch (err) {
    throw { statusCode: 403, message: "Invalid Refresh Token" };
  }
};

export const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

export const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) throw { statusCode: 404, message: "User not found" };

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) throw { statusCode: 400, message: "Incorrect old password" };

  user.passwordHash = newPassword;
  await user.save();
};

export default {
  login,
  refresh,
  logout,
  changePassword,
};
