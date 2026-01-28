import express from "express";
import apiRoutesV1 from "./routes/v1/index.js";
import { rateLimiter } from "./middlewares/rate.limiter.js";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

// Middlewares
const allowedOrigins = [
  "http://localhost:3000",
  "https://desi-eatry-dashboard.vercel.app",
  "https://desi-eatry.huzaifali.tech"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin like Postman
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1);
app.use(rateLimiter(5, 1, "Too many requests!"));
app.get("/", (req, res) => {
  res.send("Desi Eatry Backend API is running🚀");
});

app.use("/desi/api/v1", apiRoutesV1);

export default app;