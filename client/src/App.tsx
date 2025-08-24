import { Route, Switch } from "wouter";

// ✅ lowercase imports to match actual filenames
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Analytics from "./pages/analytics";
import Feed from "./pages/feed";
import Scheduler from "./pages/scheduler";
import NotFound from "./pages/not-found";

function App() {
  return (
    <Switch>
      {/* Auth */}
      <Route path="/login" component={Login} />

      {/* Main pages */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/feed" component={Feed} />
      <Route path="/scheduler" component={Scheduler} />

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
