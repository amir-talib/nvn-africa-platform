import { useNavigate } from 'react-router-dom';
import MobilizerHeader from '@/components/layout/MobilizerHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  FolderKanban,
  Clock,
  CheckCircle,
  ArrowRight,
  Calendar,
  MessageSquare,
  Bell,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useProfile } from '@/hooks/useUser';
import { useProjects, useStats, useProjectRequests } from '@/hooks/useProjects';
import { useNotifications } from '@/hooks/useNotifications';
import { usePendingHours } from '@/hooks/useHours';

const MobilizerDashboard = () => {
  const navigate = useNavigate();

  // Fetch real data from MongoDB
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: statsData, isLoading: statsLoading } = useStats();
  const { data: projectsData, isLoading: projectsLoading } = useProjects();
  const { data: pendingRequestsData } = useProjectRequests('pending');
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications(undefined, 5);
  const { data: pendingHoursData } = usePendingHours();

  const isLoading = profileLoading || statsLoading || projectsLoading;

  // Safely extract projects array - API may return array directly or wrapped in object
  const projectsList: any[] = Array.isArray(projectsData) ? projectsData : (projectsData?.data as any[] || []);
  const pendingRequestsList: any[] = Array.isArray(pendingRequestsData) ? pendingRequestsData : (pendingRequestsData?.data as any[] || []);
  const notificationsList: any[] = Array.isArray(notificationsData?.data) ? notificationsData.data : [];

  // Compute stats from real data
  const stats = [
    {
      icon: Users,
      label: 'Active Volunteers',
      value: statsData?.activeVolunteers?.toString() || '0',
      change: `${statsData?.totalRequests || 0} total requests`,
      color: 'bg-mobilizer'
    },
    {
      icon: FolderKanban,
      label: 'Active Projects',
      value: projectsList.filter((p: any) => p.status === 'ongoing' || p.status === 'active').length.toString(),
      change: `${projectsList.length} total`,
      color: 'bg-blue-500'
    },
    {
      icon: Clock,
      label: 'Pending Requests',
      value: (pendingRequestsList.length || statsData?.pendingRequests || 0).toString(),
      change: 'Needs attention',
      color: 'bg-warning'
    },
    {
      icon: CheckCircle,
      label: 'Projects Completed',
      value: statsData?.projectsCompleted?.toString() || '0',
      change: 'All time',
      color: 'bg-success'
    },
  ];

  // Get recent projects (limit to 3)
  const recentProjects = projectsList
    .slice(0, 3)
    .map((project: any) => ({
      id: project._id,
      name: project.title,
      status: project.status,
      progress: project.status === 'completed' ? 100 : project.status === 'ongoing' ? 50 : 0,
      volunteers: project.volunteers?.length || 0,
      date: project.start_date ? new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'
    }));

  // Get recent notifications as announcements
  const announcements = (notificationsData?.data || [])
    .slice(0, 3)
    .map((notification: any) => ({
      id: notification._id,
      title: notification.title || notification.message,
      time: notification.createdAt ? formatTimeAgo(notification.createdAt) : 'Recently',
      type: notification.type === 'important' ? 'important' : 'info'
    }));

  // Get pending hours count for tasks
  const pendingHoursCount = pendingHoursData?.data?.length || 0;

  // Helper function to format time ago
  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': case 'active': return 'bg-mobilizer/10 text-mobilizer';
      case 'upcoming': return 'bg-blue-500/10 text-blue-500';
      case 'completed': return 'bg-success/10 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <>
        <MobilizerHeader title="Dashboard" subtitle="Loading..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-mobilizer" />
        </div>
      </>
    );
  }

  return (
    <>
      <MobilizerHeader title="Dashboard" subtitle={`Welcome back, ${profile?.firstname || 'Mobilizer'}!`} />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tasks for the Week */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Pending Actions</CardTitle>
              <Button variant="ghost" size="sm" className="text-mobilizer" onClick={() => navigate('/mobilizer/hours-verification')}>
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingHoursCount > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/mobilizer/hours-verification')}>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-warning" />
                    <span className="text-sm text-foreground">Verify {pendingHoursCount} pending hour submissions</span>
                  </div>
                  <Badge variant="secondary" className="bg-warning/10 text-warning-foreground">
                    {pendingHoursCount} pending
                  </Badge>
                </div>
              )}
              {(pendingRequestsData?.length || 0) > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/mobilizer/requests')}>
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-mobilizer" />
                    <span className="text-sm text-foreground">Review {pendingRequestsData?.length || 0} project join requests</span>
                  </div>
                  <Badge variant="secondary" className="bg-mobilizer/10 text-mobilizer">
                    {pendingRequestsData?.length || 0} pending
                  </Badge>
                </div>
              )}
              {pendingHoursCount === 0 && (pendingRequestsData?.length || 0) === 0 && (
                <div className="flex items-center justify-center py-8 text-center">
                  <div>
                    <CheckCircle className="w-12 h-12 text-success/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">All caught up! No pending actions.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-mobilizer" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {announcements.length > 0 ? (
                announcements.map((item: any) => (
                  <div key={item.id} className="border-l-2 border-mobilizer pl-3 py-1">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No new notifications</p>
                </div>
              )}
              <Button variant="outline" className="w-full text-mobilizer border-mobilizer hover:bg-mobilizer-accent" onClick={() => navigate('/notifications')}>
                View All Updates
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Project Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Project Overview</CardTitle>
              <Button variant="ghost" size="sm" className="text-mobilizer" onClick={() => navigate('/mobilizer/projects')}>
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentProjects.length > 0 ? (
                recentProjects.map((project: any) => (
                  <div
                    key={project.id}
                    className="p-4 border border-border rounded-lg hover:border-mobilizer/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/mobilizer/projects/${project.id}`)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-foreground">{project.name}</h4>
                      <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-foreground">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {project.volunteers} volunteers
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {project.date}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center py-8 text-center">
                  <div>
                    <FolderKanban className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No projects yet</p>
                    <Button variant="outline" className="mt-3 text-mobilizer border-mobilizer" onClick={() => navigate('/mobilizer/projects')}>
                      Browse Projects
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Messages Preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-mobilizer" />
                Team Messages
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-mobilizer" onClick={() => navigate('/mobilizer/messages')}>
                Open Messages <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8 text-center">
                <div>
                  <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No new messages</p>
                  <Button variant="outline" className="mt-3 text-mobilizer border-mobilizer hover:bg-mobilizer-accent" onClick={() => navigate('/mobilizer/messages')}>
                    Start a Conversation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MobilizerDashboard;
