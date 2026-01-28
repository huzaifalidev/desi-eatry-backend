// src/middlewares/admin.middleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyAdmin =
  (mode = "access") =>
  async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ msg: "Authorization token missing" });
      }

      const token = authHeader.split(" ")[1];

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await User.findById(payload.id);

      if (!admin || admin.role !== "ADMIN" || !admin.isActive) {
        return res.status(401).json({ msg: "Invalid session" });
      }

      if (mode === "access" && admin.accessToken !== token) {
        return res.status(401).json({ msg: "Invalid access token" });
      }

      if (mode === "refresh" && admin.refreshToken !== token) {
        return res.status(401).json({ msg: "Invalid refresh token" });
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
        return res.status(401).json({ msg: "Token expired" });
      }

      return res.status(401).json({
        msg: "Invalid token",
        error: err.message,
      });
    }
  };
