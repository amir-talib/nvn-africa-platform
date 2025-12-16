import { useState } from 'react';
import { Plus, Users, FolderKanban, ClipboardCheck, CheckCircle, TrendingUp, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProjectFormModal } from '@/components/modals/ProjectFormModal';
import { Button } from '@/components/ui/button';
import { useStats, useProjects, useProjectRequests } from '@/hooks/useProjects';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

export default function Dashboard() {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const navigate = useNavigate();

  // Fetch data from API
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: requests = [], isLoading: requestsLoading } = useProjectRequests();

  const pendingRequests = requests.filter((r: any) => r.status === 'pending');
  const recentProjects = projects.slice(0, 5);

  // Calculate progress based on dates
  const calculateProgress = (startDate: string, endDate: string, status: string) => {
    if (status === 'completed') return 100;
    if (status === 'upcoming') return 0;

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();

    if (now <= start) return 0;
    if (now >= end) return 100;

    return Math.round(((now - start) / (end - start)) * 100);
  };

  const statusColors: Record<string, string> = {
    ongoing: 'bg-success/10 text-success border-success/20',
    completed: 'bg-muted text-muted-foreground border-muted',
    upcoming: 'bg-warning/10 text-warning border-warning/20',
  };

  return (
    <DashboardLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          title="Total Volunteers"
          value={statsLoading ? null : stats?.activeVolunteers || 0}
          icon={Users}
          variant="primary"
          link="/volunteers"
        />
        <StatCard
          title="Active Projects"
          value={statsLoading ? null : stats?.totalProjects || 0}
          icon={FolderKanban}
          variant="secondary"
          link="/projects"
        />
        <StatCard
          title="Pending Requests"
          value={statsLoading ? null : stats?.pendingRequests || 0}
          icon={ClipboardCheck}
          variant="warning"
          link="/requests"
        />
        <StatCard
          title="Completed Projects"
          value={statsLoading ? null : stats?.projectsCompleted || 0}
          icon={CheckCircle}
          link="/projects"
        />
        <StatCard
          title="Lives Impacted"
          value={statsLoading ? null : stats?.livesImpacted || 0}
          icon={TrendingUp}
          link="/performance"
        />
      </div>

      {/* Projects Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Projects</h2>
          <Button
            onClick={() => setShowProjectModal(true)}
            className="gradient-primary text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>

        <div className="rounded-xl bg-card card-shadow overflow-hidden">
          {projectsLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No projects yet. Create your first project!
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentProjects.map((project: any) => {
                const progress = calculateProgress(project.start_date, project.end_date, project.status);
                return (
                  <div
                    key={project._id}
                    className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/projects/${project._id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{project.title}</h3>
                          <Badge variant="outline" className={statusColors[project.status] || 'bg-muted'}>
                            {project.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <div className="hidden sm:flex items-center gap-2">
                          <Progress value={progress} className="h-2 w-20" />
                          <span className="text-sm text-muted-foreground">{progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pending Requests Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-card card-shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Pending Requests</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/requests')}>
              View All
            </Button>
          </div>

          {requestsLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No pending requests
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.slice(0, 5).map((request: any) => (
                <div key={request._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={request.volunteer?.profile_picture} />
                    <AvatarFallback>
                      {request.volunteer?.firstname?.[0]}{request.volunteer?.lastname?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {request.volunteer?.firstname} {request.volunteer?.lastname}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {request.project?.title || 'Unknown Project'}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                    Pending
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="rounded-xl bg-card card-shadow p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Platform Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-muted-foreground">Total Projects</span>
              <span className="font-bold text-lg">{stats?.totalProjects || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-muted-foreground">Completed Projects</span>
              <span className="font-bold text-lg text-success">{stats?.projectsCompleted || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-muted-foreground">Communities Reached</span>
              <span className="font-bold text-lg">{stats?.communitiesReached || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-muted-foreground">Total Requests</span>
              <span className="font-bold text-lg">{stats?.totalRequests || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <ProjectFormModal open={showProjectModal} onClose={() => setShowProjectModal(false)} />
    </DashboardLayout>
  );
}
