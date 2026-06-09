import express from "express";
import authMware from "../middleware/authMware.js";
import { sendMessage, getMessages } from "../controllers/messageController.js";

const router = express.Router();

router.post("/", authMware, sendMessage);
router.get("/:otherUserId", authMware, getMessages);

export default router;
