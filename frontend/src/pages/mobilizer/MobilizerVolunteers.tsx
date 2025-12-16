import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobilizerHeader from '@/components/layout/MobilizerHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Phone, Mail, Eye, MessageSquare, Filter, Loader2 } from 'lucide-react';
import { useAllUsers } from '@/hooks/useUser';

const MobilizerVolunteers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch real volunteers from MongoDB
  const { data: usersData, isLoading, error } = useAllUsers({ role: 'volunteer' });

  // Transform backend data to component format
  const volunteers = (usersData?.data || []).map((user: any) => ({
    id: user._id,
    name: `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Unknown',
    email: user.email || 'No email',
    phone: user.phone || 'No phone',
    status: user.isBanned ? 'inactive' : user.isApproved ? 'active' : 'pending',
    role: user.rank || 'Volunteer',
    lastActivity: user.updatedAt ? formatTimeAgo(user.updatedAt) : 'Unknown',
    projects: user.no_of_projects_done || 0,
    avatar: `${(user.firstname || 'U')[0]}${(user.lastname || 'V')[0]}`,
    profilePicture: user.profile_picture,
  }));

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success';
      case 'pending': return 'bg-warning/10 text-warning-foreground';
      case 'inactive': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredVolunteers = volunteers.filter((v: any) => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: 'Total Volunteers', value: volunteers.length },
    { label: 'Active', value: volunteers.filter((v: any) => v.status === 'active').length },
    { label: 'Pending', value: volunteers.filter((v: any) => v.status === 'pending').length },
    { label: 'Inactive', value: volunteers.filter((v: any) => v.status === 'inactive').length },
  ];

  if (isLoading) {
    return (
      <>
        <MobilizerHeader title="Volunteers" subtitle="Loading volunteers..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-mobilizer" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <MobilizerHeader title="Volunteers" subtitle="Error loading volunteers" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-destructive mb-4">Failed to load volunteers. Please try again.</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <MobilizerHeader title="Volunteers" subtitle="Manage your assigned volunteers" />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search volunteers by name or email..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Volunteers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Volunteer Directory ({filteredVolunteers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredVolunteers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Volunteer</TableHead>
                      <TableHead className="hidden md:table-cell">Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Rank</TableHead>
                      <TableHead className="hidden lg:table-cell">Projects</TableHead>
                      <TableHead className="hidden lg:table-cell">Last Activity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVolunteers.map((volunteer: any) => (
                      <TableRow key={volunteer.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/mobilizer/volunteers/${volunteer.id}`)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={volunteer.profilePicture || "/placeholder.svg"} />
                              <AvatarFallback className="bg-mobilizer text-mobilizer-foreground text-sm">
                                {volunteer.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{volunteer.name}</p>
                              <p className="text-xs text-muted-foreground md:hidden">{volunteer.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="w-3 h-3" /> {volunteer.email}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" /> {volunteer.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(volunteer.status)}>
                            {volunteer.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground capitalize">
                          {volunteer.role.replace(/_/g, ' ')}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {volunteer.projects} projects
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {volunteer.lastActivity}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-mobilizer hover:bg-mobilizer-accent" onClick={() => navigate(`/mobilizer/volunteers/${volunteer.id}`)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-mobilizer hover:bg-mobilizer-accent" onClick={() => navigate('/mobilizer/messages')}>
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No volunteers found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default MobilizerVolunteers;
