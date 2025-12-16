import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },

    description: {
        type: String,
        required: true
    },

    project_lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    community: { type: String, default: "" },

    beneficiariesCount: { type: Number, default: 0 },

    status: {
        type: String,
        enum: ["upcoming", "ongoing", "completed", "cancelled"],
        default: "upcoming"
    },
    start_date: {
        type: Date,
        required: false
    },

    end_date: {
        type: Date,
        required: false
    },

    // NEW PRD FIELD - Location
    location: {
        type: String,
        default: ""
    },

    // NEW PRD FIELD - Project Images (Cloudinary URLs)
    images: {
        type: [String],
        default: []
    },

    requirements: [String],
    neededVolunteers: Number,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // NEW PRD FIELD - Track who last edited
    edited_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    edited_at: {
        type: Date
    }

}, { timestamps: true })

const Project = mongoose.model("Project", projectSchema);
export default Project; 