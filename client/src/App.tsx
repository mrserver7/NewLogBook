import { Switch, Route } from "wouter";
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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/cases" component={CaseList} />
          <Route path="/new-case" component={NewCase} />
          <Route path="/patients" component={Patients} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/export" component={Export} />
          <Route path="/settings" component={Settings} />
          <Route path="/admin/users" component={UserManagement} />
          <Route path="/admin/analytics" component={SystemAnalytics} />
          <Route path="/admin/user-cases/:userId" component={UserCases} />
        </>
      )}
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;


