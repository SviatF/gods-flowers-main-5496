import { Route, Switch } from "wouter";
import Index from "./pages/index";
import AdminPage from "./pages/admin";
import { Provider } from "./components/provider";
import { SiteContentProvider } from "./components/site-content-provider";
import { AgentFeedback } from "@runablehq/website-runtime";

function App() {
  return (
    <Provider>
      <SiteContentProvider>
        <Switch>
          <Route path="/admin" component={AdminPage} />
          <Route path="/" component={Index} />
        </Switch>
      </SiteContentProvider>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
    </Provider>
  );
}

export default App;
