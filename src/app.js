import express from "express";
import apiRoutesV1 from "./routes/v1/index.js";
import { rateLimiter } from "./middlewares/rate.limiter.js";
import cors from "cors";

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "https://desi-eatry.huzaifali.tech"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.set("trust proxy", 1);
app.use(rateLimiter(5, 1, "Too many requests!"));
app.get("/", (req, res) => {
  res.send("Desi Eatry Backend API is running🚀");
});

app.use("/desi/api/v1", apiRoutesV1);

export default app;