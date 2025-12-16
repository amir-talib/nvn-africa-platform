import Notification from "../models/Notification.model.js";

// Helper function to create notifications (used by other controllers)
export const createNotification = async ({ user, type, title, message, link = "", metadata = {} }) => {
    try {
        const notification = new Notification({
            user,
            type,
            title,
            message,
            link,
            metadata
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
};

// Get user's notifications
export const get_notifications = async (req, res) => {
    try {
        const user_id = req.user._id;
        const { read, limit = 50, page = 1 } = req.query;

        let query = { user: user_id };
        if (read !== undefined) {
            query.read = read === "true";
        }

        const skip = (page - 1) * limit;

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({ user: user_id, read: false });

        res.status(200).json({
            success: true,
            data: {
                notifications,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                },
                unreadCount
            }
        });
    } catch (error) {
        console.error("Error in get_notifications:", error);
        res.status(500).json({ message: "Error fetching notifications", error: error.message });
    }
};

// Mark notification as read
export const mark_as_read = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user._id;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, user: user_id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({
            success: true,
            message: "Notification marked as read",
            data: notification
        });
    } catch (error) {
        console.error("Error in mark_as_read:", error);
        res.status(500).json({ message: "Error updating notification", error: error.message });
    }
};

// Mark all notifications as read
export const mark_all_as_read = async (req, res) => {
    try {
        const user_id = req.user._id;

        await Notification.updateMany(
            { user: user_id, read: false },
            { read: true }
        );

        res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });
    } catch (error) {
        console.error("Error in mark_all_as_read:", error);
        res.status(500).json({ message: "Error updating notifications", error: error.message });
    }
};

// Delete a notification
export const delete_notification = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user._id;

        const notification = await Notification.findOneAndDelete({
            _id: id,
            user: user_id
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({
            success: true,
            message: "Notification deleted"
        });
    } catch (error) {
        console.error("Error in delete_notification:", error);
        res.status(500).json({ message: "Error deleting notification", error: error.message });
    }
};

// Get unread count only (for badge in UI)
export const get_unread_count = async (req, res) => {
    try {
        const user_id = req.user._id;
        const count = await Notification.countDocuments({ user: user_id, read: false });

        res.status(200).json({
            success: true,
            data: { unreadCount: count }
        });
    } catch (error) {
        console.error("Error in get_unread_count:", error);
        res.status(500).json({ message: "Error fetching unread count", error: error.message });
    }
};
