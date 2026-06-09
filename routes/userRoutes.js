import express from "express";
import authMware from "../middleware/authMware.js";
import {
  getAllUsers,
  getUserProfile,
  updateProfile,
  followUser,
} from "../controllers/userController.js";
import upload from "../config/multer.js";

const router = express.Router();
router.get("/", authMware, getAllUsers);
router.put("/:id/follow", authMware, followUser);
router.put("/:id", authMware, upload.single("image"), updateProfile);
router.get("/:id", authMware , getUserProfile);


export default router;
