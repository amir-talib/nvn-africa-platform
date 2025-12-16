import mongoose from "mongoose";
import User from "../models/User.model.js";
import Project from "../models/Project.model.js";
import ProjectRequest from "../models/ProjectRequest.model.js";

export const view_all_project = async (req, res) => {
    try {
        const all_projects = await Project.find().sort({ createdAt: -1 });;
        return res.status(200).json({
            success: true,
            message: "All projects fetched successfully",
            count: all_projects.length,
            data: all_projects
        });
    } catch (error) {
        res.status(500).json({ message: "Error in update_project controller", error: error.message });
    }
}

export const view_my_created_project = async (req, res) => {
    try {
        const userId = req.user._id;

        const my_projects = await Project.find({ project_lead: userId });
        return res.status(200).json({
            success: true,
            message: `These are my projects.`,
            data: my_projects
        });
    } catch (error) {
        res.status(500).json({ message: "Error in update_project controller", error });
    }
}


export const view_all_project_requests = async (req, res) => {
    try {
        const { status } = req.query;

        let query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const all_projects_requests = await ProjectRequest.find(query)
            .populate('volunteer', 'firstname lastname email phone address profile_picture skills')
            .populate('project', 'title description location start_date end_date status')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: `Project requests fetched successfully.`,
            count: all_projects_requests.length,
            data: all_projects_requests
        });
    } catch (error) {
        res.status(500).json({ message: "Error in view_all_project_requests controller", error: error.message });
    }
}

export const view_all_approved_project_requests = async (req, res) => {
    try {
        const requests = await ProjectRequest.find({
            status: "approved"
        }).populate("project");
        const projects = requests.map(r => r.project);
        return res.status(200).json({
            success: true,
            message: `These are all approved projects.`,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        res.status(500).json({ message: "Error in view_all_approved_project_requests controller", error });
    }
}

export const view_all_rejected_project_requests = async (req, res) => {
    try {
        const requests = await ProjectRequest.find({
            status: "rejected"
        }).populate("project");
        const projects = requests.map(r => r.project);
        return res.status(200).json({
            success: true,
            message: `These are all rejected projects.`,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        res.status(500).json({ message: "Error in view_all_approved_project_requests controller", error });
    }
}

export const create_project = async (req, res) => {
    try {
        const { title, description, location, start_date, end_date, requirements } = req.body;

        if (!title || !description || !location || !start_date || !end_date || !requirements) {
            return res.status(400).json({ message: "All fields are required" })
        }
        if (!Array.isArray(requirements)) {
            return res.status(400).json({ message: "Requirements must be an array" });
        }

        const projectExists = await Project.findOne({ title });

        if (projectExists) {
            return res.status(400).json({ message: "project already submitted and pending verification" });
        }

        const project = new Project({
            title,
            description,
            project_lead: req.user._id,
            location,
            start_date,
            end_date,
            requirements: requirements,
            created_by: req.user._id
        })

        await project.save();

        return res.status(201).json({
            success: true,
            message: `project created and ${req.user._id} is the project lead`,
            data: project
        });
    } catch (error) {
        res.status(500).json({ message: "Error in create_project controller", error })
    }
}

const updateProjectStatus = async (req, res, newStatus) => {
    try {

        const userId = req.user._id;

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Project ID" });
        }

        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        if (project.project_lead.toString() !== userId.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: 'You are not authorized to update this project status' })
        }


        // if already same status
        if (project.status === newStatus) {
            return res.status(400).json({ message: `Project is already ${newStatus}` });
        }
        const previousStatus = project.status;
        project.status = newStatus;


        await project.save();

        // ------------------------------
        // HANDLE PROJECT COMPLETION LOGIC
        // ------------------------------

        if (newStatus === "completed" && previousStatus !== "completed") {

            // Get all approved volunteers for this project
            const approvedVolunteers = await ProjectRequest.find({
                project: id,
                status: "approved"
            });

            const volunteerIds = approvedVolunteers.map(v => v.volunteer);


            await User.updateMany(
                { _id: { $in: volunteerIds } },
                { $inc: { no_of_projects_done: 1 } }
            );

            const updatedUsers = await User.find({ _id: { $in: volunteerIds } });

            for (const user of updatedUsers) {
                const completed = user.no_of_projects_done;

                let newRole = "volunteer";
                if (completed >= 3 && completed <= 4) newRole = "mobilizer";
                if (completed >= 5) newRole = "admin";

                if (user.role !== newRole) {
                    await User.findByIdAndUpdate(user._id, { role: newRole });
                }
            }

        }

        return res.status(200).json({
            success: true,
            message: `Project is now ${newStatus} by ${req.user.username}`,
            data: project
        });

    } catch (error) {
        return res.status(500).json({ message: "Error updating project status", error: error.message });
    }
}


export const upcoming_project = (req, res) =>
    updateProjectStatus(req, res, "upcoming");

export const ongoing_project = (req, res) =>
    updateProjectStatus(req, res, "ongoing");

export const activate_project = (req, res) =>
    updateProjectStatus(req, res, "active");

export const completed_project = (req, res) =>
    updateProjectStatus(req, res, "completed");


export const update_project = async (req, res) => {
    try {
        const userId = req.user._id;

        const { id } = req.params;
        const { title, description, project_lead, location, start_date, end_date, neededVolunteers, requirements } = req.body;



        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid project ID" });
        }

        const projectExists = await Project.findById(id);

        if (!projectExists) {
            return res.status(404).json({ message: "project does not exist" });
        }

        if (project_lead) {
            if (!mongoose.Types.ObjectId.isValid(project_lead)) {
                return res.status(400).json({ message: "Invalid project_lead ID" });
            }
            const userExists = await User.findById(project_lead);

            if (!userExists) return res.status(400).json({ message: "This project_lead does not exist" })
            projectExists.project_lead = project_lead

        }
        if (userId.toString() !== project_lead.toString()) {
            return res.status(403).json({ message: 'You are not authorized to update this project' })
        }

        if (title) projectExists.title = title;
        if (description) projectExists.description = description;
        if (location) projectExists.location = location;
        if (start_date) projectExists.start_date = start_date;
        if (end_date) projectExists.end_date = end_date;
        if (neededVolunteers) projectExists.neededVolunteers = neededVolunteers;

        if (requirements) {
            if (!Array.isArray(requirements)) {
                return res.status(400).json({ message: "Requirements must be an array" });
            }
            projectExists.requirements = requirements;
        }


        await projectExists.save();

        return res.status(200).json({
            success: true,
            message: `Project updated successfully. ${userId.username} is now the project lead.`,
            data: projectExists
        });
    } catch (error) {
        res.status(500).json({ message: "Error in update_project controller", error });
    }
}


// export const delete_project = async (req, res) => {
//     try {
//         const { id } = req.params;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({ message: "Invalid Project ID" });
//         }

//         const projectExists = await Project.findById(id);
//         if (!projectExists) {
//             return res.status(404).json({ message: "project does not exist" });
//         }


//         await projectExists.deleteOne();

//         return res.status(200).json({
//             success: true,
//             message: `Project deleted!`,
//             data: projectExists
//         });
//     } catch (error) {
//         res.status(500).json({ message: "Error in delete_project controller", error });
//     }
// }

export const delete_project = async (req, res) => {
    try {
        const userId = req.user._id;

        const { id } = req.params;


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid project ID" });
        }

        const projectExists = await Project.findById(id);
        if (!projectExists) {
            return res.status(404).json({ message: "project does not exist" });
        }


        if (userId.toString() !== projectExists.project_lead.toString()) {
            return res.status(403).json({ message: `You are not authorized to update this project ${projectExists.title} ${userId} ${projectExists.project_lead}` })
        }



        await Project.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: `Project deleted by ${req.user.username}`,
        });
    } catch (error) {
        res.status(500).json({ message: "Error in delete_project controller", error });
    }
}


export const project_request = async (req, res) => {
    try {

        const userId = req.user._id;
        const { id } = req.params;


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Project ID" });
        }

        const projectExist = await Project.findById(id);
        if (!projectExist) {
            return res.status(404).json({ message: "Project not found" });
        }

        const existingRequest = await ProjectRequest.findOne({
            volunteer: userId,
            project: id
        });

        if (existingRequest) {
            return res.status(400).json({
                message: "You have already requested to join this project"
            });
        }

        const request = new ProjectRequest({
            volunteer: userId,
            project: id,
            status: "pending"
        });

        await request.save();

        return res.status(200).json({
            success: true,
            message: `You have requested to join the project ${projectExist.title}`,
            data: request
        });

    } catch (error) {
        return res.status(500).json({ message: "Error project request status", error });
    }
}


// REQYUESR APPROVAL AND REJECTION

const updateProjectRequestStatus = async (req, res, newStatus) => {
    try {

        const userId = req.user._id;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Project Request ID" });
        }

        const projectRequest = await ProjectRequest.findById(id);
        if (!projectRequest) return res.status(404).json({ message: "Project Request not found" });

        if (req.user.role !== "admin") {
            return res.status(403).json({ message: 'You are not authorized to update this project status' })
        }


        // if already same status
        if (projectRequest.status === newStatus) {
            return res.status(400).json({ message: `Project Requaet is already ${newStatus}` });
        }

        projectRequest.status = newStatus;


        await projectRequest.save();

        return res.status(200).json({
            success: true,
            message: `Project is now ${newStatus} by ${req.user.username}`,
            data: projectRequest
        });

    } catch (error) {
        return res.status(500).json({ message: "Error updating project status", error });
    }
}

export const approved_request = (req, res) =>
    updateProjectRequestStatus(req, res, "approved");


export const rejected_request = (req, res) =>
    updateProjectRequestStatus(req, res, "rejected");



export const my_approved_projects = async (req, res) => {
    try {
        const userId = req.user._id;

        const requests = await ProjectRequest.find({
            volunteer: userId,
            status: "approved"
        }).populate("project");
        const projects = requests.map(r => r.project);
        return res.status(200).json({
            success: true,
            message: "These are the projects I am volunteering for.",
            data: projects
        });

    } catch (error) {
        res.status(500).json({
            message: "Error in my_approved_projects controller",
            error
        });
    }
}



export const getStats = async (req, res) => {
    try {
        // Active volunteers (approved + not banned)
        const activeVolunteersQuery = {
            role: "volunteer",
            isBanned: { $ne: true },
        };

        // If the User model uses isApproved, include it
        if (Object.prototype.hasOwnProperty.call(User.schema.paths, "isApproved")) {
            activeVolunteersQuery.isApproved = true;
        }

        const activeVolunteersPromise = User.countDocuments(activeVolunteersQuery);

        // Completed projects
        const projectsCompletedPromise = Project.countDocuments({ status: "completed" });

        // Total projects
        const totalProjectsPromise = Project.countDocuments();

        // Total project requests
        const totalRequestsPromise = ProjectRequest.countDocuments();

        // Pending requests (status == "pending")
        const pendingRequestsPromise = ProjectRequest.countDocuments({ status: "pending" });

        // Distinct communities reached
        const communitiesFromProjectsPromise = Project.distinct("community", {
            community: { $exists: true, $ne: "" }
        });

        // Sum of all beneficiaries
        const livesImpactedPromise = Project.aggregate([
            { $match: { beneficiariesCount: { $exists: true, $gt: 0 } } },
            { $group: { _id: null, total: { $sum: "$beneficiariesCount" } } },
        ]);

        // Run all queries in parallel
        const [
            activeVolunteers,
            projectsCompleted,
            totalProjects,
            totalRequests,
            pendingRequests,
            communitiesFromProjects,
            livesImpactedAgg,
        ] = await Promise.all([
            activeVolunteersPromise,
            projectsCompletedPromise,
            totalProjectsPromise,
            totalRequestsPromise,
            pendingRequestsPromise,
            communitiesFromProjectsPromise,
            livesImpactedPromise
        ]);

        const communitiesReached = Array.isArray(communitiesFromProjects)
            ? communitiesFromProjects.length
            : 0;

        const livesImpacted =
            Array.isArray(livesImpactedAgg) && livesImpactedAgg[0]?.total
                ? livesImpactedAgg[0].total
                : 0;

        return res.status(200).json({
            success: true,
            data: {
                activeVolunteers,
                projectsCompleted,
                totalProjects,
                totalRequests,
                pendingRequests,
                communitiesReached,
                livesImpacted
            }
        });

    } catch (error) {
        console.error("Stats aggregation error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch stats",
            error: error.message
        });
    }
};
