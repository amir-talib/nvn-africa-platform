import { useParams, useNavigate } from 'react-router-dom';
import VolunteerHeader from '@/components/layout/VolunteerHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  Mail,
  Phone,
  Target,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useProjectById, useProjectVolunteers } from '@/hooks/useProjects';
import { api } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const VolunteerProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real project data from MongoDB
  const { data: project, isLoading, error } = useProjectById(id);
  const { data: volunteers } = useProjectVolunteers(id);

  // Join project mutation
  const joinProject = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await api.post(`/project/project-request/${projectId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["my-approved-projects"] });
      toast({
        title: "Request Submitted!",
        description: "Your request to join this project has been sent. You'll be notified once it's reviewed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to submit join request.",
        variant: "destructive",
      });
    },
  });

  const handleJoinRequest = () => {
    if (id) {
      joinProject.mutate(id);
    }
  };

  // Helper functions
  function formatDate(dateString?: string): string {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function getDuration(startDate?: string, endDate?: string): string {
    if (!startDate || !endDate) return 'TBD';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays === 1) return '1 day';
    if (diffDays <= 7) return `${diffDays} days`;
    return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''}`;
  }

  function getCategoryFromProject(proj: any): string {
    const title = (proj?.title || '').toLowerCase();
    const desc = (proj?.description || '').toLowerCase();
    const combined = title + ' ' + desc;
    if (combined.includes('health') || combined.includes('medical')) return 'Health';
    if (combined.includes('education') || combined.includes('school')) return 'Education';
    if (combined.includes('environment') || combined.includes('clean')) return 'Environment';
    if (combined.includes('community') || combined.includes('empowerment')) return 'Community';
    return 'General';
  }

  if (isLoading) {
    return (
      <>
        <VolunteerHeader title="Project Details" subtitle="Loading..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (error || !project) {
    return (
      <>
        <VolunteerHeader title="Project Details" subtitle="Project not found" />
        <div className="flex-1 overflow-auto p-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/volunteer/projects')}
            className="text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <p className="text-destructive mb-4">Failed to load project details. The project may not exist.</p>
              <Button onClick={() => navigate('/volunteer/projects')}>Back to Projects</Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Derived values
  const category = getCategoryFromProject(project);
  const totalVolunteers = project.neededVolunteers || 10;
  const currentVolunteers = project.volunteers?.length || volunteers?.length || 0;
  const spotsRemaining = Math.max(0, totalVolunteers - currentVolunteers);
  const progressPercent = Math.min((currentVolunteers / totalVolunteers) * 100, 100);
  const duration = getDuration(project.start_date, project.end_date);

  // Default responsibilities if not in project
  const responsibilities = [
    'Follow project guidelines and coordinator instructions',
    'Complete assigned tasks within schedule',
    'Document your activities and hours',
    'Collaborate with fellow volunteers',
    'Represent the organization professionally'
  ];

  // Skills that will be gained
  const skills = ['Teamwork', 'Communication', 'Problem Solving', 'Leadership'];

  return (
    <>
      <VolunteerHeader title="Project Details" subtitle={project.title} />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/volunteer/projects')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>

        {/* Project Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-2xl font-bold text-foreground">{project.title}</h2>
                  <Badge className="bg-primary/10 text-primary">{category}</Badge>
                  <Badge className={`${project.status === 'upcoming' ? 'bg-warning/10 text-warning-foreground' :
                    project.status === 'ongoing' || project.status === 'active' ? 'bg-success/10 text-success' :
                      'bg-muted text-muted-foreground'}`}>
                    {project.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">{project.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{project.location || 'Location TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{formatDate(project.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{currentVolunteers}/{totalVolunteers} volunteers</span>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                onClick={handleJoinRequest}
                disabled={joinProject.isPending}
              >
                {joinProject.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Request to Join'
                )}
              </Button>
            </div>

            {/* Progress */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Volunteer Slots</span>
                <span className="text-foreground font-medium">{spotsRemaining} spots remaining</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Requirements */}
            {project.requirements && project.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {project.requirements.map((req: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                        <span className="text-sm text-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Responsibilities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Your Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm text-foreground">{resp}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Project Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <div className="absolute top-3 left-1 w-0.5 h-8 bg-border" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Start Date</p>
                      <p className="text-sm text-muted-foreground">{formatDate(project.start_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">End Date</p>
                      <p className="text-sm text-muted-foreground">{formatDate(project.end_date)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Lead - use project_lead if populated */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Lead</CardTitle>
              </CardHeader>
              <CardContent>
                {project.project_lead && typeof project.project_lead === 'object' ? (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={project.project_lead.profile_picture || "/placeholder.svg"} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {(project.project_lead.firstname?.[0] || 'P')}{(project.project_lead.lastname?.[0] || 'L')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">
                          {project.project_lead.firstname} {project.project_lead.lastname}
                        </p>
                        <p className="text-sm text-muted-foreground">Project Coordinator</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      {project.project_lead.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span>{project.project_lead.email}</span>
                        </div>
                      )}
                      {project.project_lead.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{project.project_lead.phone}</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Project lead information not available</p>
                )}
              </CardContent>
            </Card>

            {/* Skills You'll Gain */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Skills You'll Gain</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-accent text-accent-foreground">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Date</span>
                  <span className="font-medium text-foreground">{formatDate(project.start_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End Date</span>
                  <span className="font-medium text-foreground">{formatDate(project.end_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium text-foreground">{duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Spots Left</span>
                  <span className="font-medium text-primary">{spotsRemaining}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default VolunteerProjectDetails;