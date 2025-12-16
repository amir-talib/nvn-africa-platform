import { useNavigate } from 'react-router-dom';
import MobilizerHeader from '@/components/layout/MobilizerHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Users,
  MapPin,
  ArrowRight,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useProjects, useProjectVolunteers } from '@/hooks/useProjects';

const MobilizerProjects = () => {
  const navigate = useNavigate();

  // Fetch real projects from MongoDB
  const { data: projectsData, isLoading, error } = useProjects();

  // Safely extract projects array - API may return array directly or wrapped in object
  const projectsList: any[] = Array.isArray(projectsData) ? projectsData : (projectsData?.data as any[] || []);

  // Transform backend data to component format
  const projects = projectsList.map((project: any) => ({
    id: project._id,
    name: project.title,
    description: project.description,
    status: project.status || 'upcoming',
    progress: project.status === 'completed' ? 100 : project.status === 'ongoing' || project.status === 'active' ? 50 : 0,
    startDate: project.start_date ? new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
    endDate: project.end_date ? new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
    location: project.location || 'Location TBD',
    volunteers: project.volunteers?.length || 0,
    maxVolunteers: project.neededVolunteers || 10,
    tasks: { completed: 0, total: project.requirements?.length || 0 },
    teamMembers: (project.volunteers || []).slice(0, 4).map((v: any) =>
      v.firstname && v.lastname ? `${v.firstname[0]}${v.lastname[0]}` : 'V'
    ),
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': case 'active': return 'bg-mobilizer/10 text-mobilizer border-mobilizer/30';
      case 'upcoming': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'completed': return 'bg-success/10 text-success border-success/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filterProjects = (status: string) => {
    if (status === 'all') return projects;
    if (status === 'ongoing') return projects.filter((p: any) => p.status === 'ongoing' || p.status === 'active');
    return projects.filter((p: any) => p.status === status);
  };

  const ProjectCard = ({ project }: { project: typeof projects[0] }) => (
    <Card className="hover:border-mobilizer/50 transition-all hover-scale cursor-pointer" onClick={() => navigate(`/mobilizer/projects/${project.id}`)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg text-foreground">{project.name}</h3>
              <Badge variant="outline" className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{project.startDate} - {project.endDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{project.location}</span>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{project.volunteers}/{project.maxVolunteers} volunteers</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{project.tasks.completed}/{project.tasks.total} tasks</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {project.teamMembers.slice(0, 4).map((member: string, index: number) => (
              <Avatar key={index} className="w-8 h-8 border-2 border-background">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-mobilizer text-mobilizer-foreground text-xs">
                  {member}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.teamMembers.length > 4 && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground border-2 border-background">
                +{project.teamMembers.length - 4}
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" className="text-mobilizer hover:bg-mobilizer-accent" onClick={(e) => { e.stopPropagation(); navigate(`/mobilizer/projects/${project.id}`); }}>
            View Details <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <>
        <MobilizerHeader title="Projects" subtitle="Loading projects..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-mobilizer" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <MobilizerHeader title="Projects" subtitle="Error loading projects" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-destructive mb-4">Failed to load projects. Please try again.</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <MobilizerHeader title="Projects" subtitle="Projects you're supporting" />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{projects.length}</p>
              <p className="text-sm text-muted-foreground">Total Projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-mobilizer">{filterProjects('ongoing').length}</p>
              <p className="text-sm text-muted-foreground">Ongoing</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-500">{filterProjects('upcoming').length}</p>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">{filterProjects('completed').length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {filterProjects('all').length > 0 ? (
                filterProjects('all').map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <p className="text-muted-foreground">No projects found.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ongoing" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {filterProjects('ongoing').length > 0 ? (
                filterProjects('ongoing').map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <p className="text-muted-foreground">No ongoing projects.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {filterProjects('upcoming').length > 0 ? (
                filterProjects('upcoming').map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <p className="text-muted-foreground">No upcoming projects.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {filterProjects('completed').length > 0 ? (
                filterProjects('completed').map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <p className="text-muted-foreground">No completed projects.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default MobilizerProjects;
