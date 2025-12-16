import { useState } from 'react';
import MobilizerHeader from '@/components/layout/MobilizerHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Loader2
} from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';

const MobilizerCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Fetch real projects from MongoDB
  const { data: projectsData, isLoading } = useProjects();

  // Transform projects into calendar events
  const projectsList: any[] = Array.isArray(projectsData) ? projectsData : (projectsData?.data as any[] || []);

  const events = projectsList.map((project: any) => ({
    id: project._id,
    title: project.title,
    date: project.start_date ? new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
    time: '9:00 AM - 5:00 PM',
    location: project.location || 'Location TBD',
    type: 'project',
    volunteers: project.volunteers?.length || 0,
  }));

  const getEventColor = (type: string) => {
    switch (type) {
      case 'project': return 'bg-mobilizer/10 text-mobilizer border-l-mobilizer';
      case 'meeting': return 'bg-blue-500/10 text-blue-500 border-l-blue-500';
      case 'training': return 'bg-purple-500/10 text-purple-500 border-l-purple-500';
      default: return 'bg-muted text-muted-foreground border-l-muted';
    }
  };

  const upcomingEvents = events.slice(0, 5);

  if (isLoading) {
    return (
      <>
        <MobilizerHeader title="Calendar" subtitle="Loading..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-mobilizer" />
        </div>
      </>
    );
  }


  return (
    <>
      <MobilizerHeader title="Calendar" subtitle="Upcoming projects and events" />

      <div className="flex-1 overflow-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border w-full"
              />

              {/* Legend */}
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-foreground">Event Types</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-mobilizer/10 text-mobilizer border-mobilizer/30">
                    Project
                  </Badge>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                    Meeting
                  </Badge>
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/30">
                    Training
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium">December 2024</span>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg border-l-4 ${getEventColor(event.type)} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                    </div>
                    <Badge variant="outline" className={getEventColor(event.type)}>
                      {event.type}
                    </Badge>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{event.volunteers} volunteers</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Timeline View */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Project Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-6">
                {events.map((event, index) => (
                  <div key={event.id} className="relative flex gap-4 pl-10">
                    {/* Timeline dot */}
                    <div className={`absolute left-2 w-5 h-5 rounded-full border-4 border-background ${event.type === 'project' ? 'bg-mobilizer' :
                        event.type === 'meeting' ? 'bg-blue-500' : 'bg-purple-500'
                      }`} />

                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-muted-foreground">{event.date}</span>
                        <Badge variant="outline" className={getEventColor(event.type)}>
                          {event.type}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-foreground">{event.title}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {event.location}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default MobilizerCalendar;
