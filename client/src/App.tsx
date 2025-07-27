
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import CaseList from "@/pages/CaseList";
import NewCase from "@/pages/NewCase";
import Patients from "@/pages/Patients";
import Analytics from "@/pages/Analytics";
import Export from "@/pages/Export";
import Settings from "@/pages/Settings";
import UserManagement from "@/pages/admin/UserManagement";
import SystemAnalytics from "@/pages/admin/SystemAnalytics";
import UserCases from "@/pages/admin/UserCases";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return isAuthenticated ? <Component /> : <Redirect to="/" />;
}

function Router() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
            <Route path="/cases" component={() => <ProtectedRoute component={CaseList} />} />
            <Route path="/new-case" component={() => <ProtectedRoute component={NewCase} />} />
            <Route path="/patients" component={() => <ProtectedRoute component={Patients} />} />
            <Route path="/analytics" component={() => <ProtectedRoute component={Analytics} />} />
            <Route path="/export" component={() => <ProtectedRoute component={Export} />} />
            <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
            <Route path="/admin/users" component={() => <ProtectedRoute component={UserManagement} />} />
            <Route path="/admin/analytics" component={() => <ProtectedRoute component={SystemAnalytics} />} />
            <Route path="/admin/user-cases" component={() => <ProtectedRoute component={UserCases} />} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default Router;
