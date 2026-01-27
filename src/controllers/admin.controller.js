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

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      msg: "Admin signed in successfully",
      admin: {
        id: admin._id,
        role: admin.role,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        lastLogin: admin.lastLogin,
        isActive: admin.isActive,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "Error signing in admin", error: error.message });
  }
};

// ---------------- ADMIN SIGNUP ----------------
export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !lastName || !email || !password || !phone) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters" });
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
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        isActive: admin.isActive,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Admin signup failed", error: err.message });
  }
};

/* ======================================================
   FETCH LOGGED-IN ADMIN
====================================================== */
export const fetchAdmin = async (req, res) => {
  try {
    const { id } = req.user;

    const admin = await User.findById(id).select("-password");
    if (!admin || admin.role !== "ADMIN")
      return res.status(403).json({ msg: "Access denied" });

    return res.status(200).json({
      msg: "Admin fetched successfully",
      admin,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "Error fetching admin", error: error.message });
  }
};

/* ======================================================
   ADMIN LOGOUT
====================================================== */
export const logout = async (req, res) => {
  try {
    const { id } = req.user;
    const admin = await User.findById(id);

    admin.accessToken = null;
    admin.refreshToken = null;
    await admin.save();

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

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
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ msg: "Refresh token missing" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await User.findById(payload.id);

    if (!admin || admin.refreshToken !== token) {
      return res.status(403).json({ msg: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        firstName: admin.firstName,
        lastName: admin.lastName,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION || "1d" },
    );

    admin.accessToken = newAccessToken;
    await admin.save();

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ msg: "Token refreshed" });
  } catch (err) {
    return res.status(403).json({ msg: "Refresh failed" });
  }
};


/* ======================================================
   ADMIN FORGOT PASSWORD
====================================================== */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const admin = await User.findOne({ email, role: "ADMIN" });
    if (!admin) return res.status(404).json({ msg: "Admin not found" });

    const resetToken = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_RESET_EXPIRATION || "1h" },
    );

    admin.resetToken = resetToken;
    await admin.save();

    res
      .status(200)
      .json({ msg: "Password reset token generated", token: resetToken });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Forgot password failed", error: error.message });
  }
};

/* ======================================================
   ADMIN RESET PASSWORD
====================================================== */
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword)
    return res.status(400).json({ msg: "Token and new password required" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await User.findById(payload.id);

    if (!admin || admin.resetToken !== token || admin.role !== "ADMIN") {
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
