import { useState } from 'react';
import { Search, Filter, Check, X, Eye, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useProjectRequests, useApproveRequest, useRejectRequest, type ProjectRequest } from '@/hooks/useProjects';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

const statusIcons: Record<string, React.ElementType> = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
};

export default function Requests() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | null>(null);
  const [activeTab, setActiveTab] = useState('pending');

  // Fetch requests from API
  const { data: requests = [], isLoading, error } = useProjectRequests();
  const approveRequestMutation = useApproveRequest();
  const rejectRequestMutation = useRejectRequest();

  // Filter requests based on search and tab
  const filteredRequests = requests.filter((r) => {
    const volunteerName = `${r.volunteer?.firstname || ''} ${r.volunteer?.lastname || ''}`.toLowerCase();
    const matchesSearch = volunteerName.includes(searchQuery.toLowerCase());
    const matchesStatus = r.status === activeTab;
    return matchesSearch && matchesStatus;
  });

  const getStatusCount = (status: string) => requests.filter(r => r.status === status).length;

  const handleApprove = async (requestId: string) => {
    try {
      await approveRequestMutation.mutateAsync(requestId);
      toast.success('Request approved successfully');
      setSelectedRequest(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectRequestMutation.mutateAsync(requestId);
      toast.success('Request rejected');
      setSelectedRequest(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to reject request');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Volunteer Requests">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Volunteer Requests">
        <div className="flex items-center justify-center h-64 text-destructive">
          Failed to load requests. Please try again.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Volunteer Requests">
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-warning/10 p-4 text-center">
          <Clock className="w-8 h-8 mx-auto mb-2 text-warning" />
          <p className="text-2xl font-bold text-foreground">{getStatusCount('pending')}</p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="rounded-xl bg-success/10 p-4 text-center">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success" />
          <p className="text-2xl font-bold text-foreground">{getStatusCount('approved')}</p>
          <p className="text-sm text-muted-foreground">Approved</p>
        </div>
        <div className="rounded-xl bg-destructive/10 p-4 text-center">
          <XCircle className="w-8 h-8 mx-auto mb-2 text-destructive" />
          <p className="text-2xl font-bold text-foreground">{getStatusCount('rejected')}</p>
          <p className="text-sm text-muted-foreground">Rejected</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by volunteer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pending
            <Badge variant="secondary" className="ml-1">{getStatusCount('pending')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="w-4 h-4" />
            Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="rounded-xl bg-card card-shadow p-12 text-center">
                <p className="text-muted-foreground">No {activeTab} requests found</p>
              </div>
            ) : (
              filteredRequests.map((request) => {
                const StatusIcon = statusIcons[request.status];
                const volunteerName = `${request.volunteer?.firstname || ''} ${request.volunteer?.lastname || ''}`;
                return (
                  <div
                    key={request._id}
                    className="rounded-xl bg-card card-shadow p-6 hover:card-shadow-hover transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={request.volunteer?.profile_picture} />
                          <AvatarFallback>
                            {request.volunteer?.firstname?.[0]}{request.volunteer?.lastname?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{volunteerName}</h3>
                            <Badge variant="outline" className={statusColors[request.status]}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{request.volunteer?.email}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-primary font-medium">{request.project?.title || 'Unknown Project'}</span>
                            <span className="text-muted-foreground">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {(request.volunteer?.skills || []).slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="bg-muted text-muted-foreground text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 lg:flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-success hover:bg-success/90 text-success-foreground"
                              onClick={() => handleApprove(request._id)}
                              disabled={approveRequestMutation.isPending}
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(request._id)}
                              disabled={rejectRequestMutation.isPending}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Request Details Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedRequest.volunteer?.profile_picture} />
                  <AvatarFallback>
                    {selectedRequest.volunteer?.firstname?.[0]}{selectedRequest.volunteer?.lastname?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {selectedRequest.volunteer?.firstname} {selectedRequest.volunteer?.lastname}
                  </h3>
                  <p className="text-muted-foreground">{selectedRequest.volunteer?.address}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Project</p>
                  <p className="font-medium text-primary">{selectedRequest.project?.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Request Date</p>
                  <p className="font-medium">{new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedRequest.volunteer?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedRequest.volunteer?.phone || 'Not provided'}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">Skills</p>
                <div className="flex gap-2 flex-wrap">
                  {(selectedRequest.volunteer?.skills || []).map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary">
                      {skill}
                    </Badge>
                  ))}
                  {(!selectedRequest.volunteer?.skills || selectedRequest.volunteer.skills.length === 0) && (
                    <span className="text-muted-foreground text-sm">No skills listed</span>
                  )}
                </div>
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                    onClick={() => handleApprove(selectedRequest._id)}
                    disabled={approveRequestMutation.isPending}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleReject(selectedRequest._id)}
                    disabled={rejectRequestMutation.isPending}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
