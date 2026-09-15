import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import Index from "./pages/index";
import AdminPage from "./pages/admin";
import PolicyPage from "./pages/policy";
import TermsPage from "./pages/terms";
import RefundPage from "./pages/refund";
import ThanksPage from "./pages/thanks";
import { Provider } from "./components/provider";
import { SiteContentProvider } from "./components/site-content-provider";
import { AgentFeedback } from "@runablehq/website-runtime";
import { trackMetaPageView } from "./lib/meta-pixel";

function MetaPixelPageViews() {
  const [location] = useLocation();

  useEffect(() => {
    if (!location.startsWith("/admin")) trackMetaPageView();
  }, [location]);

  return null;
}

function App() {
  return (
    <Provider>
      <SiteContentProvider>
        <MetaPixelPageViews />
        <Switch>
          <Route path="/admin" component={AdminPage} />
          <Route path="/policy" component={PolicyPage} />
          <Route path="/terms" component={TermsPage} />
          <Route path="/refund" component={RefundPage} />
          <Route path="/thanks" component={ThanksPage} />
          <Route path="/" component={Index} />
        </Switch>
      </SiteContentProvider>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
    </Provider>
  );
}

export default App;
