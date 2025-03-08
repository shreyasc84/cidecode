import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import EvidenceUpload from "@/pages/evidence-upload";
import EvidenceTracker from "@/pages/evidence-tracker";
import { ProtectedRoute } from "./lib/protected-route";
import { UserRole } from "@shared/schema";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute 
        path="/upload" 
        component={EvidenceUpload}
        roles={[UserRole.ADMIN, UserRole.OFFICER]} 
      />
      <ProtectedRoute path="/tracker" component={EvidenceTracker} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
