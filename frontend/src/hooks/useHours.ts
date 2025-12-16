import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Log hours for a project
export const useLogHours = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            project_id: string;
            hours: number;
            description: string;
            date_worked: string;
        }) => {
            const response = await api.post(`/hours/log`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-hours"] });
            queryClient.invalidateQueries({ queryKey: ["pending-hours"] });
        },
    });
};

// Get volunteer's own hours
export const useMyHours = (status?: string, projectId?: string) => {
    return useQuery({
        queryKey: ["my-hours", status, projectId],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (status) params.append("status", status);
            if (projectId) params.append("project_id", projectId);

            const response = await api.get(`/hours/my-hours?${params.toString()}`);
            return response.data;
        },
    });
};

// Get pending hours for verification (mobilizer/admin)
export const usePendingHours = () => {
    return useQuery({
        queryKey: ["pending-hours"],
        queryFn: async () => {
            const response = await api.get(`/hours/pending`);
            return response.data;
        },
    });
};

// Get hours for a specific project
export const useProjectHours = (projectId: string, status?: string) => {
    return useQuery({
        queryKey: ["project-hours", projectId, status],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (status) params.append("status", status);

            const response = await api.get(`/hours/project/${projectId}?${params.toString()}`);
            return response.data;
        },
        enabled: !!projectId,
    });
};

// Verify hours (mobilizer/admin)
export const useVerifyHours = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (hoursId: string) => {
            const response = await api.put(`/hours/verify/${hoursId}`, {});
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pending-hours"] });
            queryClient.invalidateQueries({ queryKey: ["project-hours"] });
            queryClient.invalidateQueries({ queryKey: ["hours-stats"] });
        },
    });
};

// Reject hours (mobilizer/admin)
export const useRejectHours = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ hoursId, reason }: { hoursId: string; reason: string }) => {
            const response = await api.put(`/hours/reject/${hoursId}`, { reason });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pending-hours"] });
            queryClient.invalidateQueries({ queryKey: ["project-hours"] });
        },
    });
};

// Get hours statistics
export const useHoursStats = () => {
    return useQuery({
        queryKey: ["hours-stats"],
        queryFn: async () => {
            const response = await api.get(`/hours/stats`);
            return response.data;
        },
    });
};
