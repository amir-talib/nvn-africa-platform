import { useNavigate } from 'react-router-dom';
import { Check, X, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useProjectRequests, useApproveRequest, useRejectRequest } from '@/hooks/useProjects';

export function RequestsCard() {
  const navigate = useNavigate();

  const { data: allRequests = [], isLoading } = useProjectRequests('pending');
  const approveRequestMutation = useApproveRequest();
  const rejectRequestMutation = useRejectRequest();

  const requests = allRequests.slice(0, 3); // Show only first 3

  const handleApprove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await approveRequestMutation.mutateAsync(id);
      toast.success('Request approved');
    } catch (error: any) {
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await rejectRequestMutation.mutateAsync(id);
      toast.success('Request rejected');
    } catch (error: any) {
      toast.error('Failed to reject request');
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card card-shadow p-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card card-shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Pending Requests</h3>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {allRequests.length} new
        </Badge>
      </div>

      {requests.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No pending requests
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request: any) => (
            <div
              key={request._id}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={request.volunteer?.profile_picture} />
                  <AvatarFallback>
                    {request.volunteer?.firstname?.[0]}{request.volunteer?.lastname?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">
                    {request.volunteer?.firstname} {request.volunteer?.lastname}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {request.project?.title || 'Unknown Project'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-success hover:bg-success/10 hover:text-success"
                  onClick={(e) => handleApprove(request._id, e)}
                  disabled={approveRequestMutation.isPending}
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => handleReject(request._id, e)}
                  disabled={rejectRequestMutation.isPending}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="ghost"
        className="w-full mt-4 text-primary hover:text-primary hover:bg-primary/10"
        onClick={() => navigate('/requests')}
      >
        View all requests
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
