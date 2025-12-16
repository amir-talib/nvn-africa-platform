import { useState, useEffect } from 'react';
import VolunteerHeader from '@/components/layout/VolunteerHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Save,
  Clock,
  FolderKanban,
  Star,
  Award,
  Loader2
} from 'lucide-react';
import { useProfile, useUpdateProfile } from '@/hooks/useUser';
import { useMyHours } from '@/hooks/useHours';

const VolunteerProfile = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch real data from MongoDB
  const { data: profileData, isLoading: profileLoading, error } = useProfile();
  const { data: hoursData, isLoading: hoursLoading } = useMyHours();
  const updateProfile = useUpdateProfile();

  // Local state for editing - initialized from fetched data
  const [editableProfile, setEditableProfile] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
  });

  // Update local state when profile data loads
  useEffect(() => {
    if (profileData) {
      setEditableProfile({
        firstname: profileData.firstname || '',
        lastname: profileData.lastname || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        bio: profileData.bio || '',
      });
    }
  }, [profileData]);

  const isLoading = profileLoading || hoursLoading;

  // Compute stats from real data
  const stats = {
    hoursVolunteered: hoursData?.data?.stats?.total_verified || profileData?.total_hours || 0,
    projectsCompleted: profileData?.no_of_projects_done || 0,
    rating: 4.8, // No rating system yet - placeholder
    badges: 0 // Will integrate with badges system when available
  };

  // Static achievements - can be made dynamic with badges API later
  const achievements = [
    { name: '100 Hours', description: 'Volunteered 100+ hours', earned: stats.hoursVolunteered >= 100 },
    { name: '50 Hours', description: 'Volunteered 50+ hours', earned: stats.hoursVolunteered >= 50 },
    { name: 'First Project', description: 'Completed first project', earned: stats.projectsCompleted >= 1 },
    { name: 'Team Player', description: 'Completed 5 team projects', earned: stats.projectsCompleted >= 5 },
    { name: 'Champion', description: 'Volunteered 200+ hours', earned: stats.hoursVolunteered >= 200 },
  ];

  const getRankLabel = (rank?: string) => {
    const ranks: Record<string, string> = {
      starter: '🌱 Starter',
      active_volunteer: '⭐ Active Volunteer',
      community_leader: '🏅 Community Leader',
      regional_mobilizer: '🎖️ Regional Mobilizer',
      impact_ambassador: '🏆 Impact Ambassador',
    };
    return ranks[rank || 'starter'] || '🌱 Starter';
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(editableProfile);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <>
        <VolunteerHeader title="Profile" subtitle="Loading..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <VolunteerHeader title="Profile" subtitle="Error loading profile" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-destructive mb-4">Failed to load profile. Please try again.</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const profile = profileData || {};
  const joinDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  return (
    <>
      <VolunteerHeader title="Profile" subtitle="Manage your volunteer profile" />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={profile.profile_picture || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                    {(profile.firstname?.[0] || 'U')}{(profile.lastname?.[0] || '')}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary"
                >
                  <Camera className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {profile.firstname} {profile.lastname}
                    </h2>
                    <p className="text-muted-foreground">Volunteer since {joinDate}</p>
                    <p className="text-sm text-primary mt-1">{getRankLabel(profile.rank)}</p>
                  </div>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={isEditing ? "bg-primary" : "text-primary border-primary"}
                    disabled={updateProfile.isPending}
                  >
                    {isEditing ? (
                      <>
                        {updateProfile.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </>
                    ) : (
                      'Edit Profile'
                    )}
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">{stats.hoursVolunteered}</p>
                    <p className="text-xs text-muted-foreground">Hours</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <FolderKanban className="w-5 h-5 text-success mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">{stats.projectsCompleted}</p>
                    <p className="text-xs text-muted-foreground">Projects</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <Star className="w-5 h-5 text-warning mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">{stats.rating}</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <Award className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">{achievements.filter(a => a.earned).length}</p>
                    <p className="text-xs text-muted-foreground">Badges</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={editableProfile.firstname}
                    onChange={(e) => setEditableProfile({ ...editableProfile, firstname: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={editableProfile.lastname}
                    onChange={(e) => setEditableProfile({ ...editableProfile, lastname: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={editableProfile.email}
                    onChange={(e) => setEditableProfile({ ...editableProfile, email: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={editableProfile.phone}
                    onChange={(e) => setEditableProfile({ ...editableProfile, phone: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={editableProfile.address}
                    onChange={(e) => setEditableProfile({ ...editableProfile, address: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={editableProfile.bio}
                  onChange={(e) => setEditableProfile({ ...editableProfile, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills & Interests */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(profile.skills || []).length > 0 ? (
                    profile.skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No skills added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(profile.interests || []).length > 0 ? (
                    profile.interests.map((interest: string) => (
                      <Badge key={interest} variant="outline" className="border-primary text-primary">
                        {interest}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No interests added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.name}
                    className={`flex items-center justify-between p-3 rounded-lg ${achievement.earned ? 'bg-primary/10' : 'bg-muted/30 opacity-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Award className={`w-5 h-5 ${achievement.earned ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div>
                        <p className={`font-medium ${achievement.earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {achievement.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                    {achievement.earned && (
                      <Badge className="bg-success text-success-foreground">Earned</Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default VolunteerProfile;