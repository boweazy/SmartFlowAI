import { Route, Switch } from "wouter";
import Landing from "./pages/landing";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Feed from "./pages/feed";
import Scheduler from "./pages/scheduler";
import Analytics from "./pages/analytics";
import NotFound from "./pages/not-found";

export default function App() {
  return (
    <Switch>
      {/* Public landing */}
      <Route path="/" component={Landing} />

      {/* Auth */}
      <Route path="/login" component={Login} />

      {/* Private app */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/feed" component={Feed} />
      <Route path="/scheduler" component={Scheduler} />
      <Route path="/analytics" component={Analytics} />

      {/* Catch-all */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}
