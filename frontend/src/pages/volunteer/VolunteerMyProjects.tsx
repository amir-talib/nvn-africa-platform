import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VolunteerHeader from '@/components/layout/VolunteerHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Users,
  Loader2,
  FolderKanban
} from 'lucide-react';
import { useMyApprovedProjects } from '@/hooks/useProjects';
import { useMyHours } from '@/hooks/useHours';

const VolunteerMyProjects = () => {
  const navigate = useNavigate();

  // Fetch real data from MongoDB
  const { data: projectsData, isLoading: projectsLoading, error } = useMyApprovedProjects();
  const { data: hoursData, isLoading: hoursLoading } = useMyHours();

  const isLoading = projectsLoading || hoursLoading;

  // Transform project data
  const projects = (projectsData || []).map((project: any) => ({
    id: project._id,
    name: project.title,
    description: project.description || 'No description available',
    status: project.status || 'upcoming',
    progress: getProjectProgress(project),
    location: project.location || 'Location TBD',
    date: formatProjectDate(project.start_date, project.end_date),
    hoursLogged: 0, // Will get from hours data
    tasksCompleted: 0,
    totalTasks: project.requirements?.length || 5,
    role: 'Volunteer'
  }));

  // Calculate hours per project from hoursData
  const hoursEntries = hoursData?.data?.hours || [];
  projects.forEach((project: any) => {
    const projectHours = hoursEntries
      .filter((h: any) => h.project?._id === project.id && h.status === 'verified')
      .reduce((sum: number, h: any) => sum + (h.hours || 0), 0);
    project.hoursLogged = projectHours;
  });

  function formatProjectDate(startDate?: string, endDate?: string): string {
    if (!startDate) return 'Date TBD';
    const start = new Date(startDate);
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (!endDate) return startStr;
    const end = new Date(endDate);
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  }

  function getProjectProgress(project: any): number {
    switch (project.status) {
      case 'completed': return 100;
      case 'ongoing':
      case 'active': return 50;
      case 'upcoming': return 0;
      default: return 0;
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
      case 'active': return 'bg-primary/10 text-primary';
      case 'pending':
      case 'upcoming': return 'bg-warning/10 text-warning-foreground';
      case 'completed': return 'bg-success/10 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filterProjects = (status: string) => {
    if (status === 'all') return projects;
    if (status === 'ongoing') return projects.filter((p: any) => p.status === 'ongoing' || p.status === 'active');
    if (status === 'pending') return projects.filter((p: any) => p.status === 'upcoming');
    return projects.filter((p: any) => p.status === status);
  };

  const stats = {
    ongoing: projects.filter((p: any) => p.status === 'ongoing' || p.status === 'active').length,
    pending: projects.filter((p: any) => p.status === 'upcoming').length,
    completed: projects.filter((p: any) => p.status === 'completed').length,
    totalHours: hoursData?.data?.stats?.total_verified || 0
  };

  const ProjectCard = ({ project }: { project: typeof projects[0] }) => (
    <Card
      className="hover:border-primary/50 cursor-pointer transition-all"
      onClick={() => navigate(`/volunteer/projects/${project.id}`)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{project.name}</h3>
              <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" /> {project.location}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" /> {project.date}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" /> {project.role}
          </span>
        </div>

        {project.status !== 'upcoming' && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-4 h-4" /> {project.hoursLogged} hours logged
              </span>
            </div>
          </div>
        )}

        {project.status === 'upcoming' && (
          <div className="flex items-center gap-2 text-warning-foreground bg-warning/10 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Project starting soon</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <>
        <VolunteerHeader title="My Projects" subtitle="Loading..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <VolunteerHeader title="My Projects" subtitle="Error loading projects" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-destructive mb-4">Failed to load your projects. Please try again.</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <VolunteerHeader title="My Projects" subtitle="Track your volunteering journey" />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.ongoing}</p>
              <p className="text-sm text-muted-foreground">Ongoing</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-warning">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{stats.totalHours}</p>
              <p className="text-sm text-muted-foreground">Total Hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
            <TabsTrigger value="pending">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {['all', 'ongoing', 'pending', 'completed'].map((status) => (
            <TabsContent key={status} value={status} className="mt-6">
              <div className="grid md:grid-cols-2 gap-4">
                {filterProjects(status).map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
              {filterProjects(status).length === 0 && (
                <div className="text-center py-12">
                  <FolderKanban className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {status === 'all'
                      ? "You haven't joined any projects yet."
                      : `No ${status === 'pending' ? 'upcoming' : status} projects found.`}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 text-primary border-primary"
                    onClick={() => navigate('/volunteer/projects')}
                  >
                    Browse Available Projects
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
};

export default VolunteerMyProjects;