import { useState } from "react";
import { Bell } from "lucide-react";
import { useUnreadCount, useNotifications, useMarkAsRead, useMarkAllAsRead } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    link: string;
    createdAt: string;
}

const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const { data: unreadData } = useUnreadCount();
    const { data: notificationsData, isLoading } = useNotifications();
    const markAsRead = useMarkAsRead();
    const markAllAsRead = useMarkAllAsRead();

    const unreadCount = unreadData?.data?.unreadCount || 0;
    const notifications: Notification[] = notificationsData?.data?.notifications || [];

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            markAsRead.mutate(notification._id);
        }
        if (notification.link) {
            navigate(notification.link);
            setOpen(false);
        }
    };

    const handleMarkAllRead = () => {
        markAllAsRead.mutate();
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "request_approved":
                return "✅";
            case "request_rejected":
                return "❌";
            case "hours_verified":
                return "⏱️";
            case "hours_rejected":
                return "🚫";
            case "badge_earned":
                return "🏆";
            case "project_update":
                return "📋";
            case "project_completed":
                return "🎉";
            case "new_project":
                return "🆕";
            default:
                return "📢";
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-500"
                        >
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllRead}
                            className="text-xs text-muted-foreground"
                        >
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-80">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-20">
                            <span className="text-muted-foreground text-sm">Loading...</span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-50" />
                            <span className="text-sm">No notifications yet</span>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.slice(0, 10).map((notification) => (
                                <div
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${!notification.read ? "bg-muted/30" : ""
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <span className="text-lg">
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!notification.read ? "font-medium" : ""}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                {notifications.length > 10 && (
                    <div className="p-2 border-t">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-sm"
                            onClick={() => {
                                navigate("/notifications");
                                setOpen(false);
                            }}
                        >
                            View all notifications
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
};

export default NotificationBell;
