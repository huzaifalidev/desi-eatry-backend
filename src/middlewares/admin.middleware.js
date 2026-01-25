// src/middlewares/admin.middleware.ts
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await User.findById(decoded.id);

    if (!admin || !admin.isActive || admin.accessToken !== token) {
      return res.status(401).json({ msg: "Invalid session" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    // Differentiate expired token vs malformed/invalid
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Access token expired" });
    }
    return res.status(401).json({ msg: "Invalid token" });
  }
};
