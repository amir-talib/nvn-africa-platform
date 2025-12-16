import express from "express";
import {
    admin,
    kyc_approval,
    kyc_rejection,
    kyc_upload,
    manager,
    user,
    user_profile,
    update_profile,
    change_password,
    get_all_users,
    approve_user,
    ban_user,
    unban_user,
    get_user_by_id
} from "../controllers/User.controllers.js";
import { verifyToken } from "../middleware/protected.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";

const router = express.Router()

// Admin Routes
router.get("/admin", verifyToken, authorizeRole("admin"), admin)
router.put("/kyc-approval/:id", verifyToken, authorizeRole("admin"), kyc_approval)
router.put("/kyc-rejection/:id", verifyToken, authorizeRole("admin"), kyc_rejection)

// User management (admin only)
router.get("/all", verifyToken, authorizeRole("admin"), get_all_users)
router.get("/details/:id", verifyToken, authorizeRole("admin"), get_user_by_id)
router.put("/approve/:id", verifyToken, authorizeRole("admin"), approve_user)
router.put("/ban/:id", verifyToken, authorizeRole("admin"), ban_user)
router.put("/unban/:id", verifyToken, authorizeRole("admin"), unban_user)

// Both Admin and Manager
router.get("/manager", verifyToken, manager)

// Everyone (authenticated)
router.get("/user", verifyToken, user)
router.get("/profile", verifyToken, user_profile)
router.put("/profile", verifyToken, update_profile)
router.put("/password", verifyToken, change_password)

router.post("/kyc-upload", verifyToken, kyc_upload)

export default router;

