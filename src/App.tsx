import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { trackPageView } from "@/lib/analytics";

// Public / marketing
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import OnboardingSteps from "./pages/Onboarding";
import Features from "./pages/Features";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import FAQs from "./pages/FAQs";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import SharedContent from "./pages/SharedContent";
import StudyTechniques from "./pages/blog/5-proven-study-techniques";
import EngagingLessonPlans from "./pages/blog/engaging-lesson-plans";
import AmaSuccessStory from "./pages/blog/ama-success-story";
import AIEducationGhana from "./pages/blog/ai-education-ghana";
import MasteringFlashcards from "./pages/blog/mastering-flashcards";
import DifferentiationMadeEasy from "./pages/blog/differentiation-made-easy";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

// mytuta app
import AppShell from "./mytuta/AppShell";
import { getRole } from "./mytuta/useRole";
import StudentHome from "./mytuta/student/Home";
import Learn from "./mytuta/student/Learn";
import Solve from "./mytuta/student/Solve";
import Lab from "./mytuta/student/Lab";
import Challenges from "./mytuta/student/Challenges";
import Progress from "./mytuta/student/Progress";
import Assignments from "./mytuta/student/Assignments";
import AssessmentTake from "./mytuta/student/AssessmentTake";
import ExperienceView from "./mytuta/student/ExperienceView";
import Review from "./mytuta/student/Review";
import TeacherHome from "./mytuta/teacher/Home";
import Experiences from "./mytuta/teacher/Experiences";
import Create from "./mytuta/teacher/Create";
import Studio from "./mytuta/teacher/Studio";
import Classes from "./mytuta/teacher/Classes";
import Assessments from "./mytuta/teacher/Assessments";
import Insights from "./mytuta/teacher/Insights";
import InterventionBuilder from "./mytuta/teacher/InterventionBuilder";
import InterventionList from "./mytuta/teacher/InterventionList";
import ChallengeCreate from "./mytuta/teacher/ChallengeCreate";
import ChallengeEdit from "./mytuta/teacher/ChallengeEdit";
import ChallengeReview from "./mytuta/teacher/ChallengeReview";
import Notifications from "./mytuta/Notifications";
import Profile from "./mytuta/Profile";
import Settings from "./mytuta/Settings";
import Help from "./mytuta/Help";
import Wallet from "./mytuta/Wallet";
import JoinClass from "./mytuta/JoinClass";

// Admin panel
import AdminProtectedRoute from "./admin/AdminProtectedRoute";
import AdminShell from "./admin/AdminShell";
import AdminOverview from "./admin/Overview";
import AdminAuditLog from "./admin/AuditLog";
import AdminUsers from "./admin/Users";
import AdminUserDetail from "./admin/UserDetail";
import AdminCredits from "./admin/Credits";
import AdminPlans from "./admin/Plans";
import AdminSubscriptions from "./admin/Subscriptions";
import AdminPayments from "./admin/Payments";
import AdminPaymentDetail from "./admin/PaymentDetail";
import AdminReconciliation from "./admin/Reconciliation";
import AdminConcepts from "./admin/Concepts";
import AdminConceptDetail from "./admin/ConceptDetail";
import AdminQuestions from "./admin/Questions";
import AdminAssessments from "./admin/Assessments";
import AdminAssessmentDetail from "./admin/AssessmentDetail";
import AdminAiOps from "./admin/AiOps";
import AdminAiJobs from "./admin/AiJobs";
import AdminSupport from "./admin/Support";
import AdminTicketDetail from "./admin/TicketDetail";
import AdminSettings from "./admin/Settings";

const queryClient = new QueryClient();

// Send the user to the correct home for their role.
const RoleHome = () => <Navigate to={getRole() === "teacher" ? "/teacher/home" : "/student/home"} replace />;

const PageViewTracker = () => {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
  }, [location]);
  return null;
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Index />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/join/:code" element={<JoinClass />} />
              <Route path="/features" element={<Features />} />
              <Route path="/about" element={<About />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/5-proven-study-techniques" element={<StudyTechniques />} />
              <Route path="/blog/engaging-lesson-plans" element={<EngagingLessonPlans />} />
              <Route path="/blog/ama-success-story" element={<AmaSuccessStory />} />
              <Route path="/blog/ai-education-ghana" element={<AIEducationGhana />} />
              <Route path="/blog/mastering-flashcards" element={<MasteringFlashcards />} />
              <Route path="/blog/differentiation-made-easy" element={<DifferentiationMadeEasy />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/share/:contentType/:contentId" element={<SharedContent />} />

              {/* Onboarding */}
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingSteps /></ProtectedRoute>} />

              {/* App shell — student + teacher */}
              <Route element={<ProtectedRoute><ErrorBoundary><AppShell /></ErrorBoundary></ProtectedRoute>}>
                <Route path="/student" element={<Navigate to="/student/home" replace />} />
                <Route path="/student/home" element={<StudentHome />} />
                <Route path="/student/learn" element={<Learn />} />
                <Route path="/student/learn/new" element={<Learn />} />
                <Route path="/student/mastery/:masteryPathId" element={<Learn />} />
                <Route path="/student/solve" element={<Solve />} />
                <Route path="/student/lab" element={<Lab />} />
                <Route path="/student/challenges" element={<Challenges />} />
                <Route path="/student/challenges/:challengeId" element={<Challenges />} />
                <Route path="/student/assignments" element={<Assignments />} />
                <Route path="/student/assessments/:assessmentId" element={<AssessmentTake />} />
                <Route path="/student/experiences/:experienceId" element={<ExperienceView />} />
                <Route path="/student/review" element={<Review />} />
                <Route path="/student/progress" element={<Progress />} />

                <Route path="/teacher" element={<Navigate to="/teacher/home" replace />} />
                <Route path="/teacher/home" element={<TeacherHome />} />
                <Route path="/teacher/experiences" element={<Experiences />} />
                <Route path="/teacher/experiences/new" element={<Create />} />
                <Route path="/teacher/experiences/:experienceId/edit" element={<Studio />} />
                <Route path="/teacher/experiences/:experienceId/preview" element={<Studio />} />
                <Route path="/teacher/classes" element={<Classes />} />
                <Route path="/teacher/classes/:classId" element={<Classes />} />
                <Route path="/teacher/classes/:classId/challenge/new" element={<ChallengeCreate />} />
                <Route path="/teacher/classes/:classId/challenge/:challengeId/edit" element={<ChallengeEdit />} />
                <Route path="/teacher/classes/:classId/challenge/:challengeId/submissions" element={<ChallengeReview />} />
                <Route path="/teacher/assessments" element={<Assessments />} />
                <Route path="/teacher/assessments/new" element={<Assessments />} />
                <Route path="/teacher/insights" element={<Insights />} />
                <Route path="/teacher/intervention/new" element={<InterventionBuilder />} />
                <Route path="/teacher/interventions" element={<InterventionList />} />

                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/help" element={<Help />} />
                <Route path="/wallet" element={<Wallet />} />
              </Route>

              {/* Admin panel — server-gated on admin membership */}
              <Route element={<AdminProtectedRoute><ErrorBoundary><AdminShell /></ErrorBoundary></AdminProtectedRoute>}>
                <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
                <Route path="/admin/overview" element={<AdminOverview />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/users/:userId" element={<AdminUserDetail />} />
                <Route path="/admin/credits" element={<AdminCredits />} />
                <Route path="/admin/plans" element={<AdminPlans />} />
                <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
                <Route path="/admin/payments" element={<AdminPayments />} />
                <Route path="/admin/payments/:paymentId" element={<AdminPaymentDetail />} />
                <Route path="/admin/reconciliation" element={<AdminReconciliation />} />
                <Route path="/admin/concepts" element={<AdminConcepts />} />
                <Route path="/admin/concepts/:conceptId" element={<AdminConceptDetail />} />
                <Route path="/admin/questions" element={<AdminQuestions />} />
                <Route path="/admin/assessments" element={<AdminAssessments />} />
                <Route path="/admin/assessments/:assessmentId" element={<AdminAssessmentDetail />} />
                <Route path="/admin/ai" element={<AdminAiOps />} />
                <Route path="/admin/ai/jobs" element={<AdminAiJobs />} />
                <Route path="/admin/support" element={<AdminSupport />} />
                <Route path="/admin/support/:ticketId" element={<AdminTicketDetail />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/audit" element={<AdminAuditLog />} />
              </Route>

              {/* Legacy dashboard redirect */}
              <Route path="/dashboard" element={<ProtectedRoute><RoleHome /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
            <PageViewTracker />
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
