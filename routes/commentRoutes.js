import express from "express";
import { addComment, getComment } from "../controllers/commentController.js";
import authMware from "../middleware/authMware.js";

const router = express.Router();


router.post("/posts/:id/comment", authMware, addComment);


router.get("/posts/:id/comments", authMware, getComment);

export default router;