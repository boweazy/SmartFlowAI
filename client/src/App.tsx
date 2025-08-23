import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import { TenantProvider } from "@/contexts/tenant-context";
import Layout from "@/components/layout/layout";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Feed from "@/pages/feed";
import Scheduler from "@/pages/scheduler";
import Analytics from "@/pages/analytics";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/contexts/auth-context";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  if (!user) {
    window.location.href = '/login';
    return null;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        {user ? (
          <Layout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/feed" component={Feed} />
              <Route path="/scheduler" component={Scheduler} />
              <Route path="/analytics" component={Analytics} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        ) : (
          <Login />
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <TenantProvider>
            <div className="dark">
              <Toaster />
              <AppRoutes />
            </div>
          </TenantProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
