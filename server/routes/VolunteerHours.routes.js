import express from "express";
import { verifyToken } from "../middleware/protected.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";
import {
    log_hours,
    get_my_hours,
    get_project_hours,
    get_pending_hours,
    verify_hours,
    reject_hours,
    get_hours_stats
} from "../controllers/VolunteerHours.controllers.js";

const router = express.Router();

// Volunteer routes
router.post("/log", verifyToken, authorizeRole("volunteer"), log_hours);
router.get("/my-hours", verifyToken, get_my_hours);

// Mobilizer/Admin routes
router.get("/pending", verifyToken, authorizeRole("admin", "mobilizer"), get_pending_hours);
router.get("/project/:id", verifyToken, authorizeRole("admin", "mobilizer"), get_project_hours);
router.put("/verify/:id", verifyToken, authorizeRole("admin", "mobilizer"), verify_hours);
router.put("/reject/:id", verifyToken, authorizeRole("admin", "mobilizer"), reject_hours);

// Stats
router.get("/stats", verifyToken, get_hours_stats);

export default router;
