import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

/* ======================================================
   ADMIN LOGIN
====================================================== */
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await User.findOne({
      email,
      role: { $in: ["ADMIN", "STAFF"] },
      deletedAt: { $exists: false },
    });

    if (!admin) {
      return res.status(404).json({ msg: "Admin not found" });
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const payload = {
      id: admin._id,
      role: admin.role,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || "15m",
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || "7d",
    });

    admin.accessToken = accessToken;
    admin.refreshToken = refreshToken;
    admin.lastLogin = new Date();
    admin.isActive = true;
    await admin.save();

    res.status(200).json({
      msg: "Admin logged in successfully",
      admin: {
        id: admin._id,
        role: admin.role,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ msg: "Admin login failed", error: error.message });
  }
};

export const adminRefreshToken = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(400).json({ msg: "Refresh token required" });
  }

  const refreshToken = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const admin = await User.findById(payload.id);
    if (
      !admin ||
      admin.refreshToken !== refreshToken ||
      !["ADMIN", "STAFF"].includes(admin.role)
    ) {
      return res.status(403).json({ msg: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION || "15m" }
    );

    admin.accessToken = newAccessToken;
    await admin.save();

    res.status(200).json({
      msg: "Token refreshed",
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(403).json({ msg: "Refresh failed", error: error.message });
  }
};

export const adminLogout = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin) return res.status(404).json({ msg: "Admin not found" });

    admin.accessToken = null;
    admin.refreshToken = null;
    await admin.save();

    res.status(200).json({ msg: "Admin logged out successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Logout failed", error: error.message });
  }
};

export const fetchAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select("-password");

    if (!admin || !["ADMIN", "STAFF"].includes(admin.role)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    res.status(200).json({
      msg: "Admin fetched",
      admin,
    });
  } catch (error) {
    res.status(500).json({ msg: "Fetch failed", error: error.message });
  }
};

export const adminForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await User.findOne({
      email,
      role: { $in: ["ADMIN", "STAFF"] },
    });

    if (!admin) return res.status(404).json({ msg: "Admin not found" });

    const resetToken = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_RESET_EXPIRATION || "1h" }
    );

    admin.resetToken = resetToken;
    await admin.save();

    res.status(200).json({
      msg: "Reset token generated",
      token: resetToken, // send via email in production
    });
  } catch (error) {
    res.status(500).json({ msg: "Reset failed", error: error.message });
  }
};

export const adminResetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || newPassword.length < 6) {
    return res.status(400).json({ msg: "Invalid input" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await User.findById(payload.id);

    if (!admin || admin.resetToken !== token) {
      return res.status(403).json({ msg: "Invalid or expired token" });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.resetToken = null;
    await admin.save();

    res.status(200).json({ msg: "Password reset successful" });
  } catch (error) {
    res.status(403).json({ msg: "Reset failed", error: error.message });
  }
};
