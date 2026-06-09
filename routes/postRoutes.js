import express from "express";
import { createPost, getPosts, LikeUnlikePost, deletePost } from "../controllers/postController.js";
import authMware from "../middleware/authMware.js";
import upload from "../config/multer.js";

const router = express.Router();

router.post("/", authMware, upload.single("image"), createPost);
router.get("/", authMware, getPosts);
router.put("/:id/like", authMware, LikeUnlikePost);
router.delete("/:id", authMware, deletePost);
export default router;
