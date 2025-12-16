import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },

    // DATE OF BIRTH (from signup form)
    date_of_birth: {
        type: Date,
        required: true
    },

    // MULTIPLE SKILLS FROM SIGNUP
    skills: {
        type: [String], // array of strings
        default: []
    },

    // OPTIONAL "other" skills text
    other_skills: {
        type: String,
        default: ""
    },

    // NEW - Interests from signup form
    interests: {
        type: [String],
        default: []
    },

    // NEW - Availability from signup form
    availability: {
        type: [String],
        default: []
    },

    // NEW - Bio field from signup form
    bio: {
        type: String,
        default: ""
    },

    gender: {
        type: String,
        enum: ["male", "female"],
        required: true
    },

    address: {
        type: String,
        required: true
    },

    // NEW - Country for regional analytics
    country: {
        type: String,
        default: ""
    },

    role: {
        type: String,
        enum: ["volunteer", "admin", "mobilizer", "chief_mobilizer", "general_mobilizer", "community_lead"],
        default: "volunteer"
    },

    no_of_projects_done: {
        type: Number,
        default: 0
    },

    isApproved: {
        type: Boolean,
        default: false
    },

    isBanned: {
        type: Boolean,
        default: false
    },

    // NEW PRD FIELDS - Profile & Verification
    profile_picture: {
        type: String,
        default: ""
    },

    email_verified: {
        type: Boolean,
        default: false
    },

    phone_verified: {
        type: Boolean,
        default: false
    },

    // NEW PRD FIELDS - Gamification
    total_hours: {
        type: Number,
        default: 0
    },

    rank: {
        type: String,
        enum: ["starter", "active_volunteer", "community_leader", "regional_mobilizer", "impact_ambassador"],
        default: "starter"
    },

}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
