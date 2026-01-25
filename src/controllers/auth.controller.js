import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js"; // Mongoose User model

// ---------------- Register User ----------------
export const registerUser = async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;
  try {
    if (!firstName || !lastName || !email || !phone|| password.length < 6) {
      return res.status(400).json({ msg: "Invalid input" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role: "CUSTOMER",
      isActive: false,
    });

    return res.status(200).json({
      msg: "User registered successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "Error registering user", error: error.message });
  }
};

// ---------------- Login User ----------------
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ msg: "Invalid password" });

    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || "15m",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || "7d",
    });

    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    user.isActive = true;
    await user.save();

    return res.status(200).json({
      msg: "User logged in successfully",
      user: {
        id: user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "Error signing in user", error: error.message });
  }
};

// ---------------- Refresh Token ----------------
export const refreshToken = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(400)
      .json({ msg: "Refresh token is required in Authorization header" });
  }
  const refreshToken = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== refreshToken || !user.isActive) {
      return res.status(403).json({ msg: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION || "15m" }
    );

    user.accessToken = newAccessToken;
    await user.save();

    return res
      .status(200)
      .json({ msg: "Refresh success", accessToken: newAccessToken });
  } catch (error) {
    return res
      .status(403)
      .json({ msg: "Refresh failed", error: error.message });
  }
};

// ---------------- Logout User ----------------
export const userLogout = async (req, res) => {
  if (!req.user || !req.user.id)
    return res.status(401).json({ msg: "Unauthorized" });

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.accessToken = null;
    user.refreshToken = null;
    await user.save();

    res.status(200).json({ msg: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Logout failed", error: error.message });
  }
};

// ---------------- Forgot Password ----------------
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (user.resetToken) {
      try {
        jwt.verify(user.resetToken, process.env.JWT_SECRET);
        return res
          .status(200)
          .json({ msg: "Password reset token sent", token: user.resetToken });
      } catch (err) {
        // token expired, continue to create new
      }
    }

    const resetToken = jwt.sign(
      {
        id: user._id,
        email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_RESET_EXPIRATION || "1h" }
    );

    user.resetToken = resetToken;
    await user.save();

    // TODO: Send email with resetToken
    res
      .status(200)
      .json({ msg: "Password reset token sent", token: resetToken });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Password reset failed", error: error.message });
  }
};

// ---------------- Reset Password ----------------
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword)
    return res.status(400).json({ msg: "Token and new password required" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);

    if (!user || user.resetToken !== token) {
      return res.status(403).json({ msg: "Invalid or expired token" });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword)
      return res.status(400).json({ msg: "New password must differ from old" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    await user.save();

    res.status(200).json({ msg: "Password reset successful" });
  } catch (error) {
    res.status(403).json({ msg: "Reset failed", error: error.message });
  }
};

// ---------------- Fetch User ----------------
export const fetchUser = async (req, res) => {
  if (!req.user || !req.user.id)
    return res.status(401).json({ msg: "Unauthorized" });

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.status(200).json({
      msg: "User found",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching user", error: error.message });
  }
};