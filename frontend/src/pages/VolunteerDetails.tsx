import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MessageModal } from '@/components/modals/MessageModal';
import { toast } from 'sonner';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Clock,
  ArrowLeft,
  MessageSquare,
  Award,
  TrendingUp,
  Loader2,
  UserCheck,
  UserX,
  Ban,
} from 'lucide-react';
import { useUserById, useApproveUser, useBanUser, useUnbanUser } from '@/hooks/useUser';

export default function VolunteerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Fetch volunteer data from API
  const { data: volunteer, isLoading, error } = useUserById(id);
  const approveUserMutation = useApproveUser();
  const banUserMutation = useBanUser();
  const unbanUserMutation = useUnbanUser();

  const handleApprove = async () => {
    if (!volunteer?._id) return;
    try {
      await approveUserMutation.mutateAsync(volunteer._id);
      toast.success('Volunteer approved successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to approve volunteer');
    }
  };

  const handleBan = async () => {
    if (!volunteer?._id) return;
    try {
      await banUserMutation.mutateAsync(volunteer._id);
      toast.success('Volunteer banned');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to ban volunteer');
    }
  };

  const handleUnban = async () => {
    if (!volunteer?._id) return;
    try {
      await unbanUserMutation.mutateAsync(volunteer._id);
      toast.success('Volunteer unbanned');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to unban volunteer');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Volunteer Details">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !volunteer) {
    return (
      <DashboardLayout title="Volunteer Not Found">
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground mb-4">The volunteer you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/volunteers')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Volunteers
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const hoursGoal = 200;
  const hoursProgress = Math.min(((volunteer.total_hours || 0) / hoursGoal) * 100, 100);
  const skills = volunteer.skills || [];
  const interests = volunteer.interests || [];

  const getStatusBadge = () => {
    if (volunteer.isBanned) {
      return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 mt-2">Banned</Badge>;
    }
    if (!volunteer.isApproved) {
      return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 mt-2">Pending Approval</Badge>;
    }
    return <Badge variant="outline" className="bg-success/10 text-success border-success/20 mt-2">Active</Badge>;
  };

  return (
    <DashboardLayout title="Volunteer Details">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/volunteers')}
        className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Volunteers
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card className="card-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={volunteer.profile_picture} />
                  <AvatarFallback className="text-2xl">
                    {volunteer.firstname?.[0]}{volunteer.lastname?.[0]}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold text-foreground">
                  {volunteer.firstname} {volunteer.lastname}
                </h2>
                {getStatusBadge()}
                <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary">
                  {volunteer.rank || 'Newcomer'}
                </Badge>
                <p className="text-sm text-muted-foreground mt-4">
                  {volunteer.bio || 'No bio provided'}
                </p>

                <div className="flex gap-2 mt-6 w-full flex-wrap">
                  {!volunteer.isApproved && !volunteer.isBanned && (
                    <Button
                      className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                      onClick={handleApprove}
                      disabled={approveUserMutation.isPending}
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  )}
                  {volunteer.isBanned ? (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleUnban}
                      disabled={unbanUserMutation.isPending}
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Unban
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={handleBan}
                      disabled={banUserMutation.isPending}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Ban
                    </Button>
                  )}
                  <Button
                    className="flex-1 gradient-primary text-primary-foreground"
                    onClick={() => setShowMessageModal(true)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">{volunteer.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">{volunteer.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">{volunteer.address || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">
                  Joined {volunteer.createdAt ? new Date(volunteer.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}
                </span>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date of Birth</p>
                <p className="text-sm font-medium">
                  {volunteer.date_of_birth ? new Date(volunteer.date_of_birth).toLocaleDateString() : 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Gender</p>
                <p className="text-sm font-medium capitalize">{volunteer.gender || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Availability</p>
                <p className="text-sm font-medium">{volunteer.availability || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="card-shadow">
              <CardContent className="pt-6 text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-foreground">{volunteer.total_hours || 0}</p>
                <p className="text-xs text-muted-foreground">Hours Contributed</p>
              </CardContent>
            </Card>
            <Card className="card-shadow">
              <CardContent className="pt-6 text-center">
                <Briefcase className="w-6 h-6 mx-auto mb-2 text-secondary" />
                <p className="text-2xl font-bold text-foreground">{volunteer.no_of_projects_done || 0}</p>
                <p className="text-xs text-muted-foreground">Projects</p>
              </CardContent>
            </Card>
            <Card className="card-shadow">
              <CardContent className="pt-6 text-center">
                <Award className="w-6 h-6 mx-auto mb-2 text-warning" />
                <p className="text-2xl font-bold text-foreground">{volunteer.rank || 'Newcomer'}</p>
                <p className="text-xs text-muted-foreground">Rank</p>
              </CardContent>
            </Card>
            <Card className="card-shadow">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-success" />
                <p className="text-2xl font-bold text-foreground">{Math.round(hoursProgress)}%</p>
                <p className="text-xs text-muted-foreground">Goal Progress</p>
              </CardContent>
            </Card>
          </div>

          {/* Hours Progress */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Hours Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress toward {hoursGoal} hour goal</span>
                  <span className="font-medium">{volunteer.total_hours || 0} / {hoursGoal} hours</span>
                </div>
                <Progress value={hoursProgress} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Skills & Interests */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="text-base">Skills</CardTitle>
              </CardHeader>
              <CardContent>
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill: string) => (
                      <Badge key={skill} className="bg-primary/10 text-primary border-0">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No skills listed</p>
                )}
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="text-base">Interests</CardTitle>
              </CardHeader>
              <CardContent>
                {interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest: string) => (
                      <Badge key={interest} variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No interests listed</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Verification Status */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-base">Verification Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={`w-3 h-3 rounded-full ${volunteer.email_verified ? 'bg-success' : 'bg-warning'}`} />
                  <span className="text-sm">Email {volunteer.email_verified ? 'Verified' : 'Not Verified'}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={`w-3 h-3 rounded-full ${volunteer.phone_verified ? 'bg-success' : 'bg-warning'}`} />
                  <span className="text-sm">Phone {volunteer.phone_verified ? 'Verified' : 'Not Verified'}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={`w-3 h-3 rounded-full ${volunteer.isApproved ? 'bg-success' : 'bg-warning'}`} />
                  <span className="text-sm">Account {volunteer.isApproved ? 'Approved' : 'Pending'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-base">Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="font-medium">{volunteer.username || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium capitalize">{volunteer.role}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-medium">{volunteer.country || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {volunteer.createdAt ? new Date(volunteer.createdAt).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <MessageModal
        recipient={volunteer ? {
          id: volunteer._id,
          name: `${volunteer.firstname} ${volunteer.lastname}`,
          email: volunteer.email,
          avatar: volunteer.profile_picture
        } : null}
        open={showMessageModal}
        onClose={() => setShowMessageModal(false)}
      />
    </DashboardLayout>
  );
}
