// src/middlewares/admin.middleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyAdmin =
  (mode = "access") =>
  async (req, res, next) => {
    try {
      const token =
        mode === "access"
          ? req.cookies?.accessToken
          : req.cookies?.refreshToken;

      if (!token) {
        return res.status(401).json({
          msg: `No ${mode === "access" ? "access" : "refresh"} token provided`,
        });
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await User.findById(payload.id);

      if (!admin || !admin.isActive || admin.role !== "ADMIN") {
        return res.status(401).json({ msg: "Invalid session" });
      }

      if (mode === "access" && admin.accessToken !== token) {
        return res.status(401).json({ msg: "Invalid access token" });
      }

      if (mode === "refresh" && admin.refreshToken !== token) {
        return res.status(403).json({ msg: "Invalid refresh token" });
      }

      req.user = {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        firstName: admin.firstName,
        lastName: admin.lastName,
      };

      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          msg: `${mode === "access" ? "Access" : "Refresh"} token expired`,
        });
      }

      return res.status(401).json({
        msg: "Invalid token",
        error: err.message,
      });
    }
  };
