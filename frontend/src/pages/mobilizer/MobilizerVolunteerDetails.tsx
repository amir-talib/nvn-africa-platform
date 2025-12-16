import { useParams, useNavigate } from 'react-router-dom';
import MobilizerHeader from '@/components/layout/MobilizerHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  FolderKanban,
  MessageSquare,
  Star,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { useUserById } from '@/hooks/useUser';

const MobilizerVolunteerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch real volunteer data from MongoDB
  const { data: userData, isLoading, error } = useUserById(id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success';
      case 'ongoing': return 'bg-mobilizer/10 text-mobilizer';
      case 'completed': return 'bg-success/10 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <>
        <MobilizerHeader title="Volunteer Details" subtitle="Loading..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-mobilizer" />
        </div>
      </>
    );
  }

  if (error || !userData) {
    return (
      <>
        <MobilizerHeader title="Volunteer Details" subtitle="Error" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-destructive mb-4">Failed to load volunteer details.</p>
              <Button onClick={() => navigate('/mobilizer/volunteers')}>Back to Volunteers</Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Transform user data
  const volunteer = {
    id: userData._id,
    name: `${userData.firstname || ''} ${userData.lastname || ''}`.trim() || 'Unknown',
    email: userData.email || 'No email',
    phone: userData.phone || 'No phone',
    location: userData.address || 'Location not specified',
    status: userData.isBanned ? 'inactive' : userData.isApproved ? 'active' : 'pending',
    role: userData.rank?.replace(/_/g, ' ') || 'Volunteer',
    joinDate: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown',
    avatar: `${(userData.firstname || 'U')[0]}${(userData.lastname || 'V')[0]}`,
    profilePicture: userData.profile_picture,
    bio: userData.bio || 'No bio available.',
    stats: {
      hoursContributed: userData.total_hours || 0,
      tasksCompleted: 0,
      projectsJoined: userData.no_of_projects_done || 0,
      rating: 0
    },
    skills: userData.skills || [],
    recentProjects: [],
    activityLog: []
  };


  return (
    <>
      <MobilizerHeader title="Volunteer Details" subtitle={volunteer.name} />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/mobilizer/volunteers')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Volunteers
        </Button>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-mobilizer text-mobilizer-foreground text-2xl">
                  {volunteer.avatar}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{volunteer.name}</h2>
                    <p className="text-muted-foreground">{volunteer.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="text-mobilizer border-mobilizer hover:bg-mobilizer-accent">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button className="bg-mobilizer hover:bg-mobilizer-secondary text-mobilizer-foreground">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    {volunteer.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {volunteer.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {volunteer.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Joined {volunteer.joinDate}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-4">{volunteer.bio}</p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {volunteer.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-mobilizer-accent text-mobilizer-accent-foreground">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-mobilizer mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{volunteer.stats.hoursContributed}</p>
              <p className="text-sm text-muted-foreground">Hours Contributed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{volunteer.stats.tasksCompleted}</p>
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FolderKanban className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{volunteer.stats.projectsJoined}</p>
              <p className="text-sm text-muted-foreground">Projects Joined</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{volunteer.stats.rating}</p>
              <p className="text-sm text-muted-foreground">Rating</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {volunteer.recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 border border-border rounded-lg hover:border-mobilizer/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/mobilizer/projects/${project.id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{project.name}</h4>
                    <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Role: {project.role}</span>
                    <span>{project.hours} hours</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {volunteer.activityLog.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-mobilizer mt-2" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart Placeholder */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-mobilizer" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Task Completion Rate</span>
                  <span className="text-foreground font-medium">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Attendance Rate</span>
                  <span className="text-foreground font-medium">88%</span>
                </div>
                <Progress value={88} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Project Participation</span>
                  <span className="text-foreground font-medium">95%</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default MobilizerVolunteerDetails;