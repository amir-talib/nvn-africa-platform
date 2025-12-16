import MobilizerHeader from '@/components/layout/MobilizerHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Phone,
  Mail,
  MessageSquare,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useAllUsers } from '@/hooks/useUser';

const MobilizerTeam = () => {
  // Fetch real volunteers from MongoDB
  const { data: usersData, isLoading, error } = useAllUsers({ role: 'volunteer' });

  // Transform backend data to team members format
  const teamMembers = (usersData?.data || []).map((user: any) => ({
    id: user._id,
    name: `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Unknown',
    email: user.email || 'No email',
    phone: user.phone || 'No phone',
    role: user.rank?.replace(/_/g, ' ') || 'Volunteer',
    status: user.isBanned ? 'inactive' : user.isApproved ? 'active' : 'pending',
    avatar: `${(user.firstname || 'U')[0]}${(user.lastname || 'V')[0]}`,
    profilePicture: user.profile_picture,
    performance: 80, // Would need performance tracking API
    hoursContributed: user.total_hours || 0,
    tasksCompleted: 0,
    projectsJoined: user.no_of_projects_done || 0,
    rating: 0,
  }));

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-success';
    if (performance >= 70) return 'text-mobilizer';
    return 'text-warning';
  };

  if (isLoading) {
    return (
      <>
        <MobilizerHeader title="My Team" subtitle="Loading..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-mobilizer" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <MobilizerHeader title="My Team" subtitle="Error" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-destructive mb-4">Failed to load team members.</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }


  return (
    <>
      <MobilizerHeader title="My Team" subtitle="Your volunteer team performance" />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Team Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{teamMembers.length}</p>
              <p className="text-sm text-muted-foreground">Team Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-mobilizer">
                {Math.round(teamMembers.reduce((acc, m) => acc + m.performance, 0) / teamMembers.length)}%
              </p>
              <p className="text-sm text-muted-foreground">Avg. Performance</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {teamMembers.reduce((acc, m) => acc + m.hoursContributed, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Hours</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">
                {teamMembers.reduce((acc, m) => acc + m.tasksCompleted, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Team Members Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member) => (
            <Card key={member.id} className="hover:border-mobilizer/50 transition-all hover-scale">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-mobilizer text-mobilizer-foreground text-lg">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-warning fill-warning" />
                      <span className="text-sm font-medium text-foreground">{member.rating}</span>
                    </div>
                  </div>
                  <Badge className="bg-success/10 text-success">{member.status}</Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Performance
                      </span>
                      <span className={`font-medium ${getPerformanceColor(member.performance)}`}>
                        {member.performance}%
                      </span>
                    </div>
                    <Progress value={member.performance} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <p className="text-lg font-semibold text-foreground">{member.hoursContributed}</p>
                      <p className="text-xs text-muted-foreground">Hours</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <p className="text-lg font-semibold text-foreground">{member.tasksCompleted}</p>
                      <p className="text-xs text-muted-foreground">Tasks</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <p className="text-lg font-semibold text-foreground">{member.projectsJoined}</p>
                      <p className="text-xs text-muted-foreground">Projects</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{member.email}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-mobilizer border-mobilizer hover:bg-mobilizer-accent">
                    <MessageSquare className="w-4 h-4 mr-1" /> Message
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone className="w-4 h-4 mr-1" /> Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default MobilizerTeam;
