import { useState } from "react";
import { Clock, CheckCircle, XCircle, AlertCircle, Plus } from "lucide-react";
import { useMyHours } from "@/hooks/useHours";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import HoursLogModal from "@/components/modals/HoursLogModal";
import { useAuth } from "@/context/AuthContext";

interface HoursEntry {
    _id: string;
    project: {
        _id: string;
        title: string;
        status: string;
    };
    hours: number;
    description: string;
    date_worked: string;
    status: "pending" | "verified" | "rejected";
    verified_by?: {
        firstname: string;
        lastname: string;
    };
    verified_at?: string;
    rejection_reason?: string;
    createdAt: string;
}

const VolunteerHours = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("all");
    const [logModalOpen, setLogModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<{ id: string; title: string } | null>(null);

    const { data, isLoading } = useMyHours(activeTab === "all" ? undefined : activeTab);
    const hours: HoursEntry[] = data?.data?.hours || [];
    const stats = data?.data?.stats || { total_verified: 0, total_pending: 0 };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "verified":
                return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Verified</Badge>;
            case "rejected":
                return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
            default:
                return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" /> Pending</Badge>;
        }
    };

    const getRankLabel = (rank: string) => {
        const ranks: Record<string, string> = {
            starter: "🌱 Starter",
            active_volunteer: "⭐ Active Volunteer",
            community_leader: "🏅 Community Leader",
            regional_mobilizer: "🎖️ Regional Mobilizer",
            impact_ambassador: "🏆 Impact Ambassador",
        };
        return ranks[rank] || rank;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">My Volunteer Hours</h1>
                    <p className="text-muted-foreground">
                        Track and manage your service hours
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Verified</CardDescription>
                        <CardTitle className="text-3xl text-green-600">
                            {stats.total_verified} hrs
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Pending Review</CardDescription>
                        <CardTitle className="text-3xl text-yellow-600">
                            {stats.total_pending} hrs
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Current Rank</CardDescription>
                        <CardTitle className="text-xl">
                            {getRankLabel(user?.rank || "starter")}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Projects Contributed</CardDescription>
                        <CardTitle className="text-3xl">
                            {user?.no_of_projects_done || 0}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Hours List */}
            <Card>
                <CardHeader>
                    <CardTitle>Hours History</CardTitle>
                    <CardDescription>
                        View all your logged volunteer hours
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="verified">Verified</TabsTrigger>
                            <TabsTrigger value="rejected">Rejected</TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab}>
                            {isLoading ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Loading hours...
                                </div>
                            ) : hours.length === 0 ? (
                                <div className="text-center py-12">
                                    <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No hours logged yet</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Complete projects and log your volunteer hours
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {hours.map((entry) => (
                                        <div
                                            key={entry._id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium">{entry.project?.title || "Unknown Project"}</h4>
                                                    {getStatusBadge(entry.status)}
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {entry.description}
                                                </p>
                                                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                                    <span>📅 {format(new Date(entry.date_worked), "MMM d, yyyy")}</span>
                                                    {entry.verified_at && (
                                                        <span>
                                                            ✓ Verified {format(new Date(entry.verified_at), "MMM d")}
                                                            {entry.verified_by && ` by ${entry.verified_by.firstname}`}
                                                        </span>
                                                    )}
                                                </div>
                                                {entry.status === "rejected" && entry.rejection_reason && (
                                                    <p className="text-sm text-red-600 mt-2">
                                                        Reason: {entry.rejection_reason}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right mt-2 sm:mt-0">
                                                <span className="text-2xl font-bold">
                                                    {entry.hours}
                                                </span>
                                                <span className="text-muted-foreground ml-1">hrs</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Hours Log Modal */}
            {selectedProject && (
                <HoursLogModal
                    open={logModalOpen}
                    onOpenChange={setLogModalOpen}
                    projectId={selectedProject.id}
                    projectTitle={selectedProject.title}
                />
            )}
        </div>
    );
};

export default VolunteerHours;
