export const verifyAdmin = async (req, res, next) => {
  try {
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    console.log("Verifying admin with request headers:", req.headers);
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Incoming Token:", token);
    console.log("DB Token:", admin.accessToken);
    console.log("Incoming Length:", token?.length);
    console.log("DB Length:", admin.accessToken?.length);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    const admin = await User.findById(decoded.id);
    console.log("Admin found:", admin);

    if (!admin || !admin.isActive) {
      return res.status(401).json({ msg: "Admin not active" });
    }

    // 🔴 CRITICAL SECURITY CHECK
    if (admin.accessToken !== token) {
      return res.status(401).json({ msg: "Session expired, please login again" });
    }

    if (admin.role !== "ADMIN") {
      return res.status(403).json({ msg: "Admins only" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};