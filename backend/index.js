import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";

import connectDB from "./database/db.js";
import authRoutes from "./modules/v1/auth/routes/authRoutes.js";
import postRoutes from "./modules/v1/post/routes/postRoutes.js";
import categoryRoutes from "./modules/v1/category/routes/categoryRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.error("Mongo connect error", err));

app.use(cors());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/categories", categoryRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running...");
});

app.listen(process.env.PORT || 6001, () => {
  console.log("Server Started on port", process.env.PORT || 6001);
});
