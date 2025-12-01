import express from "express";
import {
  createPost,
  getAllPosts,
  updatePost,
  deletePost,
} from "../controller/postController.js";
import headerValidator from "../../../../middleware/auth.js";

const router = express.Router();

router.post("/add", headerValidator, createPost);
router.get("/", headerValidator, getAllPosts);
router.put("/:id",headerValidator, updatePost);
router.delete("/:id", headerValidator, deletePost);

export default router;