import { Route, Switch, Redirect } from "wouter";
import { useAuth } from "./contexts/auth-context"; // ✅ hook to check if user is logged in

import Login from "./pages/Login";
import Dashboard from "./pages/dashboard";
import Analytics from "./pages/analytics";
import Feed from "./pages/feed";
import Scheduler from "./pages/scheduler";
import NotFound from "./pages/not-found";

function App() {
  const { user } = useAuth(); // assumes your auth-context provides { user }

  // Small wrapper for private routes
  const PrivateRoute = ({ component: Component, ...rest }: any) => {
    return user ? <Component {...rest} /> : <Redirect to="/login" />;
  };

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={Login} />

      {/* Protected routes */}
      <Route path="/dashboard">
        <PrivateRoute component={Dashboard} />
      </Route>
      <Route path="/analytics">
        <PrivateRoute component={Analytics} />
      </Route>
      <Route path="/feed">
        <PrivateRoute component={Feed} />
      </Route>
      <Route path="/scheduler">
        <PrivateRoute component={Scheduler} />
      </Route>

      {/* Catch-all fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;