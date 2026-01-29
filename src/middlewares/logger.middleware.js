// src/middlewares/logger.middleware.js
export const logger = (req, res, next) => {
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;

  // Human-readable timestamp
  const now = new Date();
  const timestamp = now.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);

  next();
};
