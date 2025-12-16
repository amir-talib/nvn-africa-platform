import mongoose from "mongoose";
import VolunteerHours from "../models/VolunteerHours.model.js";
import Project from "../models/Project.model.js";
import User from "../models/User.model.js";
import Notification from "../models/Notification.model.js";
import { createNotification } from "./Notification.controllers.js";

// Log volunteer hours for a project
export const log_hours = async (req, res) => {
    try {
        const { project_id, hours, description, date_worked } = req.body;
        const volunteer_id = req.user._id;

        // Validate project exists
        const project = await Project.findById(project_id);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Check if volunteer is part of the project
        const isVolunteerInProject = project.volunteers.some(
            v => v.toString() === volunteer_id.toString()
        );

        if (!isVolunteerInProject) {
            return res.status(403).json({
                message: "You must be a member of this project to log hours"
            });
        }

        // Create hours entry
        const newHours = new VolunteerHours({
            volunteer: volunteer_id,
            project: project_id,
            hours,
            description,
            date_worked: new Date(date_worked),
            status: "pending"
        });

        await newHours.save();

        // Notify mobilizers/admins about pending hours
        const mobilizers = await User.find({
            role: { $in: ["admin", "mobilizer"] }
        });

        for (const mobilizer of mobilizers) {
            await createNotification({
                user: mobilizer._id,
                type: "hours_verified",
                title: "Hours Pending Verification",
                message: `${req.user.firstname} ${req.user.lastname} logged ${hours} hours for "${project.title}"`,
                link: `/mobilizer/hours-verification`
            });
        }

        res.status(201).json({
            success: true,
            message: "Hours logged successfully. Pending verification.",
            data: newHours
        });
    } catch (error) {
        console.error("Error in log_hours:", error);
        res.status(500).json({ message: "Error logging hours", error: error.message });
    }
};

// Get volunteer's own hours
export const get_my_hours = async (req, res) => {
    try {
        const volunteer_id = req.user._id;
        const { status, project_id } = req.query;

        let query = { volunteer: volunteer_id };

        if (status) {
            query.status = status;
        }

        if (project_id) {
            query.project = project_id;
        }

        const hours = await VolunteerHours.find(query)
            .populate("project", "title status")
            .populate("verified_by", "firstname lastname")
            .sort({ createdAt: -1 });

        // Calculate stats
        const totalHours = await VolunteerHours.aggregate([
            { $match: { volunteer: new mongoose.Types.ObjectId(volunteer_id), status: "verified" } },
            { $group: { _id: null, total: { $sum: "$hours" } } }
        ]);

        const pendingHours = await VolunteerHours.aggregate([
            { $match: { volunteer: new mongoose.Types.ObjectId(volunteer_id), status: "pending" } },
            { $group: { _id: null, total: { $sum: "$hours" } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                hours,
                stats: {
                    total_verified: totalHours[0]?.total || 0,
                    total_pending: pendingHours[0]?.total || 0
                }
            }
        });
    } catch (error) {
        console.error("Error in get_my_hours:", error);
        res.status(500).json({ message: "Error fetching hours", error: error.message });
    }
};

// Get all hours for a project (mobilizer/admin)
export const get_project_hours = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.query;

        let query = { project: id };
        if (status) {
            query.status = status;
        }

        const hours = await VolunteerHours.find(query)
            .populate("volunteer", "firstname lastname email profile_picture")
            .populate("verified_by", "firstname lastname")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: hours
        });
    } catch (error) {
        console.error("Error in get_project_hours:", error);
        res.status(500).json({ message: "Error fetching project hours", error: error.message });
    }
};

// Get all pending hours for verification (mobilizer/admin)
export const get_pending_hours = async (req, res) => {
    try {
        const hours = await VolunteerHours.find({ status: "pending" })
            .populate("volunteer", "firstname lastname email profile_picture")
            .populate("project", "title status")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: hours
        });
    } catch (error) {
        console.error("Error in get_pending_hours:", error);
        res.status(500).json({ message: "Error fetching pending hours", error: error.message });
    }
};

// Verify hours (mobilizer/admin)
export const verify_hours = async (req, res) => {
    try {
        const { id } = req.params;
        const verifier_id = req.user._id;

        const hoursEntry = await VolunteerHours.findById(id)
            .populate("project", "title");

        if (!hoursEntry) {
            return res.status(404).json({ message: "Hours entry not found" });
        }

        if (hoursEntry.status !== "pending") {
            return res.status(400).json({ message: "Hours already processed" });
        }

        // Update hours status
        hoursEntry.status = "verified";
        hoursEntry.verified_by = verifier_id;
        hoursEntry.verified_at = new Date();
        await hoursEntry.save();

        // Update volunteer's total hours
        await User.findByIdAndUpdate(hoursEntry.volunteer, {
            $inc: { total_hours: hoursEntry.hours }
        });

        // Check and update rank
        await updateVolunteerRank(hoursEntry.volunteer);

        // Notify volunteer
        await createNotification({
            user: hoursEntry.volunteer,
            type: "hours_verified",
            title: "Hours Verified!",
            message: `Your ${hoursEntry.hours} hours for "${hoursEntry.project.title}" have been verified.`,
            link: `/volunteer/hours`
        });

        res.status(200).json({
            success: true,
            message: "Hours verified successfully",
            data: hoursEntry
        });
    } catch (error) {
        console.error("Error in verify_hours:", error);
        res.status(500).json({ message: "Error verifying hours", error: error.message });
    }
};

// Reject hours (mobilizer/admin)
export const reject_hours = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const verifier_id = req.user._id;

        const hoursEntry = await VolunteerHours.findById(id)
            .populate("project", "title");

        if (!hoursEntry) {
            return res.status(404).json({ message: "Hours entry not found" });
        }

        if (hoursEntry.status !== "pending") {
            return res.status(400).json({ message: "Hours already processed" });
        }

        // Update hours status
        hoursEntry.status = "rejected";
        hoursEntry.verified_by = verifier_id;
        hoursEntry.verified_at = new Date();
        hoursEntry.rejection_reason = reason || "No reason provided";
        await hoursEntry.save();

        // Notify volunteer
        await createNotification({
            user: hoursEntry.volunteer,
            type: "hours_rejected",
            title: "Hours Rejected",
            message: `Your hours for "${hoursEntry.project.title}" were rejected. Reason: ${reason || "No reason provided"}`,
            link: `/volunteer/hours`
        });

        res.status(200).json({
            success: true,
            message: "Hours rejected",
            data: hoursEntry
        });
    } catch (error) {
        console.error("Error in reject_hours:", error);
        res.status(500).json({ message: "Error rejecting hours", error: error.message });
    }
};

// Helper function to update volunteer rank based on hours
async function updateVolunteerRank(volunteerId) {
    const user = await User.findById(volunteerId);
    if (!user) return;

    let newRank = "starter";

    if (user.total_hours >= 500) {
        newRank = "impact_ambassador";
    } else if (user.total_hours >= 200) {
        newRank = "regional_mobilizer";
    } else if (user.total_hours >= 100) {
        newRank = "community_leader";
    } else if (user.total_hours >= 25) {
        newRank = "active_volunteer";
    }

    if (user.rank !== newRank) {
        user.rank = newRank;
        await user.save();

        // Notify about rank upgrade
        await createNotification({
            user: volunteerId,
            type: "badge_earned",
            title: "Rank Up!",
            message: `Congratulations! You've reached the rank of ${newRank.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}!`,
            link: `/volunteer/profile`
        });
    }
}

// Get hours statistics (for dashboard)
export const get_hours_stats = async (req, res) => {
    try {
        const totalVerifiedHours = await VolunteerHours.aggregate([
            { $match: { status: "verified" } },
            { $group: { _id: null, total: { $sum: "$hours" } } }
        ]);

        const pendingCount = await VolunteerHours.countDocuments({ status: "pending" });

        const topVolunteers = await VolunteerHours.aggregate([
            { $match: { status: "verified" } },
            {
                $group: {
                    _id: "$volunteer",
                    totalHours: { $sum: "$hours" }
                }
            },
            { $sort: { totalHours: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "volunteer"
                }
            },
            { $unwind: "$volunteer" },
            {
                $project: {
                    _id: 1,
                    totalHours: 1,
                    "volunteer.firstname": 1,
                    "volunteer.lastname": 1,
                    "volunteer.profile_picture": 1,
                    "volunteer.rank": 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalVerifiedHours: totalVerifiedHours[0]?.total || 0,
                pendingCount,
                topVolunteers
            }
        });
    } catch (error) {
        console.error("Error in get_hours_stats:", error);
        res.status(500).json({ message: "Error fetching hours stats", error: error.message });
    }
};
