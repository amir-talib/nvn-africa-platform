import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProjects } from '@/hooks/useProjects';

const statusColors: Record<string, string> = {
  ongoing: 'bg-success/10 text-success border-success/20',
  active: 'bg-success/10 text-success border-success/20',
  completed: 'bg-muted text-muted-foreground border-muted',
  upcoming: 'bg-warning/10 text-warning border-warning/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
};

interface ProjectsTableProps {
  onViewProject?: (id: string) => void;
  onEditProject?: (id: string) => void;
}

export function ProjectsTable({ onViewProject, onEditProject }: ProjectsTableProps) {
  const navigate = useNavigate();
  const { data: projects = [], isLoading, error } = useProjects();

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card card-shadow p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-card card-shadow p-8 text-center text-destructive">
        Failed to load projects
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-xl bg-card card-shadow p-8 text-center text-muted-foreground">
        No projects yet. Create your first project!
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card card-shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold">Project Name</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold hidden md:table-cell">Duration</TableHead>
            <TableHead className="font-semibold hidden lg:table-cell">Location</TableHead>
            <TableHead className="font-semibold hidden sm:table-cell">Volunteers</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project: any) => (
            <TableRow
              key={project._id}
              className="hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/projects/${project._id}`)}
            >
              <TableCell className="font-medium">{project.title}</TableCell>
              <TableCell>
                <Badge variant="outline" className={statusColors[project.status] || statusColors.pending}>
                  {project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD'} - {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'TBD'}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground">
                {project.location || '-'}
              </TableCell>
              <TableCell className="hidden sm:table-cell">{project.volunteers?.length || 0}</TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewProject?.(project._id) || navigate(`/projects/${project._id}`)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditProject?.(project._id)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
