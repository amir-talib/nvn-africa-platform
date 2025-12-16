import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VolunteerHeader from '@/components/layout/VolunteerHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Filter,
  Clock,
  Loader2,
  FolderKanban
} from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';

const VolunteerProjects = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Fetch real projects from MongoDB
  const { data: projectsData, isLoading, error } = useProjects();

  // Safely extract projects array - API may return array directly or wrapped in object
  const projectsList = Array.isArray(projectsData) ? projectsData : (projectsData?.data || []);

  // Transform backend data to component format
  const projects = projectsList.map((project: any) => ({
    id: project._id,
    name: project.title,
    description: project.description || 'No description available',
    location: project.location || 'Location TBD',
    date: formatProjectDate(project.start_date, project.end_date),
    volunteersNeeded: project.neededVolunteers || 10,
    totalVolunteers: project.volunteers?.length || 0,
    category: getCategoryFromProject(project),
    duration: getDuration(project.start_date, project.end_date),
    urgency: getUrgency(project),
    status: project.status,
  }));

  function formatProjectDate(startDate?: string, endDate?: string): string {
    if (!startDate) return 'Date TBD';
    const start = new Date(startDate);
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (!endDate) return startStr;
    const end = new Date(endDate);
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  }

  function getDuration(startDate?: string, endDate?: string): string {
    if (!startDate || !endDate) return 'TBD';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays === 1) return '1 day';
    if (diffDays <= 7) return `${diffDays} days`;
    if (diffDays <= 14) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''}`;
    return `${Math.ceil(diffDays / 30)} month${Math.ceil(diffDays / 30) > 1 ? 's' : ''}`;
  }

  function getCategoryFromProject(project: any): string {
    const title = (project.title || '').toLowerCase();
    const desc = (project.description || '').toLowerCase();
    const combined = title + ' ' + desc;

    if (combined.includes('health') || combined.includes('medical')) return 'Health';
    if (combined.includes('education') || combined.includes('school') || combined.includes('teach')) return 'Education';
    if (combined.includes('environment') || combined.includes('clean') || combined.includes('tree')) return 'Environment';
    if (combined.includes('community') || combined.includes('women') || combined.includes('empowerment')) return 'Community';
    if (combined.includes('food') || combined.includes('humanitarian')) return 'Humanitarian';
    return 'General';
  }

  function getUrgency(project: any): string {
    if (!project.start_date) return 'low';
    const start = new Date(project.start_date);
    const now = new Date();
    const daysUntilStart = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilStart <= 3) return 'high';
    if (daysUntilStart <= 7) return 'medium';
    return 'low';
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Health': return 'bg-success/10 text-success';
      case 'Education': return 'bg-primary/10 text-primary';
      case 'Environment': return 'bg-green-500/10 text-green-600';
      case 'Community': return 'bg-purple-500/10 text-purple-600';
      case 'Humanitarian': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-destructive/10 text-destructive';
      case 'medium': return 'bg-warning/10 text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Filter projects - only show upcoming and active projects for volunteers
  const availableProjects = projects.filter((p: any) =>
    p.status === 'upcoming' || p.status === 'active' || p.status === 'ongoing'
  );

  const filteredProjects = availableProjects.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'Health', 'Education', 'Environment', 'Community', 'Humanitarian', 'General'];

  if (isLoading) {
    return (
      <>
        <VolunteerHeader title="Available Projects" subtitle="Loading projects..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <VolunteerHeader title="Available Projects" subtitle="Error loading projects" />
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
      <VolunteerHeader title="Available Projects" subtitle="Find and join projects that match your interests" />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project: any) => (
              <Card
                key={project.id}
                className="hover:border-primary/50 cursor-pointer transition-all hover-scale"
                onClick={() => navigate(`/volunteer/projects/${project.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={getCategoryColor(project.category)}>{project.category}</Badge>
                    {project.urgency === 'high' && (
                      <Badge className={getUrgencyColor(project.urgency)}>Urgent</Badge>
                    )}
                  </div>

                  <h3 className="font-semibold text-lg text-foreground mb-2">{project.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>

                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{project.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{project.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {project.totalVolunteers}/{project.volunteersNeeded} joined
                      </span>
                    </div>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      Join
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FolderKanban className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No projects found matching your criteria.</p>
            {searchTerm || categoryFilter !== 'all' ? (
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => { setSearchTerm(''); setCategoryFilter('all'); }}
              >
                Clear Filters
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
};

export default VolunteerProjects;