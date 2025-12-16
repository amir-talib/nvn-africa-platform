import mongoose from "mongoose";

const volunteerHoursSchema = new mongoose.Schema({
    volunteer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    hours: {
        type: Number,
        required: true,
        min: 0.5
    },
    description: {
        type: String,
        required: true
    },
    date_worked: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending"
    },
    verified_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    verified_at: {
        type: Date
    },
    rejection_reason: {
        type: String
    }
}, { timestamps: true });

// Index for efficient queries
volunteerHoursSchema.index({ volunteer: 1, status: 1 });
volunteerHoursSchema.index({ project: 1 });

const VolunteerHours = mongoose.model("VolunteerHours", volunteerHoursSchema);

export default VolunteerHours;
