import VolunteerHeader from '@/components/layout/VolunteerHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  CheckCircle,
  XCircle,
  FolderKanban,
  Calendar,
  MessageSquare,
  Trash2,
  Check,
  Loader2,
  Award
} from 'lucide-react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification, useUnreadCount } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';

const VolunteerNotifications = () => {
  const { toast } = useToast();

  // Fetch real notifications from MongoDB
  const { data: notificationsData, isLoading, error } = useNotifications(undefined, 50);
  const { data: unreadCountData } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  // Safely extract notifications array - API may return array directly or wrapped in object
  const notificationsList: any[] = Array.isArray(notificationsData?.data)
    ? notificationsData.data
    : (notificationsData?.data?.notifications || []);

  // Transform backend data to component format
  const notifications = notificationsList.map((n: any) => ({
    id: n._id,
    title: n.title || 'Notification',
    message: n.message || '',
    time: n.createdAt ? formatTimeAgo(n.createdAt) : 'Recently',
    type: n.type || 'info',
    read: n.read || false,
    link: n.link,
  }));

  const unreadCount = unreadCountData?.count || notifications.filter((n: any) => !n.read).length;

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'hours_verified':
      case 'project_approved':
      case 'request_approved':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'hours_rejected':
      case 'project_rejected':
      case 'request_rejected':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'project_update':
      case 'new_project':
        return <FolderKanban className="w-5 h-5 text-primary" />;
      case 'reminder':
        return <Calendar className="w-5 h-5 text-warning" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'badge_earned':
      case 'achievement':
        return <Award className="w-5 h-5 text-primary" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead.mutateAsync(id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
      toast({
        title: "Done",
        description: "All notifications marked as read",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to mark all as read",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification.mutateAsync(id);
      toast({
        title: "Deleted",
        description: "Notification removed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const filterNotifications = (filter: string) => {
    switch (filter) {
      case 'unread': return notifications.filter((n: any) => !n.read);
      case 'approvals': return notifications.filter((n: any) =>
        n.type === 'hours_verified' || n.type === 'hours_rejected' ||
        n.type === 'project_approved' || n.type === 'project_rejected' ||
        n.type === 'request_approved' || n.type === 'request_rejected'
      );
      case 'projects': return notifications.filter((n: any) =>
        n.type === 'project_update' || n.type === 'new_project'
      );
      default: return notifications;
    }
  };

  if (isLoading) {
    return (
      <>
        <VolunteerHeader title="Notifications" subtitle="Loading..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <VolunteerHeader title="Notifications" subtitle="Error loading notifications" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-destructive mb-4">Failed to load notifications. Please try again.</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <VolunteerHeader title="Notifications" subtitle={`${unreadCount} unread notifications`} />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">{notifications.length} total notifications</span>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-primary border-primary"
              disabled={markAllAsRead.isPending}
            >
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread {unreadCount > 0 && <Badge className="ml-1 bg-primary text-primary-foreground h-5 w-5 p-0 text-xs">{unreadCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>

          {['all', 'unread', 'approvals', 'projects'].map((filter) => (
            <TabsContent key={filter} value={filter} className="mt-6">
              <div className="space-y-3">
                {filterNotifications(filter).map((notification: any) => (
                  <Card
                    key={notification.id}
                    className={`transition-all ${!notification.read ? 'border-l-4 border-l-primary bg-accent/30' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  disabled={markAsRead.isPending}
                                >
                                  <Check className="w-4 h-4 text-primary" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDelete(notification.id)}
                                disabled={deleteNotification.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filterNotifications(filter).length === 0 && (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No notifications found.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
};

export default VolunteerNotifications;