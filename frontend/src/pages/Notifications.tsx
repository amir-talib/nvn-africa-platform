import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  CheckCircle,
  Clock,
  UserPlus,
  Calendar,
  AlertCircle,
  Mail,
  Trash2,
  CheckCheck,
  Loader2,
  Award,
  ClipboardCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '@/hooks/useNotifications';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'hours_logged':
      return <Clock className="w-5 h-5 text-primary" />;
    case 'hours_verified':
      return <CheckCircle className="w-5 h-5 text-success" />;
    case 'hours_rejected':
      return <AlertCircle className="w-5 h-5 text-destructive" />;
    case 'rank_up':
      return <Award className="w-5 h-5 text-warning" />;
    case 'project_request':
      return <UserPlus className="w-5 h-5 text-primary" />;
    case 'project_approved':
      return <ClipboardCheck className="w-5 h-5 text-success" />;
    case 'project_completed':
      return <Calendar className="w-5 h-5 text-success" />;
    case 'message':
      return <Mail className="w-5 h-5 text-purple-500" />;
    case 'system':
      return <AlertCircle className="w-5 h-5 text-amber-500" />;
    default:
      return <Bell className="w-5 h-5 text-muted-foreground" />;
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
};

export default function Notifications() {
  const navigate = useNavigate();

  // Fetch notifications from API
  const { data: notifications = [], isLoading, error } = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;
  const allNotifications = notifications;
  const unreadNotifications = notifications.filter((n: any) => !n.is_read);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync(id);
    } catch (error: any) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      toast.success('All notifications marked as read');
    } catch (error: any) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotificationMutation.mutateAsync(id);
      toast.success('Notification deleted');
    } catch (error: any) {
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationClick = (notification: any) => {
    handleMarkAsRead(notification._id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const NotificationItem = ({ notification }: { notification: any }) => (
    <div
      className={`flex items-start gap-4 p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${!notification.is_read ? 'bg-primary/5' : ''
        }`}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="flex-shrink-0 mt-1">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={`font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
              {notification.title}
            </p>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {notification.message}
            </p>
          </div>
          {!notification.is_read && (
            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
              New
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{formatTime(notification.createdAt)}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {!notification.is_read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              handleMarkAsRead(notification._id);
            }}
          >
            <CheckCheck className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteNotification(notification._id);
          }}
          disabled={deleteNotificationMutation.isPending}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <DashboardLayout title="Notifications">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Notifications">
        <div className="flex items-center justify-center h-64 text-destructive">
          Failed to load notifications. Please try again.
        </div>
      </DashboardLayout>
    );
  }

  // Count by type
  const requestCount = notifications.filter((n: any) =>
    n.type === 'project_request' || n.type === 'project_approved'
  ).length;
  const hoursCount = notifications.filter((n: any) =>
    n.type === 'hours_logged' || n.type === 'hours_verified' || n.type === 'hours_rejected'
  ).length;

  return (
    <DashboardLayout title="Notifications">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
            <p className="text-muted-foreground">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                  <p className="text-xs text-muted-foreground">Unread</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <UserPlus className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{requestCount}</p>
                  <p className="text-xs text-muted-foreground">Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{hoursCount}</p>
                  <p className="text-xs text-muted-foreground">Hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader className="pb-0">
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">
                  All ({allNotifications.length})
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Unread ({unreadNotifications.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                {allNotifications.length > 0 ? (
                  <div className="divide-y divide-border">
                    {allNotifications.map((notification: any) => (
                      <NotificationItem key={notification._id} notification={notification} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No notifications yet</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="unread" className="mt-4">
                {unreadNotifications.length > 0 ? (
                  <div className="divide-y divide-border">
                    {unreadNotifications.map((notification: any) => (
                      <NotificationItem key={notification._id} notification={notification} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">All caught up! No unread notifications.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </DashboardLayout>
  );
}
