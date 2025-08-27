import { Route, Switch } from "wouter";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Analytics from "./pages/analytics";
import Feed from "./pages/feed";
import Scheduler from "./pages/scheduler";
import NotFound from "./pages/not-found";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Switch>
        {/* Auth */}
        <Route path="/login" component={Login} />

        {/* Main pages */}
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/feed" component={Feed} />
        <Route path="/scheduler" component={Scheduler} />

        {/* Default route */}
        <Route path="/" component={Login} />

        {/* Catch-all fallback */}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}