import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { TrendingUp, Clock, Award, Users, Target, Loader2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStats, useProjects } from '@/hooks/useProjects';
import { useAllUsers } from '@/hooks/useUser';

const COLORS = ['hsl(var(--success))', 'hsl(var(--primary))', 'hsl(var(--warning))'];

export default function Performance() {
  const [timeRange, setTimeRange] = useState('6months');
  const navigate = useNavigate();

  // Fetch real data
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: volunteersData, isLoading: volunteersLoading } = useAllUsers({ role: 'volunteer' });

  const volunteers = volunteersData?.data || [];
  const isLoading = statsLoading || projectsLoading || volunteersLoading;

  // Calculate real stats
  const totalHours = volunteers.reduce((acc: number, v: any) => acc + (v.total_hours || 0), 0);
  const avgHours = volunteers.length > 0 ? Math.round(totalHours / volunteers.length) : 0;
  const activeVolunteers = volunteers.filter((v: any) => v.isApproved && !v.isBanned).length;
  const completedProjects = projects.filter((p: any) => p.status === 'completed').length;
  const ongoingProjects = projects.filter((p: any) => p.status === 'ongoing').length;
  const upcomingProjects = projects.filter((p: any) => p.status === 'upcoming').length;

  // KPI Metrics from real data
  const kpiMetrics = [
    { label: 'Total Hours', value: totalHours.toString(), icon: Clock },
    { label: 'Active Volunteers', value: activeVolunteers.toString(), icon: Users },
    { label: 'Completed Projects', value: completedProjects.toString(), icon: Target },
    { label: 'Lives Impacted', value: (stats?.livesImpacted || 0).toString(), icon: Award },
  ];

  // Top volunteers by hours
  const topVolunteers = [...volunteers]
    .sort((a: any, b: any) => (b.total_hours || 0) - (a.total_hours || 0))
    .slice(0, 5);

  // Project status distribution for pie chart
  const projectStatusData = [
    { name: 'Completed', value: completedProjects },
    { name: 'Ongoing', value: ongoingProjects },
    { name: 'Upcoming', value: upcomingProjects },
  ].filter(d => d.value > 0);

  // Volunteer rank distribution
  const rankDistribution = volunteers.reduce((acc: any, v: any) => {
    const rank = v.rank || 'Newcomer';
    acc[rank] = (acc[rank] || 0) + 1;
    return acc;
  }, {});

  const rankData = Object.entries(rankDistribution).map(([name, value]) => ({ name, value }));

  if (isLoading) {
    return (
      <DashboardLayout title="Performance Tracking">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Performance Tracking">
      {/* Time Range Filter */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Track volunteer and project performance</p>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">Last Month</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiMetrics.map((metric) => (
          <Card key={metric.label} className="card-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{metric.value}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <metric.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Project Status Distribution */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-base">Project Status</CardTitle>
          </CardHeader>
          <CardContent>
            {projectStatusData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No project data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {projectStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="card-shadow lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Top Volunteers by Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topVolunteers.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No volunteer data yet
              </div>
            ) : (
              topVolunteers.map((volunteer: any, index: number) => (
                <div
                  key={volunteer._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/volunteers/${volunteer._id}`)}
                >
                  <span className="text-sm font-bold text-muted-foreground w-5">#{index + 1}</span>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={volunteer.profile_picture} />
                    <AvatarFallback className="text-xs">
                      {volunteer.firstname?.[0]}{volunteer.lastname?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {volunteer.firstname} {volunteer.lastname}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {volunteer.total_hours || 0}h • {volunteer.no_of_projects_done || 0} projects
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {volunteer.rank || 'Newcomer'}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Goals Progress */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="text-base">Organization Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Volunteer Hours', current: totalHours, target: Math.max(totalHours * 1.2, 1000), unit: 'hours' },
              { label: 'Active Volunteers', current: activeVolunteers, target: Math.max(activeVolunteers * 1.2, 50), unit: 'volunteers' },
              { label: 'Projects Completed', current: completedProjects, target: Math.max(projects.length, 10), unit: 'projects' },
              { label: 'Communities Reached', current: stats?.communitiesReached || 0, target: Math.max((stats?.communitiesReached || 0) * 1.5, 10), unit: 'communities' },
            ].map((goal) => {
              const progress = goal.target > 0 ? Math.min(Math.round((goal.current / goal.target) * 100), 100) : 0;
              return (
                <div key={goal.label} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{goal.label}</span>
                    <Badge variant="outline" className={progress >= 80 ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}>
                      {progress}%
                    </Badge>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {goal.current.toLocaleString()} / {Math.round(goal.target).toLocaleString()} {goal.unit}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
