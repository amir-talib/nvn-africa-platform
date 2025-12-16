import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Get user's notifications
export const useNotifications = (read?: boolean, limit: number = 50, page: number = 1) => {
    return useQuery({
        queryKey: ["notifications", read, limit, page],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (read !== undefined) params.append("read", String(read));
            params.append("limit", String(limit));
            params.append("page", String(page));

            const response = await api.get(`/notifications?${params.toString()}`);
            return response.data;
        },
        refetchInterval: 30000, // Refetch every 30 seconds
    });
};

// Get unread count only
export const useUnreadCount = () => {
    return useQuery({
        queryKey: ["notifications-unread-count"],
        queryFn: async () => {
            const response = await api.get(`/notifications/unread-count`);
            return response.data;
        },
        refetchInterval: 15000, // Refetch every 15 seconds
    });
};

// Mark single notification as read
export const useMarkAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: string) => {
            const response = await api.put(`/notifications/${notificationId}`, {});
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
        },
    });
};

// Mark all notifications as read
export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await api.put(`/notifications/read-all`, {});
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
        },
    });
};

// Delete a notification
export const useDeleteNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: string) => {
            const response = await api.delete(`/notifications/${notificationId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
        },
    });
};
