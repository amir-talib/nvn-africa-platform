import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MoreHorizontal, Eye, Mail, UserX, UserCheck, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAllUsers, useApproveUser, useBanUser, useUnbanUser } from '@/hooks/useUser';

export default function Volunteers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch volunteers from API
  const { data: usersData, isLoading, error, refetch, isFetching } = useAllUsers({
    role: 'volunteer',
    search: searchQuery || undefined,
    isApproved: statusFilter === 'approved' ? true : statusFilter === 'pending' ? false : undefined,
  });

  const approveUserMutation = useApproveUser();
  const banUserMutation = useBanUser();
  const unbanUserMutation = useUnbanUser();

  const volunteers = usersData?.data || [];

  // Stats calculations
  const totalVolunteers = volunteers.length;
  const activeVolunteers = volunteers.filter((v: any) => v.isApproved && !v.isBanned).length;
  const totalHours = volunteers.reduce((acc: number, v: any) => acc + (v.total_hours || 0), 0);
  const avgHours = totalVolunteers > 0 ? Math.round(totalHours / totalVolunteers) : 0;

  const handleApprove = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await approveUserMutation.mutateAsync(userId);
      toast.success('Volunteer approved successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to approve volunteer');
    }
  };

  const handleBan = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await banUserMutation.mutateAsync(userId);
      toast.success('Volunteer banned');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to ban volunteer');
    }
  };

  const handleUnban = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await unbanUserMutation.mutateAsync(userId);
      toast.success('Volunteer unbanned');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to unban volunteer');
    }
  };

  const getStatusBadge = (volunteer: any) => {
    if (volunteer.isBanned) {
      return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Banned</Badge>;
    }
    if (!volunteer.isApproved) {
      return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
    }
    return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Active</Badge>;
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Volunteers">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    const errorMessage =
      (error as any)?.response?.data?.message ||
      (error as any)?.message ||
      "Failed to load volunteers. Please try again.";
    return (
      <DashboardLayout title="Volunteers">
        <div className="max-w-xl">
          <div className="rounded-xl bg-card card-shadow p-6">
            <p className="text-lg font-semibold text-destructive mb-1">Couldn’t load volunteers</p>
            <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
            <div className="flex gap-2">
              <Button onClick={() => refetch()} disabled={isFetching}>
                {isFetching ? "Retrying..." : "Retry"}
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Volunteers">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search volunteers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl bg-card card-shadow p-4">
          <p className="text-sm text-muted-foreground">Total Volunteers</p>
          <p className="text-2xl font-bold text-foreground">{totalVolunteers}</p>
        </div>
        <div className="rounded-xl bg-card card-shadow p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-success">{activeVolunteers}</p>
        </div>
        <div className="rounded-xl bg-card card-shadow p-4">
          <p className="text-sm text-muted-foreground">Total Hours</p>
          <p className="text-2xl font-bold text-primary">{totalHours}</p>
        </div>
        <div className="rounded-xl bg-card card-shadow p-4">
          <p className="text-sm text-muted-foreground">Avg Hours/Volunteer</p>
          <p className="text-2xl font-bold text-foreground">{avgHours}</p>
        </div>
      </div>

      {/* Volunteers Table */}
      <div className="rounded-xl bg-card card-shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Volunteer</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">Location</TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">Skills</TableHead>
              <TableHead className="font-semibold hidden sm:table-cell">Status</TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">Hours</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {volunteers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No volunteers found
                </TableCell>
              </TableRow>
            ) : (
              volunteers.map((volunteer: any) => (
                <TableRow
                  key={volunteer._id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/volunteers/${volunteer._id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={volunteer.profile_picture} />
                        <AvatarFallback>
                          {volunteer.firstname?.[0]}{volunteer.lastname?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{volunteer.firstname} {volunteer.lastname}</p>
                        <p className="text-sm text-muted-foreground">{volunteer.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {volunteer.address || '-'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {(volunteer.skills || []).slice(0, 2).map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {(volunteer.skills || []).length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{(volunteer.skills || []).length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {getStatusBadge(volunteer)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell font-medium">
                    {volunteer.total_hours || 0}h
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/volunteers/${volunteer._id}`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        {!volunteer.isApproved && (
                          <DropdownMenuItem onClick={(e) => handleApprove(volunteer._id, e)}>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                        )}
                        {volunteer.isBanned ? (
                          <DropdownMenuItem onClick={(e) => handleUnban(volunteer._id, e)}>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Unban
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => handleBan(volunteer._id, e)}
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Ban
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
