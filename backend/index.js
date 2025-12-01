import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import cors from "cors";
import authRoutes from "./modules/v1/auth/routes/authRoutes.js"
import postRoutes from "./modules/v1/post/routes/postRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use(cors());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/posts", postRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running...");
});

app.listen(process.env.PORT || 6000, () =>
  console.log("Server Started")
);





