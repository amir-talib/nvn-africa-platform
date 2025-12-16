import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const verifyToken = async (req, res, next) => {
    try {
        let token = null;

        // 1) Prefer Authorization header (used by the frontend)
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }

        // 2) Fallback to httpOnly cookie (server sets this on login)
        if (!token && req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);

        // Token payload historically used different keys; support both for robustness.
        const userId = decode?.userId || decode?.id;
        if (!userId) return res.status(401).json({ message: "Invalid token payload" });

        const user = await User.findById(userId).select("-password");
        if (!user) return res.status(401).json({ message: "Invalid token user" });

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Token is not valid" })
    }

}