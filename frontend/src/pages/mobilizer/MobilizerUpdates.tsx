import MobilizerHeader from '@/components/layout/MobilizerHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  Info,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  Check,
  Loader2
} from 'lucide-react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '@/hooks/useNotifications';

const MobilizerUpdates = () => {
  // Fetch real notifications from MongoDB
  const { data: notificationsData, isLoading } = useNotifications(undefined, 50);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  // Helper to format time ago
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

  // Transform backend notifications
  const notifications = (notificationsData?.data || []).map((n: any) => ({
    id: n._id,
    title: n.title || 'Notification',
    description: n.message || '',
    time: n.createdAt ? formatTimeAgo(n.createdAt) : 'Recently',
    type: n.type || 'info',
    read: n.read || false,
  }));


  const teamMessages = [
    {
      id: 1,
      sender: 'Admin Office',
      message: 'All mobilizers please submit your December reports by the 20th.',
      time: '1 hour ago',
    },
    {
      id: 2,
      sender: 'Project Coordinator',
      message: 'Great job on the Health Camp! The community feedback has been excellent.',
      time: '4 hours ago',
    },
    {
      id: 3,
      sender: 'HR Department',
      message: 'New volunteer orientation session scheduled for next Monday.',
      time: '1 day ago',
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'important': return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'warning': return <Clock className="w-5 h-5 text-warning" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-success" />;
      default: return <Info className="w-5 h-5 text-mobilizer" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'important': return 'bg-destructive/10 text-destructive';
      case 'warning': return 'bg-warning/10 text-warning-foreground';
      case 'success': return 'bg-success/10 text-success';
      default: return 'bg-mobilizer/10 text-mobilizer';
    }
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotification.mutate(id);
  };

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  if (isLoading) {
    return (
      <>
        <MobilizerHeader title="Updates" subtitle="Loading..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-mobilizer" />
        </div>
      </>
    );
  }

  return (

    <>
      <MobilizerHeader title="Updates" subtitle="Announcements and notifications" />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <Tabs defaultValue="notifications" className="space-y-4">
          <TabsList>
            <TabsTrigger value="notifications" className="relative">
              Notifications
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-mobilizer text-mobilizer-foreground h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="team">Team Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {unreadCount} unread notifications
              </p>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="text-mobilizer" onClick={handleMarkAllAsRead}>
                  <Check className="w-4 h-4 mr-1" /> Mark all as read
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`transition-all ${!notification.read ? 'border-l-4 border-l-mobilizer bg-mobilizer-accent/30' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground">{notification.title}</h4>
                          <Badge className={getTypeBadgeColor(notification.type)}>
                            {notification.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-mobilizer hover:bg-mobilizer-accent"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>

                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-mobilizer" />
                  Organization Announcements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-destructive/10 text-destructive">Important</Badge>
                    <span className="text-xs text-muted-foreground">Dec 8, 2024</span>
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">New Safety Guidelines Released</h4>
                  <p className="text-sm text-muted-foreground">
                    All mobilizers and volunteers must review and acknowledge the updated safety protocols
                    before participating in any field activities. The new guidelines include updated
                    emergency procedures and health screening requirements.
                  </p>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-mobilizer/10 text-mobilizer">Update</Badge>
                    <span className="text-xs text-muted-foreground">Dec 5, 2024</span>
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">Monthly Report Deadline Extended</h4>
                  <p className="text-sm text-muted-foreground">
                    The deadline for December monthly reports has been extended to December 25th.
                    Please ensure all project updates and volunteer hours are accurately recorded.
                  </p>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-success/10 text-success">Event</Badge>
                    <span className="text-xs text-muted-foreground">Dec 3, 2024</span>
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">Training Session Next Week</h4>
                  <p className="text-sm text-muted-foreground">
                    Mandatory training session for all mobilizers scheduled for December 12th.
                    Topics include volunteer management best practices and new reporting tools.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team Messages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {teamMessages.map((msg) => (
                  <div key={msg.id} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{msg.sender}</span>
                      <span className="text-xs text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{msg.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default MobilizerUpdates;
