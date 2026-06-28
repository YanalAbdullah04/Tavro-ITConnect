import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ApiError } from "@/lib/api/client";
import Landing from "./pages/Landing";
import Services from "./pages/Services";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import TrainerDashboard from "./pages/dashboard/TrainerDashboard";
import TrainingSessionDetails from "./pages/dashboard/TrainingSessionDetails";
import TrainerEvaluations from "./pages/dashboard/TrainerEvaluations";
import CompanyDashboard from "./pages/dashboard/CompanyDashboard";
import TaskDetails from "./pages/dashboard/TaskDetails";
import StudentProfile from "./pages/dashboard/StudentProfile";
import TrainerProfile from "./pages/dashboard/TrainerProfile";
import InternshipsBrowse from "./pages/dashboard/InternshipsBrowse";
import InternshipDetails from "./pages/dashboard/InternshipDetails";
import StudentTasks from "./pages/dashboard/StudentTasks";
import NotFound from "./pages/NotFound";
import { ProfileSetting } from "./components/ProfileSetting";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof ApiError) {
          if (error.status === 401 || error.status >= 500 || error.status === 0) return false;
          return failureCount < 1;
        }

        return false;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/services" element={<Services />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/company/:id" element={<CompanyDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard/student" element={<ProtectedRoute roles={["Trainee", "Student"]}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/student/*" element={<ProtectedRoute roles={["Trainee", "Student"]}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/trainer" element={<ProtectedRoute roles={["Trainer"]}><TrainerDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/trainer/*" element={<ProtectedRoute roles={["Trainer"]}><TrainerDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/trainer/training/:trainingId" element={<ProtectedRoute roles={["Trainer"]}><TrainingSessionDetails /></ProtectedRoute>} />
            <Route path="/dashboard/trainer/training/:trainingId/student/:studentId/tasks" element={<ProtectedRoute roles={["Trainer"]}><StudentTasks /></ProtectedRoute>} />
            <Route path="/dashboard/trainer/evaluations" element={<ProtectedRoute roles={["Trainer"]}><TrainerEvaluations /></ProtectedRoute>} />
            <Route path="/dashboard/trainer/profile" element={<ProtectedRoute roles={["Trainer"]}><TrainerProfile /></ProtectedRoute>} />
            <Route path="/dashboard/company/*" element={<ProtectedRoute roles={["Company"]}><CompanyDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/task/:taskId" element={<ProtectedRoute roles={["Trainee", "Student"]}><TaskDetails /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute roles={["Trainee", "Student"]}><StudentProfile /></ProtectedRoute>} />
            <Route path="/dashboard/training-session/:id" element={<ProtectedRoute roles={["Trainer"]}><TrainingSessionDetails /></ProtectedRoute>} />
            <Route path="/dashboard/internships" element={<ProtectedRoute roles={["Trainee", "Student"]}><InternshipsBrowse /></ProtectedRoute>} />
            <Route path="/dashboard/internships/:internshipId" element={<ProtectedRoute roles={["Trainee", "Student"]}><InternshipDetails /></ProtectedRoute>} />
            <Route path="/internships" element={<Navigate to="/dashboard/internships" replace />} />
            <Route path="/internship/:internshipId" element={<Navigate to="/dashboard/internships" replace />} />
            <Route path="/profile-setting" element={<ProfileSetting />} />
            <Route path="/profile_setting" element={<ProfileSetting />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
