import { useState } from "react";
import { Clock, CheckCircle, XCircle, User, Calendar } from "lucide-react";
import { usePendingHours, useVerifyHours, useRejectHours, useHoursStats } from "@/hooks/useHours";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HoursEntry {
    _id: string;
    volunteer: {
        _id: string;
        firstname: string;
        lastname: string;
        email: string;
        profile_picture?: string;
    };
    project: {
        _id: string;
        title: string;
        status: string;
    };
    hours: number;
    description: string;
    date_worked: string;
    createdAt: string;
}

const MobilizerHoursVerification = () => {
    const { toast } = useToast();
    const { data: pendingData, isLoading } = usePendingHours();
    const { data: statsData } = useHoursStats();
    const verifyHours = useVerifyHours();
    const rejectHours = useRejectHours();

    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<HoursEntry | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    const pendingHours: HoursEntry[] = pendingData?.data || [];
    const stats = statsData?.data || { totalVerifiedHours: 0, pendingCount: 0, topVolunteers: [] };

    const handleVerify = async (entry: HoursEntry) => {
        try {
            await verifyHours.mutateAsync(entry._id);
            toast({
                title: "Hours Verified",
                description: `${entry.hours} hours verified for ${entry.volunteer.firstname}`,
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to verify hours",
                variant: "destructive",
            });
        }
    };

    const handleReject = async () => {
        if (!selectedEntry) return;

        try {
            await rejectHours.mutateAsync({
                hoursId: selectedEntry._id,
                reason: rejectReason,
            });
            toast({
                title: "Hours Rejected",
                description: "The volunteer has been notified.",
            });
            setRejectDialogOpen(false);
            setSelectedEntry(null);
            setRejectReason("");
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to reject hours",
                variant: "destructive",
            });
        }
    };

    const openRejectDialog = (entry: HoursEntry) => {
        setSelectedEntry(entry);
        setRejectReason("");
        setRejectDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Hours Verification</h1>
                <p className="text-muted-foreground">
                    Review and verify volunteer service hours
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Platform Hours</CardDescription>
                        <CardTitle className="text-3xl text-green-600">
                            {stats.totalVerifiedHours.toLocaleString()} hrs
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Pending Reviews</CardDescription>
                        <CardTitle className="text-3xl text-yellow-600">
                            {stats.pendingCount}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Top Contributors</CardDescription>
                        <CardTitle className="text-lg">
                            {stats.topVolunteers?.[0]?.volunteer?.firstname || "None yet"}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Pending Hours */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Pending Verification
                        {pendingHours.length > 0 && (
                            <Badge variant="secondary">{pendingHours.length}</Badge>
                        )}
                    </CardTitle>
                    <CardDescription>
                        Review volunteer hours submissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Loading pending hours...
                        </div>
                    ) : pendingHours.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                            <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                            <p className="text-muted-foreground">
                                No pending hours to verify
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingHours.map((entry) => (
                                <div
                                    key={entry._id}
                                    className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                        {/* Volunteer Info */}
                                        <div className="flex items-start gap-3">
                                            <Avatar>
                                                <AvatarImage src={entry.volunteer.profile_picture} />
                                                <AvatarFallback>
                                                    {entry.volunteer.firstname[0]}{entry.volunteer.lastname[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h4 className="font-medium">
                                                    {entry.volunteer.firstname} {entry.volunteer.lastname}
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {entry.volunteer.email}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Hours Info */}
                                        <div className="flex-1 lg:px-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline">{entry.project?.title}</Badge>
                                                <span className="text-2xl font-bold">{entry.hours}</span>
                                                <span className="text-muted-foreground">hours</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {entry.description}
                                            </p>
                                            <div className="flex gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Worked: {format(new Date(entry.date_worked), "MMM d, yyyy")}
                                                </span>
                                                <span>
                                                    Submitted: {format(new Date(entry.createdAt), "MMM d, yyyy")}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleVerify(entry)}
                                                disabled={verifyHours.isPending}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Verify
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => openRejectDialog(entry)}
                                                disabled={rejectHours.isPending}
                                            >
                                                <XCircle className="w-4 h-4 mr-1" />
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Top Volunteers Leaderboard */}
            {stats.topVolunteers?.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Top Volunteers</CardTitle>
                        <CardDescription>Volunteers with most verified hours</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.topVolunteers.slice(0, 5).map((item: any, index: number) => (
                                <div
                                    key={item._id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">
                                            {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                                        </span>
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={item.volunteer?.profile_picture} />
                                            <AvatarFallback>
                                                {item.volunteer?.firstname?.[0]}{item.volunteer?.lastname?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">
                                                {item.volunteer?.firstname} {item.volunteer?.lastname}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.volunteer?.rank?.replace(/_/g, " ")}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-lg">{item.totalHours} hrs</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Reject Dialog */}
            <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject Hours?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to reject {selectedEntry?.hours} hours from{" "}
                            {selectedEntry?.volunteer.firstname}. Please provide a reason.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Textarea
                        placeholder="Reason for rejection (required)"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="min-h-[100px]"
                    />
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReject}
                            disabled={!rejectReason.trim() || rejectHours.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Reject Hours
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default MobilizerHoursVerification;
