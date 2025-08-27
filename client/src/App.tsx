import { Route, Switch } from "wouter";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Feed from "./pages/feed";
import Scheduler from "./pages/scheduler";
import Analytics from "./pages/analytics";
import NotFound from "./pages/not-found";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/feed" component={Feed} />
      <Route path="/scheduler" component={Scheduler} />
      <Route path="/analytics" component={Analytics} />

      {/* Catch-all frontend route */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}
