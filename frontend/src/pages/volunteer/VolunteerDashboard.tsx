import { useNavigate } from 'react-router-dom';
import VolunteerHeader from '@/components/layout/VolunteerHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  FolderKanban,
  Clock,
  Calendar,
  ArrowRight,
  MapPin,
  Users,
  Star,
  Bell,
  Loader2
} from 'lucide-react';
import { useProfile } from '@/hooks/useUser';
import { useProjects } from '@/hooks/useProjects';
import { useNotifications } from '@/hooks/useNotifications';
import { useMyHours } from '@/hooks/useHours';

const VolunteerDashboard = () => {
  const navigate = useNavigate();

  // Fetch real data from MongoDB
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: projectsData, isLoading: projectsLoading } = useProjects();
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications(undefined, 5);
  const { data: hoursData, isLoading: hoursLoading } = useMyHours();

  const isLoading = profileLoading || projectsLoading;

  // Calculate stats from real data
  const totalHours = hoursData?.data?.stats?.total_verified || 0;
  const pendingHours = hoursData?.data?.stats?.total_pending || 0;
  const projectsCount = profile?.no_of_projects_done || 0;

  // Safely extract projects array - API may return array directly or wrapped in object
  const projectsList = Array.isArray(projectsData) ? projectsData : (projectsData?.data || []);
  const upcomingProjects = projectsList.filter((p: any) => p.status === 'upcoming').length;

  const stats = [
    { icon: FolderKanban, label: 'Projects Joined', value: projectsCount.toString(), color: 'bg-primary' },
    { icon: Clock, label: 'Hours Volunteered', value: totalHours.toString(), color: 'bg-success' },
    { icon: Calendar, label: 'Upcoming Projects', value: upcomingProjects.toString(), color: 'bg-warning' },
    { icon: Star, label: 'Rank', value: profile?.rank?.replace(/_/g, ' ') || 'Starter', color: 'bg-blue-500' },
  ];

  // Safely extract notifications array
  const notificationsList = Array.isArray(notificationsData?.data) ? notificationsData.data : (notificationsData?.data?.notifications || []);

  // Get available projects (limit to 3)
  const availableProjects = projectsList
    .filter((p: any) => p.status === 'upcoming' || p.status === 'active' || p.status === 'ongoing')
    .slice(0, 3)
    .map((project: any) => ({
      id: project._id,
      name: project.title,
      description: project.description,
      location: project.location || 'Location TBD',
      date: project.start_date ? new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
      volunteersNeeded: project.neededVolunteers || 10,
      category: getCategoryFromProject(project),
    }));

  // Get recent notifications
  const notifications = notificationsList
    .slice(0, 3)
    .map((notification: any) => ({
      id: notification._id,
      message: notification.title || notification.message,
      time: notification.createdAt ? formatTimeAgo(notification.createdAt) : 'Recently',
      type: notification.type || 'info',
    }));

  // Helper to determine category from project
  function getCategoryFromProject(project: any): string {
    const title = (project.title || '').toLowerCase();
    if (title.includes('health')) return 'Health';
    if (title.includes('education') || title.includes('school')) return 'Education';
    if (title.includes('environment') || title.includes('clean')) return 'Environment';
    if (title.includes('community')) return 'Community';
    return 'General';
  }

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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Health': return 'bg-success/10 text-success';
      case 'Education': return 'bg-primary/10 text-primary';
      case 'Environment': return 'bg-green-500/10 text-green-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Calculate progress for volunteer journey
  const hoursGoal = 200;
  const projectsGoal = 10;
  const hoursProgress = Math.min((totalHours / hoursGoal) * 100, 100);
  const projectsProgress = Math.min((projectsCount / projectsGoal) * 100, 100);

  if (isLoading) {
    return (
      <>
        <VolunteerHeader title="Dashboard" subtitle="Loading..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <VolunteerHeader title="Dashboard" subtitle={`Welcome back, ${profile?.firstname || 'Volunteer'}!`} />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1 capitalize">{stat.value}</p>
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
          {/* Available Projects */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Available Projects</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate('/volunteer/projects')}>
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableProjects.length > 0 ? (
                availableProjects.map((project: any) => (
                  <div
                    key={project.id}
                    className="p-4 border border-border rounded-xl hover:border-primary/50 cursor-pointer transition-all"
                    onClick={() => navigate(`/volunteer/projects/${project.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-foreground">{project.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                      </div>
                      <Badge className={getCategoryColor(project.category)}>{project.category}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {project.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {project.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" /> {project.volunteersNeeded} needed
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FolderKanban className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No available projects at the moment.</p>
                  <Button variant="outline" className="mt-3" onClick={() => navigate('/volunteer/projects')}>
                    Browse All Projects
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sidebar Cards */}
          <div className="space-y-6">
            {/* Recent Notifications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.length > 0 ? (
                  notifications.map((notification: any) => (
                    <div key={notification.id} className="border-l-2 border-primary pl-3 py-1">
                      <p className="text-sm text-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No new notifications</p>
                )}
                <Button
                  variant="outline"
                  className="w-full text-primary border-primary hover:bg-accent"
                  onClick={() => navigate('/volunteer/notifications')}
                >
                  View All
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Volunteer Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Volunteering Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Hours Goal ({hoursGoal} hrs)</span>
                  <span className="font-medium text-foreground">{Math.round(hoursProgress)}%</span>
                </div>
                <Progress value={hoursProgress} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">{totalHours} of {hoursGoal} hours</p>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Projects Goal ({projectsGoal})</span>
                  <span className="font-medium text-foreground">{Math.round(projectsProgress)}%</span>
                </div>
                <Progress value={projectsProgress} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">{projectsCount} of {projectsGoal} projects</p>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Current Rank</span>
                  <span className="font-medium text-foreground capitalize">{profile?.rank?.replace(/_/g, ' ') || 'Starter'}</span>
                </div>
                <Progress value={getRankProgress(profile?.rank)} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">{getNextRank(profile?.rank)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

// Helper functions for rank progress
function getRankProgress(rank?: string): number {
  switch (rank) {
    case 'impact_ambassador': return 100;
    case 'regional_mobilizer': return 80;
    case 'community_leader': return 60;
    case 'active_volunteer': return 40;
    default: return 20;
  }
}

function getNextRank(rank?: string): string {
  switch (rank) {
    case 'impact_ambassador': return 'Highest rank achieved!';
    case 'regional_mobilizer': return '300 more hours for Impact Ambassador';
    case 'community_leader': return '100 more hours for Regional Mobilizer';
    case 'active_volunteer': return '75 more hours for Community Leader';
    default: return '25 hours for Active Volunteer';
  }
}

export default VolunteerDashboard;