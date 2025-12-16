import MobilizerHeader from '@/components/layout/MobilizerHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Check,
  X,
  Clock,
  FolderKanban,
  Calendar,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { useProjectRequests, useApproveRequest, useRejectRequest } from '@/hooks/useProjects';

const MobilizerRequests = () => {
  const { toast } = useToast();

  // Fetch real project requests from MongoDB
  const { data: allRequestsData, isLoading, error } = useProjectRequests();
  const approveRequest = useApproveRequest();
  const rejectRequest = useRejectRequest();

  // Transform backend data to component format
  const requests = (allRequestsData || []).map((req: any) => ({
    id: req._id,
    volunteer: {
      name: `${req.volunteer?.firstname || ''} ${req.volunteer?.lastname || ''}`.trim() || 'Unknown',
      avatar: `${(req.volunteer?.firstname || 'U')[0]}${(req.volunteer?.lastname || 'V')[0]}`,
      email: req.volunteer?.email || 'No email',
      profilePicture: req.volunteer?.profile_picture,
    },
    project: req.project?.title || 'Unknown Project',
    projectId: req.project?._id,
    requestDate: req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown',
    status: req.status || 'pending',
    message: 'Request to join the project.',
  }));

  const handleApprove = async (requestId: string) => {
    try {
      await approveRequest.mutateAsync(requestId);
      toast({
        title: "Request Approved",
        description: "The volunteer has been approved for the project.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to approve request",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectRequest.mutateAsync(requestId);
      toast({
        title: "Request Rejected",
        description: "The volunteer request has been rejected.",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reject request",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning-foreground border-warning/30';
      case 'approved': return 'bg-success/10 text-success border-success/30';
      case 'rejected': return 'bg-destructive/10 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filterRequests = (status: string) => {
    if (status === 'all') return requests;
    return requests.filter((r: any) => r.status === status);
  };

  const stats = {
    pending: requests.filter((r: any) => r.status === 'pending').length,
    approved: requests.filter((r: any) => r.status === 'approved').length,
    rejected: requests.filter((r: any) => r.status === 'rejected').length,
  };

  const RequestCard = ({ request }: { request: typeof requests[0] }) => (
    <Card className="hover:border-mobilizer/50 transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={request.volunteer.profilePicture || "/placeholder.svg"} />
              <AvatarFallback className="bg-mobilizer text-mobilizer-foreground">
                {request.volunteer.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-foreground">{request.volunteer.name}</h4>
              <p className="text-sm text-muted-foreground">{request.volunteer.email}</p>
            </div>
          </div>
          <Badge variant="outline" className={getStatusColor(request.status)}>
            {request.status}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <FolderKanban className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{request.project}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Requested on {request.requestDate}</span>
          </div>
        </div>

        <div className="p-3 bg-muted/30 rounded-lg mb-4">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
            <p className="text-sm text-muted-foreground italic">"{request.message}"</p>
          </div>
        </div>

        {request.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
              onClick={() => handleApprove(request.id)}
              disabled={approveRequest.isPending}
            >
              <Check className="w-4 h-4 mr-1" /> Approve
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => handleReject(request.id)}
              disabled={rejectRequest.isPending}
            >
              <X className="w-4 h-4 mr-1" /> Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <>
        <MobilizerHeader title="Requests" subtitle="Loading requests..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-mobilizer" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <MobilizerHeader title="Requests" subtitle="Error loading requests" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-destructive mb-4">Failed to load requests. Please try again.</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <MobilizerHeader title="Requests" subtitle="Approve or reject volunteer participation" />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Check className="w-6 h-6 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <X className="w-6 h-6 text-destructive mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.rejected}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
        </div>

        {/* Requests Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          {['pending', 'approved', 'rejected', 'all'].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {filterRequests(tab).map((request: any) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
              {filterRequests(tab).length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No {tab} requests</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
};

export default MobilizerRequests;
