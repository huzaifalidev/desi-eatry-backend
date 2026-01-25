// controllers/admin.controller.js
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";

// ---------------- Admin Signin ----------------
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email, role: "ADMIN", isActive: true });
    if (!admin) return res.status(401).json({ msg: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) return res.status(401).json({ msg: "Invalid credentials" });

    const payload = {
      id: admin._id,
      email: admin.email,
      role: admin.role,
      firstName: admin.firstName,
      lastName: admin.lastName,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || "1d",
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || "7d",
    });

    admin.accessToken = accessToken;
    admin.refreshToken = refreshToken;
    admin.lastLogin = new Date();
    admin.isActive = true;
    await admin.save();

    return res.status(200).json({
      msg: "Admin signed in success",
      admin: {
        id: admin._id,
        role: admin.role,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        lastLogin: admin.lastLogin,
        isActive: admin.isActive,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return res.status(500).json({ msg: "Error signing in admin", error: error.message });
  }
};

// ---------------- Fetch Admin ----------------
export const fetchAdmin = async (req, res) => {
  try {
    console.log("Fetching admin with user:", req.user);
    const { id } = req.user;

    const admin = await User.findById(id);
    if (!admin) return res.status(404).json({ msg: "Admin not found" });

    return res.status(200).json({
      msg: "Admin found",
      user: {
        id: admin._id,
        role: admin.role,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        lastLogin: admin.lastLogin,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ msg: "Error fetching admin", error: error.message });
  }
};

// ---------------- Admin Logout ----------------
export const logout = async (req, res) => {
  try {
    const { id } = req.user;
    const admin = await User.findById(id);
    if (!admin) return res.status(404).json({ msg: "Admin not found" });

    admin.accessToken = null;
    admin.refreshToken = null;
    await admin.save();

    return res.status(200).json({ msg: "Admin logged out successfully" });
  } catch (error) {
    return res.status(500).json({ msg: "Error signing out admin", error: error.message });
  }
};

// ---------------- Refresh Token ----------------
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ msg: "Refresh token is required" });

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

    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ msg: "Refresh failed", error: err.message });
  }
};