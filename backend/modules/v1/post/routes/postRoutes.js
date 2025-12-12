import express from "express";
import * as ctrl from "../controller/postController.js";
import { upload } from "../../../../middleware/upload.js"
import authMiddleware from "../../../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, upload.array("images", 5), ctrl.createPost);
router.get("/", ctrl.listPosts);
router.get("/:idOrSlug", ctrl.getPost);
router.put("/:id", authMiddleware, upload.array("images", 5), ctrl.updatePost);
router.delete("/:id", authMiddleware, ctrl.softDeletePost);
router.post("/:id/restore", authMiddleware, ctrl.restorePost);
router.post("/:id/archive", authMiddleware, ctrl.archivePost);
router.post("/:id/versions/:versionId/rollback", authMiddleware, ctrl.rollbackVersion);

export default router;
