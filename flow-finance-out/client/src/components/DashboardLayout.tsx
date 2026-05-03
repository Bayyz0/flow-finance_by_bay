import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/useMobile";
import { useI18n, LANGUAGES } from "@/contexts/I18nContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  LayoutDashboard, LogOut, PanelLeft,
  ArrowLeftRight, Wallet, Tag, BarChart3,
  Download, Settings, TrendingUp,
  Sun, Moon, Globe, ChevronDown,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import Landing from "@/pages/Landing";

// ── constants ──────────────────────────────────────────────────────────────
const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 240;
const MIN_WIDTH = 180;
const MAX_WIDTH = 380;

// ── nav items ──────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: LayoutDashboard, key: "nav.dashboard",    path: "/"             },
  { icon: ArrowLeftRight,  key: "nav.transactions", path: "/transactions" },
  { icon: Wallet,          key: "nav.accounts",     path: "/accounts"     },
  { icon: Tag,             key: "nav.categories",   path: "/categories"   },
  { icon: BarChart3,       key: "nav.reports",      path: "/reports"      },
  { icon: Download,        key: "nav.export",       path: "/export"       },
  { icon: Settings,        key: "nav.settings",     path: "/settings"     },
] as const;

// ══════════════════════════════════════════════════════════════════════════════
// Root layout
// ══════════════════════════════════════════════════════════════════════════════
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) return <DashboardLayoutSkeleton />;

  // ── Not logged in → show public Landing page ──────────────────────────────
  if (!user) {
    return <Landing />;
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
      <LayoutContent setSidebarWidth={setSidebarWidth}>{children}</LayoutContent>
    </SidebarProvider>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Inner layout
// ══════════════════════════════════════════════════════════════════════════════
function LayoutContent({
  children,
  setSidebarWidth,
}: {
  children: React.ReactNode;
  setSidebarWidth: (w: number) => void;
}) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { t, language, setLanguage } = useI18n();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  // Sticky topbar: detect scroll
  useEffect(() => {
    const el = document.querySelector("[data-main-scroll]") as HTMLElement | null;
    const target = el ?? window;
    const handler = () => {
      const y = el ? el.scrollTop : window.scrollY;
      setScrolled(y > 8);
    };
    target.addEventListener("scroll", handler, { passive: true });
    return () => target.removeEventListener("scroll", handler);
  }, []);

  // Fade-up animation
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.opacity = "1";
          (e.target as HTMLElement).style.transform = "translateY(0)";
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.08 },
    );
    document.querySelectorAll(".anim-fade-up").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [location]);

  // Sidebar resize drag
  useEffect(() => {
    if (isCollapsed) { setIsResizing(false); return; }
    const onMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const left = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const w = e.clientX - left;
      if (w >= MIN_WIDTH && w <= MAX_WIDTH) setSidebarWidth(w);
    };
    const onUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, isCollapsed, setSidebarWidth]);

  const currentLang = LANGUAGES.find((l) => l.id === language) ?? LANGUAGES[0];
  const activeNav = NAV_ITEMS.find((n) => n.path === location);

  return (
    <>
      {/* ── Collapsible Sidebar ── */}
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r border-zinc-100 dark:border-zinc-800/80"
          disableTransition={isResizing}>

          <SidebarHeader className="h-14 justify-center px-3">
            <div className="flex items-center gap-2.5">
              <button onClick={toggleSidebar} aria-label="Toggle sidebar"
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                <PanelLeft className="h-4 w-4 text-zinc-500" />
              </button>
              {!isCollapsed && (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-white text-sm tracking-tight truncate">
                    {t("nav.appName")}
                  </span>
                </div>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 pt-1">
            <SidebarMenu className="px-2 space-y-px">
              {NAV_ITEMS.map((item) => {
                const active = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={active}
                      onClick={() => setLocation(item.path)}
                      tooltip={t(item.key)}
                      className={`h-9 rounded-lg font-normal transition-all text-sm ${
                        active
                          ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                    >
                      <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-blue-600 dark:text-blue-400" : ""}`} />
                      <span>{t(item.key)}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 group-data-[collapsible=icon]:justify-center">
                  <Avatar className="h-8 w-8 shrink-0 ring-2 ring-white dark:ring-zinc-900 shadow-sm">
                    <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-blue-500 to-violet-600 text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-semibold truncate leading-none text-zinc-900 dark:text-white">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-1">
                      {user?.email || ""}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => setLocation("/settings")} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  {t("common.settings")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}
                  className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("common.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Drag handle */}
        {!isCollapsed && (
          <div
            className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-400/30 active:bg-blue-500/40 transition-colors"
            onMouseDown={() => setIsResizing(true)}
            style={{ zIndex: 50 }}
          />
        )}
      </div>

      {/* ── Main content area ── */}
      <SidebarInset>
        {/* Sticky topbar */}
        <header
          className={`sticky top-0 z-50 h-14 flex items-center justify-between px-4 sm:px-5 transition-all duration-200 ${
            scrolled
              ? "bg-white/75 dark:bg-zinc-950/75 backdrop-blur-lg border-b border-zinc-200/60 dark:border-zinc-800/60 shadow-sm shadow-zinc-900/5"
              : "bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900"
          }`}
        >
          {/* Left: mobile trigger + page title */}
          <div className="flex items-center gap-3">
            {isMobile && (
              <SidebarTrigger className="h-8 w-8 rounded-lg border border-zinc-200 dark:border-zinc-700" />
            )}
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
              {activeNav ? t(activeNav.key) : t("nav.dashboard")}
            </span>
          </div>

          {/* Right: language · theme · user */}
          <div className="flex items-center gap-2">

            {/* Language switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                  <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">{currentLang.flag} {currentLang.nativeLabel}</span>
                  <span className="sm:hidden">{currentLang.flag}</span>
                  <ChevronDown className="w-3 h-3 opacity-50" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem key={lang.id} onClick={() => setLanguage(lang.id)}
                    className={`cursor-pointer text-sm ${language === lang.id ? "font-semibold text-blue-600 dark:text-blue-400" : ""}`}>
                    <span className="mr-2 text-base">{lang.flag}</span>
                    {lang.nativeLabel}
                    {language === lang.id && <span className="ml-auto text-blue-500">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dark/light toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? "เปลี่ยนเป็น light mode" : "เปลี่ยนเป็น dark mode"}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {theme === "dark"
                ? <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
                : <Moon className="w-4 h-4" aria-hidden="true" />}
            </button>

            {/* User avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2" aria-label="เมนูผู้ใช้">
                  <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-zinc-900 shadow-sm cursor-pointer">
                    <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-blue-500 to-violet-600 text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user?.email}</p>
                </div>
                <DropdownMenuItem onClick={() => setLocation("/settings")} className="cursor-pointer mt-1">
                  <Settings className="mr-2 h-4 w-4" />{t("common.settings")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}
                  className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />{t("common.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto" data-main-scroll>
          {children}
        </main>
      </SidebarInset>

      <style>{`
        .anim-fade-up {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.45s ease, transform 0.45s ease;
        }
      `}</style>
    </>
  );
}
