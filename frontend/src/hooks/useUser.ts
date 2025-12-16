import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Profile types
interface UserProfile {
    _id: string;
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    phone: string;
    bio?: string;
    address: string;
    profile_picture?: string;
    role: string;
    isApproved: boolean;
    isBanned: boolean;
    total_hours: number;
    rank: string;
    createdAt: string;
}

interface UpdateProfileData {
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    bio?: string;
    address?: string;
    profile_picture?: string;
}

interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}

// Fetch current user profile
export const useProfile = () => {
    return useQuery({
        queryKey: ["profile"],
        queryFn: async (): Promise<UserProfile> => {
            const response = await api.get(`/user/profile`);
            return response.data.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Update profile
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateProfileData) => {
            const response = await api.put(`/user/profile`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
};

// Change password
export const useChangePassword = () => {
    return useMutation({
        mutationFn: async (data: ChangePasswordData) => {
            const response = await api.put(`/user/password`, data);
            return response.data;
        },
    });
};

// Admin: Get all users
export const useAllUsers = (filters?: { role?: string; isApproved?: boolean; search?: string; page?: number }) => {
    return useQuery({
        queryKey: ["users", filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.role) params.append("role", filters.role);
            if (filters?.isApproved !== undefined) params.append("isApproved", String(filters.isApproved));
            if (filters?.search) params.append("search", filters.search);
            if (filters?.page) params.append("page", String(filters.page));

            const response = await api.get(`/user/all?${params.toString()}`);
            return response.data;
        },
        staleTime: 30 * 1000, // 30 seconds
    });
};

// Admin: Approve user
export const useApproveUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            const response = await api.put(`/user/approve/${userId}`, {});
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
};

// Admin: Ban user
export const useBanUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            const response = await api.put(`/user/ban/${userId}`, {});
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
};

// Admin: Unban user
export const useUnbanUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            const response = await api.put(`/user/unban/${userId}`, {});
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
};

// Get single user by ID
export const useUserById = (userId: string | undefined) => {
    return useQuery({
        queryKey: ["user", userId],
        queryFn: async (): Promise<UserProfile> => {
            if (!userId) throw new Error("User ID is required");
            const response = await api.get(`/user/details/${userId}`);
            return response.data.data;
        },
        enabled: !!userId,
        staleTime: 60 * 1000,
        retry: 1,
    });
};
