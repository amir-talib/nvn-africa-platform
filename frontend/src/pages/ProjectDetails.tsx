import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, MapPin, Clock, Loader2, Users, CheckCircle, Play, Check } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useProjectById, useProjectVolunteers } from '@/hooks/useProjects';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

const statusColors: Record<string, string> = {
  ongoing: 'bg-success/10 text-success border-success/20',
  active: 'bg-success/10 text-success border-success/20',
  completed: 'bg-muted text-muted-foreground border-muted',
  upcoming: 'bg-warning/10 text-warning border-warning/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
};

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch project and volunteers from API
  const { data: project, isLoading: projectLoading, error: projectError } = useProjectById(id);
  const { data: volunteers = [], isLoading: volunteersLoading } = useProjectVolunteers(id);

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

  const handleStatusChange = async (newStatus: string) => {
    if (!project?._id) return;

    try {
      await api.put(`/project/${newStatus}-project/${project._id}`, {});
      toast.success(`Project marked as ${newStatus}`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["project", id] }),
        queryClient.invalidateQueries({ queryKey: ["stats"] }),
      ]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Failed to update project status`);
    }
  };

  if (projectLoading) {
    return (
      <DashboardLayout title="Project Details">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (projectError || !project) {
    return (
      <DashboardLayout title="Project Not Found">
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const progress = calculateProgress(project.start_date, project.end_date, project.status);
  const daysRemaining = project.end_date
    ? Math.max(0, Math.ceil((new Date(project.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <DashboardLayout title="Project Details">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/projects')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Projects
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="rounded-xl bg-card card-shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge variant="outline" className={statusColors[project.status] || statusColors.pending}>
                  {project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
                </Badge>
                <h1 className="text-2xl font-bold text-foreground mt-2">{project.title}</h1>
              </div>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>

            <p className="text-muted-foreground mb-6">{project.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">
                  {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-destructive" />
                <span className="text-muted-foreground">
                  {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'TBD'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-secondary" />
                <span className="text-muted-foreground">{project.location || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-warning" />
                <span className="text-muted-foreground">{volunteers.length} volunteers</span>
              </div>
            </div>
          </div>

          {/* Progress Card */}
          <div className="rounded-xl bg-card card-shadow p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Project Progress</h3>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall Completion</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {/* Status Actions */}
            <div className="flex flex-wrap gap-2">
              {project.status === 'upcoming' && (
                <Button
                  onClick={() => handleStatusChange('ongoing')}
                  className="bg-success hover:bg-success/90"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Project
                </Button>
              )}
              {project.status === 'ongoing' && (
                <Button
                  onClick={() => handleStatusChange('completed')}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
              )}
            </div>
          </div>

          {/* Requirements Card */}
          {project.requirements && project.requirements.length > 0 && (
            <div className="rounded-xl bg-card card-shadow p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Requirements</h3>
              <div className="space-y-2">
                {project.requirements.map((req: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm">{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Volunteers Card */}
          <div className="rounded-xl bg-card card-shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Assigned Volunteers</h3>
              <Badge variant="secondary">{volunteers.length} assigned</Badge>
            </div>
            {volunteersLoading ? (
              <div className="flex items-center justify-center h-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : volunteers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No volunteers assigned yet</p>
            ) : (
              <div className="space-y-3">
                {volunteers.map((volunteer: any) => (
                  <div
                    key={volunteer._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/volunteers/${volunteer._id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={volunteer.profile_picture} />
                        <AvatarFallback>
                          {volunteer.firstname?.[0]}{volunteer.lastname?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {volunteer.firstname} {volunteer.lastname}
                        </p>
                        <p className="text-sm text-muted-foreground">{volunteer.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {volunteer.rank || 'Volunteer'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="rounded-xl bg-card card-shadow p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className={statusColors[project.status] || statusColors.pending}>
                  {project.status}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Volunteers</span>
                <span className="font-semibold text-foreground">{volunteers.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Needed Volunteers</span>
                <span className="font-semibold text-foreground">{project.neededVolunteers || 'Not set'}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold text-foreground">{progress}%</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Days Remaining</span>
                <span className="font-semibold text-foreground">{daysRemaining}</span>
              </div>
            </div>
          </div>

          {/* Project Info */}
          <div className="rounded-xl bg-card card-shadow p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Project Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Community</p>
                <p className="font-medium">{project.community || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Beneficiaries</p>
                <p className="font-medium">{project.beneficiariesCount || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          {project.location && (
            <div className="rounded-xl bg-card card-shadow p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Location</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-5 h-5" />
                <span>{project.location}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
