import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardLayout from "./components/DashboardLayout";
import { ThemeProvider } from "./contexts/ThemeContext";
import { I18nProvider } from "./contexts/I18nContext";
import { CloudTheme } from "./components/CloudTheme";
import { Analytics } from "./components/Analytics";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from "react";
import { useI18n } from "./contexts/I18nContext";

const ExportPanel  = lazy(() => import("./components/ExportPanel").then((m) => ({ default: m.ExportPanel })));
const SettingsPanel = lazy(() => import("./components/SettingsPanel").then((m) => ({ default: m.SettingsPanel })));
const Accounts = lazy(() => import("./pages/Accounts"));
const Transactions = lazy(() => import("./pages/Transactions"));

function Placeholder({ titleKey }: { titleKey: string }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <span className="text-5xl">🚧</span>
      <div className="text-center">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{t(titleKey)}</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{t("page.underConstruction")}</p>
      </div>
    </div>
  );
}

function WithLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-40 text-sm text-zinc-400"> </div>}>
        {children}
      </Suspense>
    </DashboardLayout>
  );
}

function Router() {
  return (
    <Switch>
      {/* ── Public (no auth required) ── */}
      <Route path="/login"   component={Login} />
      <Route path="/landing" component={Landing} />

      {/* ── Dashboard app (auth gated inside DashboardLayout) ── */}
      <Route path="/"            component={() => <WithLayout><Dashboard /></WithLayout>} />
      <Route path="/transactions" component={() => <WithLayout><Suspense fallback={null}><Transactions /></Suspense></WithLayout>} />
      <Route path="/accounts"     component={() => <WithLayout><Suspense fallback={null}><Accounts /></Suspense></WithLayout>} />
      <Route path="/categories"   component={() => <WithLayout><Placeholder titleKey="nav.categories" /></WithLayout>} />
      <Route path="/reports"      component={() => <WithLayout><Placeholder titleKey="nav.reports" /></WithLayout>} />
      <Route path="/export"       component={() => <WithLayout><ExportPanel /></WithLayout>} />
      <Route path="/settings"     component={() => <WithLayout><SettingsPanel /></WithLayout>} />

      {/* ── Fallback ── */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Analytics />
      <ThemeProvider defaultTheme="light" switchable>
        <I18nProvider>
          <TooltipProvider>
            <CloudTheme />
            <Toaster />
            <Router />
          </TooltipProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
