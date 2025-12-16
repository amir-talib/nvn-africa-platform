import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Search,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  MoreHorizontal,
  Loader2,
  Eye,
  Ban
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAllUsers, useApproveUser, useBanUser, useUnbanUser } from "@/hooks/useUser";

const UserManagement = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Fetch users from API
  const { data: usersData, isLoading, error, refetch, isFetching } = useAllUsers({
    search: searchQuery || undefined,
  });

  const approveUserMutation = useApproveUser();
  const banUserMutation = useBanUser();
  const unbanUserMutation = useUnbanUser();

  const users = usersData?.data || [];

  // Filter users locally
  const filteredUsers = users.filter((user: any) => {
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "pending" && !user.isApproved && !user.isBanned) ||
      (statusFilter === "approved" && user.isApproved && !user.isBanned) ||
      (statusFilter === "banned" && user.isBanned);
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesStatus && matchesRole;
  });

  const pendingCount = users.filter((u: any) => !u.isApproved && !u.isBanned).length;

  const handleApprove = async (userId: string) => {
    try {
      await approveUserMutation.mutateAsync(userId);
      toast.success("User approved successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to approve user");
    }
  };

  const handleBan = async (userId: string) => {
    try {
      await banUserMutation.mutateAsync(userId);
      toast.success("User banned");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to ban user");
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      await unbanUserMutation.mutateAsync(userId);
      toast.success("User unbanned");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to unban user");
    }
  };

  const getStatusBadge = (user: any) => {
    if (user.isBanned) {
      return <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50"><Ban className="w-3 h-3 mr-1" />Banned</Badge>;
    }
    if (!user.isApproved) {
      return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
    return <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-primary/10 text-primary border-primary/20">Admin</Badge>;
      case "mobilizer":
        return <Badge className="bg-mobilizer-primary/10 text-mobilizer-primary border-mobilizer-primary/20">Mobilizer</Badge>;
      case "volunteer":
        return <Badge className="bg-volunteer-primary/10 text-volunteer-primary border-volunteer-primary/20">Volunteer</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="User Management">
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
      "Failed to load users. Please try again.";
    return (
      <DashboardLayout title="User Management">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="text-destructive">Couldn’t load users</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? "Retrying..." : "Retry"}
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="User Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage and approve user registrations</p>
          </div>
          {pendingCount > 0 && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="text-amber-800 font-medium">{pendingCount} pending approval{pendingCount > 1 ? "s" : ""}</span>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-warning">{pendingCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-success">
                {users.filter((u: any) => u.isApproved && !u.isBanned).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Banned</p>
              <p className="text-2xl font-bold text-destructive">
                {users.filter((u: any) => u.isBanned).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="mobilizer">Mobilizer</SelectItem>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Users</CardTitle>
            <CardDescription>
              {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: any) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.profile_picture} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.firstname?.[0]}{user.lastname?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.firstname} {user.lastname}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {!user.isApproved && !user.isBanned ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-300 hover:bg-green-50"
                            onClick={() => handleApprove(user._id)}
                            disabled={approveUserMutation.isPending}
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => handleBan(user._id)}
                            disabled={banUserMutation.isPending}
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Ban
                          </Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/volunteers/${user._id}`)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {user.isBanned ? (
                              <DropdownMenuItem onClick={() => handleUnban(user._id)}>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Unban User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleBan(user._id)} className="text-red-600">
                                <Ban className="w-4 h-4 mr-2" />
                                Ban User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
