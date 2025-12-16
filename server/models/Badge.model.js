import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    tier: {
        type: String,
        enum: ["bronze", "silver", "gold", "platinum"],
        required: true
    },
    criteria_type: {
        type: String,
        enum: ["hours", "projects", "leadership", "event", "special"],
        required: true
    },
    criteria_value: {
        type: Number,
        required: true
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Badge = mongoose.model("Badge", badgeSchema);

export default Badge;
