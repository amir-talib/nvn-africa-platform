import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Types
interface Volunteer {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    address: string;
    profile_picture?: string;
    skills?: string[];
}

interface ProjectInfo {
    _id: string;
    title: string;
    description: string;
    location: string;
    start_date: string;
    end_date: string;
    status: string;
}

export interface ProjectRequest {
    _id: string;
    volunteer: Volunteer;
    project: ProjectInfo;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

// Fetch all project requests
export const useProjectRequests = (status?: string) => {
    return useQuery({
        queryKey: ["projectRequests", status],
        queryFn: async (): Promise<ProjectRequest[]> => {
            const params = new URLSearchParams();
            if (status && status !== 'all') params.append("status", status);

            const response = await api.get(`/project/view-projects-requests?${params.toString()}`);
            return response.data.data;
        },
        staleTime: 30 * 1000,
    });
};

// Approve project request
export const useApproveRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (requestId: string) => {
            const response = await api.put(`/project/approve-project-request/${requestId}`, {});
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projectRequests"] });
        },
    });
};

// Reject project request
export const useRejectRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (requestId: string) => {
            const response = await api.put(`/project/reject-project-request/${requestId}`, {});
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projectRequests"] });
        },
    });
};

// Fetch all projects
export const useProjects = () => {
    return useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            const response = await api.get(`/project/view-projects`);
            return response.data.data;
        },
        staleTime: 60 * 1000,
    });
};

// Fetch stats
export const useStats = () => {
    return useQuery({
        queryKey: ["stats"],
        queryFn: async () => {
            const response = await api.get(`/project/stats`);
            return response.data.data;
        },
        staleTime: 30 * 1000,
    });
};

// Fetch single project by ID
export const useProjectById = (projectId: string | undefined) => {
    return useQuery({
        queryKey: ["project", projectId],
        queryFn: async () => {
            if (!projectId) throw new Error("Project ID is required");
            const response = await api.get(`/project/view-projects`);
            // Since there's no single project endpoint, find it from all projects
            const project = response.data.data.find((p: any) => p._id === projectId);
            if (!project) throw new Error("Project not found");
            return project;
        },
        enabled: !!projectId,
        staleTime: 60 * 1000,
        retry: 1,
    });
};

// Get current user's approved/joined projects
export const useMyApprovedProjects = () => {
    return useQuery({
        queryKey: ["my-approved-projects"],
        queryFn: async () => {
            const response = await api.get("/project/my-approved-projects");
            return response.data.data;
        },
        staleTime: 60 * 1000,
    });
};

// Get project volunteers (from project requests)
export const useProjectVolunteers = (projectId: string | undefined) => {
    return useQuery({
        queryKey: ["projectVolunteers", projectId],
        queryFn: async () => {
            if (!projectId) throw new Error("Project ID is required");
            const response = await api.get(`/project/view-projects-requests?status=approved`);
            // Filter requests for this project
            const projectRequests = response.data.data.filter((r: any) => r.project?._id === projectId);
            return projectRequests.map((r: any) => r.volunteer);
        },
        enabled: !!projectId,
        staleTime: 60 * 1000,
    });
};
