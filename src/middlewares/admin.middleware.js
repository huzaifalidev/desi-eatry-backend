// src/middlewares/admin.middleware.ts
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyAdmin =
  (mode = "access") =>
  async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({
            msg: `No ${mode === "access" ? "access" : "refresh"} token provided`,
          });
      }

      const token = authHeader.split(" ")[1];

      if (mode === "access") {
        // Access token flow
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await User.findById(decoded.id);

        if (
          !admin ||
          !admin.isActive ||
          admin.role !== "ADMIN" ||
          admin.accessToken !== token
        ) {
          return res.status(401).json({ msg: "Invalid session" });
        }

        req.user = {
          id: admin._id,
          email: admin.email,
          role: admin.role,
          firstName: admin.firstName,
          lastName: admin.lastName,
          refreshToken: admin.refreshToken, // optional, useful for refresh
        };
        return next();
      }

      if (mode === "refresh") {
        // Refresh token flow
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await User.findById(payload.id);

        if (
          !admin ||
          !admin.isActive ||
          admin.role !== "ADMIN" ||
          admin.refreshToken !== token
        ) {
          return res.status(403).json({ msg: "Invalid refresh token" });
        }

        req.user = {
          id: admin._id,
          email: admin.email,
          role: admin.role,
          firstName: admin.firstName,
          lastName: admin.lastName,
          refreshToken: token,
        };
        return next();
      }

      return res.status(400).json({ msg: "Invalid verification mode" });
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({
            msg: `${mode === "access" ? "Access" : "Refresh"} token expired`,
          });
      }
      return res.status(401).json({ msg: "Invalid token", error: err.message });
    }
  };
