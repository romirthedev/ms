import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home/HomePage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import BiggestLosersPage from "@/pages/dashboard/BiggestLosersPage";
import { ThemeProvider } from "@/components/ui/theme";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/dashboard/biggest-losers" component={BiggestLosersPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
