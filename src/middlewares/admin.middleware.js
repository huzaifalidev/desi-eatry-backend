import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
export const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await User.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res.status(401).json({ msg: "Admin not active" });
    }

    if (admin.accessToken !== token) {
      return res.status(401).json({ msg: "Session expired, please login again" });
    }

    if (admin.role !== "ADMIN") {
      return res.status(403).json({ msg: "Admins only" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};
