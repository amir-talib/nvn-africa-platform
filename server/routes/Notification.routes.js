import express from "express";
import { verifyToken } from "../middleware/protected.js";
import {
    get_notifications,
    mark_as_read,
    mark_all_as_read,
    delete_notification,
    get_unread_count
} from "../controllers/Notification.controllers.js";

const router = express.Router();

// All routes require authentication
router.get("/", verifyToken, get_notifications);
router.get("/unread-count", verifyToken, get_unread_count);
router.put("/read-all", verifyToken, mark_all_as_read);
router.put("/:id", verifyToken, mark_as_read);
router.delete("/:id", verifyToken, delete_notification);

export default router;
