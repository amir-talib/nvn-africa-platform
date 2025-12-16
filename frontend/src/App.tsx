import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Volunteers from "./pages/Volunteers";
import VolunteerDetails from "./pages/VolunteerDetails";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Requests from "./pages/Requests";
import Performance from "./pages/Performance";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

import ProtectedRoutes from './utils/ProtectedRoutes.tsx'

// Auth pages
import AdminAuth from "./pages/auth/AdminAuth";
import MobilizerAuth from "./pages/auth/MobilizerAuth";
import VolunteerAuth from "./pages/auth/VolunteerAuth";
import PendingApprovalPage from "./pages/auth/PendingApprovalPage";

// Admin pages
import UserManagement from "./pages/admin/UserManagement";

// Mobilizer Dashboard imports
import MobilizerLayout from "./components/layout/MobilizerLayout";
import MobilizerDashboard from "./pages/mobilizer/MobilizerDashboard";
import MobilizerVolunteers from "./pages/mobilizer/MobilizerVolunteers";
import MobilizerProjects from "./pages/mobilizer/MobilizerProjects";
import MobilizerTeam from "./pages/mobilizer/MobilizerTeam";
import MobilizerRequests from "./pages/mobilizer/MobilizerRequests";
import MobilizerMessages from "./pages/mobilizer/MobilizerMessages";
import MobilizerCalendar from "./pages/mobilizer/MobilizerCalendar";
import MobilizerUpdates from "./pages/mobilizer/MobilizerUpdates";
import MobilizerSettings from "./pages/mobilizer/MobilizerSettings";
import MobilizerPerformance from "./pages/mobilizer/MobilizerPerformance";
import MobilizerVolunteerDetails from "./pages/mobilizer/MobilizerVolunteerDetails";
import MobilizerProjectDetails from "./pages/mobilizer/MobilizerProjectDetails";
import MobilizerHoursVerification from "./pages/mobilizer/MobilizerHoursVerification";

// Volunteer Dashboard imports
import VolunteerLayout from "./components/layout/VolunteerLayout";
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import VolunteerProjects from "./pages/volunteer/VolunteerProjects";
import VolunteerProjectDetails from "./pages/volunteer/VolunteerProjectDetails";
import VolunteerMyProjects from "./pages/volunteer/VolunteerMyProjects";
import VolunteerNotifications from "./pages/volunteer/VolunteerNotifications";
import VolunteerProfile from "./pages/volunteer/VolunteerProfile";
import VolunteerSettings from "./pages/volunteer/VolunteerSettings";
import VolunteerHours from "./pages/volunteer/VolunteerHours";

import GuestRoutes from './utils/GuestRoutes'

// Optimized QueryClient with aggressive caching for fast navigation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh for 5 minutes before refetching
      staleTime: 5 * 60 * 1000,
      // Cache data for 30 minutes
      gcTime: 30 * 60 * 1000, // Previously called cacheTime
      // Don't refetch on window focus (reduces API calls)
      refetchOnWindowFocus: false,
      // Don't refetch on mount if data exists and isn't stale
      refetchOnMount: false,
      // Retry failed requests once
      retry: 1,
      // Show stale data while fetching fresh data
      placeholderData: (previousData: any) => previousData,
    },
  },
});


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* Auth Routes */}
          <Route
            path="/admin/auth"
            element={
              <GuestRoutes>
                <AdminAuth />
              </GuestRoutes>
            } />
          <Route path="/mobilizer/auth" element={
            <GuestRoutes>
              <MobilizerAuth />
            </GuestRoutes>
          } />
          <Route path="/volunteer/auth" element={
            <GuestRoutes>
              <VolunteerAuth />
            </GuestRoutes>
          } />
          <Route path="/pending-approval" element={<PendingApprovalPage />} />

          {/* Admin Dashboard Routes */}

          <Route element={<ProtectedRoutes requiredRole={["admin"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/volunteers" element={<Volunteers />} />
            <Route path="/volunteers/:id" element={<VolunteerDetails />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>



          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />


          <Route path="/settings" element={<Settings />} />

          {/* Mobilizer Dashboard Routes */}
          <Route element={<ProtectedRoutes requiredRole={["mobilizer", "admin"]} />}>
            <Route path="/mobilizer" element={<MobilizerLayout />}>
              <Route index element={<MobilizerDashboard />} />
              <Route path="volunteers" element={<MobilizerVolunteers />} />
              <Route path="volunteers/:id" element={<MobilizerVolunteerDetails />} />
              <Route path="projects" element={<MobilizerProjects />} />
              <Route path="projects/:id" element={<MobilizerProjectDetails />} />
              <Route path="team" element={<MobilizerTeam />} />
              <Route path="requests" element={<MobilizerRequests />} />
              <Route path="messages" element={<MobilizerMessages />} />
              <Route path="calendar" element={<MobilizerCalendar />} />
              <Route path="updates" element={<MobilizerUpdates />} />
              <Route path="settings" element={<MobilizerSettings />} />
              <Route path="performance" element={<MobilizerPerformance />} />
              <Route path="hours-verification" element={<MobilizerHoursVerification />} />
            </Route>
          </Route>

          {/* Volunteer Dashboard Routes */}
          <Route element={<ProtectedRoutes requiredRole={["volunteer"]} />}>
            <Route path="/volunteer" element={<VolunteerLayout />}>
              <Route index element={<VolunteerDashboard />} />
              <Route path="projects" element={<VolunteerProjects />} />
              <Route path="projects/:id" element={<VolunteerProjectDetails />} />
              <Route path="my-projects" element={<VolunteerMyProjects />} />
              <Route path="notifications" element={<VolunteerNotifications />} />
              <Route path="profile" element={<VolunteerProfile />} />
              <Route path="settings" element={<VolunteerSettings />} />
              <Route path="hours" element={<VolunteerHours />} />
            </Route>
          </Route>



          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
