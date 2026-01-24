import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const rateLimiter = (maxRequests, windowMinutes, message) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    message: { message: message || "Too many requests, try again later" },
    standardHeaders: true,
    legacyHeaders: false,

    keyGenerator: (req) => {
      const ip = ipKeyGenerator(req);
      return ip;
    },
  });
};