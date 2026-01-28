import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

/* ======================================================
   ADMIN SIGNIN
====================================================== */
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({
      email,
      role: "ADMIN",
      deletedAt: { $exists: false },
    });

    if (!admin) return res.status(401).json({ msg: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid)
      return res.status(401).json({ msg: "Invalid credentials" });

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
      msg: "Admin signed in successfully",
      accessToken,
      refreshToken,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        firstName: admin.firstName,
        lastName: admin.lastName,
      },
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Error signing in admin",
      error: error.message,
    });
  }
};

/* ======================================================
   ADMIN SIGNUP
====================================================== */
export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !lastName || !email || !password || !phone) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin)
      return res.status(400).json({ msg: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role: "ADMIN",
      isActive: false,
    });

    res.status(201).json({
      msg: "Admin created successfully",
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Admin signup failed", error: err.message });
  }
};

/* ======================================================
   FETCH ADMIN
====================================================== */
export const fetchAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select("-password");
    if (!admin) return res.status(404).json({ msg: "Admin not found" });

    return res.status(200).json({ admin });
  } catch (error) {
    return res.status(500).json({ msg: "Fetch failed" });
  }
};

/* ======================================================
   LOGOUT
====================================================== */
export const logout = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    admin.accessToken = null;
    admin.refreshToken = null;
    await admin.save();

    return res.status(200).json({ msg: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ msg: "Logout failed" });
  }
};

/* ======================================================
   REFRESH TOKEN
====================================================== */
export const refreshToken = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);

    const newAccessToken = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION || "1d" },
    );

    admin.accessToken = newAccessToken;
    await admin.save();

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(401).json({ msg: "Refresh failed" });
  }
};

/* ======================================================
   FORGOT / RESET PASSWORD (UNCHANGED)
====================================================== */
export const forgotPassword = async (req, res) => {
  // same as before
};

export const resetPassword = async (req, res) => {
  // same as before
};
