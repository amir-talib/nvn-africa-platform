import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Grid, List, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProjectFormModal } from '@/components/modals/ProjectFormModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useProjects } from '@/hooks/useProjects';

const statusColors: Record<string, string> = {
  ongoing: 'bg-success/10 text-success border-success/20',
  active: 'bg-success/10 text-success border-success/20',
  completed: 'bg-muted text-muted-foreground border-muted',
  upcoming: 'bg-warning/10 text-warning border-warning/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
};

export default function Projects() {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const navigate = useNavigate();

  // Fetch projects from API
  const { data: projects = [], isLoading, error } = useProjects();

  const filteredProjects = projects.filter((p: any) => {
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewProject = (id: string) => {
    navigate(`/projects/${id}`);
  };

  const handleEditProject = (id: string) => {
    const project = projects.find((p: any) => p._id === id);
    if (project) {
      setEditingProject(project);
      setShowProjectModal(true);
    }
  };

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

  if (isLoading) {
    return (
      <DashboardLayout title="Projects">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Projects">
        <div className="flex items-center justify-center h-64 text-destructive">
          Failed to load projects. Please try again.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Projects">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className={cn('rounded-none', viewMode === 'grid' && 'bg-muted')}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn('rounded-none', viewMode === 'table' && 'bg-muted')}
              onClick={() => setViewMode('table')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={() => {
              setEditingProject(null);
              setShowProjectModal(true);
            }}
            className="gradient-primary text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl bg-card card-shadow p-4">
          <p className="text-sm text-muted-foreground">Total Projects</p>
          <p className="text-2xl font-bold text-foreground">{projects.length}</p>
        </div>
        <div className="rounded-xl bg-card card-shadow p-4">
          <p className="text-sm text-muted-foreground">Ongoing</p>
          <p className="text-2xl font-bold text-success">
            {projects.filter((p: any) => p.status === 'ongoing').length}
          </p>
        </div>
        <div className="rounded-xl bg-card card-shadow p-4">
          <p className="text-sm text-muted-foreground">Upcoming</p>
          <p className="text-2xl font-bold text-warning">
            {projects.filter((p: any) => p.status === 'upcoming').length}
          </p>
        </div>
        <div className="rounded-xl bg-card card-shadow p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-muted-foreground">
            {projects.filter((p: any) => p.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Content */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-xl bg-card card-shadow p-12 text-center">
          <p className="text-muted-foreground">No projects found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project: any) => {
            const progress = calculateProgress(project.start_date, project.end_date, project.status);
            return (
              <div
                key={project._id}
                className="rounded-xl bg-card card-shadow p-6 hover:card-shadow-hover transition-shadow cursor-pointer"
                onClick={() => handleViewProject(project._id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="outline" className={statusColors[project.status] || statusColors.pending}>
                    {project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {project.volunteers?.length || 0} volunteers
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>📍 {project.location || 'No location'}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD'} - {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'TBD'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl bg-card card-shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold">Project</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Location</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Status</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Volunteers</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project: any) => {
                const progress = calculateProgress(project.start_date, project.end_date, project.status);
                return (
                  <TableRow
                    key={project._id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => handleViewProject(project._id)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{project.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {project.location || '-'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className={statusColors[project.status] || statusColors.pending}>
                        {project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {project.volunteers?.length || 0}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="h-2 w-20" />
                        <span className="text-sm">{progress}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ProjectFormModal
        open={showProjectModal}
        onClose={() => {
          setShowProjectModal(false);
          setEditingProject(null);
        }}
        project={editingProject ? {
          id: editingProject._id,
          name: editingProject.title,
          description: editingProject.description,
          status: editingProject.status,
          startDate: editingProject.start_date,
          endDate: editingProject.end_date,
          leadId: editingProject.project_lead,
        } : undefined}
      />
    </DashboardLayout>
  );
}
