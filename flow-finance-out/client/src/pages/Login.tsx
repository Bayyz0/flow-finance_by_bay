import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n, LANGUAGES } from "@/contexts/I18nContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  TrendingUp, Eye, EyeOff, ArrowRight, Loader2,
  ShieldCheck, BarChart3, Globe, ArrowLeft, Sun, Moon,
  Mail, Lock, User, ChevronRight,
} from "lucide-react";

// ── Schemas ──────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  username: z.string().min(1, "Required"),
  password: z.string().min(1, "Required"),
  rememberMe: z.boolean().optional(),
});
const registerSchema = z.object({
  username: z.string().min(3, "Min 3 chars").max(50),
  password: z.string().min(6, "Min 6 chars"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  name: z.string().optional(),
});
const forgotSchema = z.object({
  email: z.string().email("Invalid email"),
});

type LoginForm    = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;
type ForgotForm   = z.infer<typeof forgotSchema>;

// ── Constants ────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: BarChart3,   label: "Real vs Nominal value tracking" },
  { icon: ShieldCheck, label: "AES-256 encrypted data" },
  { icon: Globe,       label: "Thai · Lao · English" },
];

// ── Password strength ────────────────────────────────────────────────────────
function getStrength(pw: string): { level: 0 | 1 | 2 | 3; key: string; color: string } {
  if (!pw) return { level: 0, key: "", color: "" };
  let s = 0;
  if (pw.length >= 8)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { level: 1, key: "auth.passwordStrengthLow",  color: "text-red-500" };
  if (s === 2) return { level: 2, key: "auth.passwordStrengthMed",  color: "text-amber-500" };
  return               { level: 3, key: "auth.passwordStrengthHigh", color: "text-emerald-500" };
}

// ── Google SVG ───────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function Login() {
  const [mode, setMode]             = useState<"login" | "register">("login");
  const [showPw, setShowPw]         = useState(false);
  const [showRegPw, setShowRegPw]   = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [pwValue, setPwValue]       = useState("");

  const { t, language, setLanguage } = useI18n();
  const { theme, setTheme }          = useTheme();
  const { refresh }                  = useAuth();
  const [, setLocation]              = useLocation();

  // tRPC mutations
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      toast.success(t("auth.welcomeBack" as any));
      await refresh();
      setLocation("/");
    },
    onError: (e) => setError(e.message),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success(t("auth.createAccount") + " ✓");
      setError(null);
      setMode("login");
      registerForm.reset();
    },
    onError: (e) => setError(e.message),
  });

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  // Forms
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "", rememberMe: false },
  });
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "", email: "", name: "" },
  });
  const forgotForm = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  // Handlers
  const handleLogin = (d: LoginForm) => {
    setError(null);
    loginMutation.mutate({ username: d.username, password: d.password });
  };

  const handleRegister = (d: RegisterForm) => {
    setError(null);
    registerMutation.mutate({
      username: d.username,
      password: d.password,
      email: d.email || undefined,
      name: d.name || undefined,
    });
  };

  const handleForgot = forgotForm.handleSubmit(async (d: ForgotForm) => {
    await new Promise((r) => setTimeout(r, 1000));
    setForgotSent(true);
    toast.success((t("auth.resetLinkSent" as any) as string).replace("{email}", d.email));
  });

  const handleGoogleLogin = () => {
    toast.info(t("auth.googleComingSoon" as any));
    // Production: window.location.href = "/auth/google";
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError(null);
    loginForm.reset();
    registerForm.reset();
    setPwValue("");
  };

  const pwStrength = getStrength(pwValue);

  return (
    <div className="min-h-screen flex bg-white dark:bg-zinc-950">

      {/* Left branding panel */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 bg-zinc-900 relative overflow-hidden select-none"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#1d4ed8_0%,_transparent_60%),radial-gradient(ellipse_at_bottom_right,_#7c3aed_0%,_transparent_60%)] opacity-40" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/40">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">Flow Finance</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white leading-snug">
              Your money,<br />
              <span className="text-blue-400">crystal clear.</span>
            </h1>
            <p className="text-zinc-400 text-base leading-relaxed max-w-xs">
              {t("auth.tagline")}
            </p>
          </div>

          <ul className="space-y-3">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-zinc-300 text-sm">
                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-blue-400" />
                </span>
                {label}
              </li>
            ))}
          </ul>

          <div className="flex gap-8 pt-2">
            {[
              { num: "50K+", label: "Users" },
              { num: "99.9%", label: "Uptime" },
              { num: "฿2B+", label: "Tracked" },
            ].map(({ num, label }) => (
              <div key={label}>
                <div className="text-2xl font-bold text-white">{num}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-zinc-600 text-xs">© {new Date().getFullYear()} Flow Finance Tracker</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 gap-2 border-b border-zinc-100 dark:border-zinc-800/80 lg:border-none">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors rounded-lg px-2 py-1.5 -ml-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="กลับไปหน้าหลัก"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">กลับหน้าหลัก</span>
          </button>

          <div className="flex items-center gap-1.5">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                aria-pressed={language === lang.id}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  language === lang.id
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <span>{lang.flag}</span>
                <span className="hidden sm:inline">{lang.nativeLabel}</span>
              </button>
            ))}

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {theme === "dark"
                ? <Sun className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                : <Moon className="w-3.5 h-3.5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-10">
          <div className="w-full max-w-sm space-y-6">

            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-2 justify-center mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <span className="font-bold text-zinc-900 dark:text-white text-base">Flow Finance</span>
            </div>

            {/* Heading */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {mode === "login" ? t("auth.welcomeBack" as any) : t("auth.createAccount")}
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {mode === "login" ? t("auth.loginSubtitle" as any) : t("auth.registerSubtitle" as any)}
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <Alert variant="destructive" className="py-2 text-sm" role="alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Google button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2.5 h-11 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm font-medium transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <GoogleIcon />
              {mode === "login" ? t("auth.signInWithGoogle" as any) : t("auth.signUpWithGoogle" as any)}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
              <span className="text-xs text-zinc-400 whitespace-nowrap">{t("auth.orContinueWith" as any)}</span>
              <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
            </div>

            {/* LOGIN FORM */}
            {mode === "login" && (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4" noValidate>

                <div className="space-y-1.5">
                  <Label htmlFor="uname" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {t("auth.username")}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    <Input
                      id="uname"
                      placeholder="ชื่อผู้ใช้"
                      autoComplete="username"
                      className="h-11 pl-9 rounded-lg border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-visible:ring-blue-500 text-sm"
                      aria-invalid={loginForm.formState.errors.username ? "true" : undefined}
                      {...loginForm.register("username")}
                    />
                  </div>
                  {loginForm.formState.errors.username && (
                    <p className="text-xs text-red-500" role="alert">{loginForm.formState.errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pw" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {t("auth.password")}
                    </Label>
                    <button
                      type="button"
                      onClick={() => setForgotOpen(true)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                    >
                      {t("auth.forgotPassword" as any)}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    <Input
                      id="pw"
                      type={showPw ? "text" : "password"}
                      placeholder="รหัสผ่าน"
                      autoComplete="current-password"
                      className="h-11 pl-9 pr-10 rounded-lg border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-visible:ring-blue-500 text-sm"
                      aria-invalid={loginForm.formState.errors.password ? "true" : undefined}
                      {...loginForm.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      tabIndex={-1}
                      aria-label={showPw ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors focus:outline-none"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-red-500" role="alert">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="rememberMe"
                    onCheckedChange={(v) => loginForm.setValue("rememberMe", v === true)}
                    className="rounded border-zinc-300 dark:border-zinc-600"
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                    {t("auth.rememberMe" as any)}
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold shadow-sm shadow-blue-600/20 transition-all flex items-center justify-center gap-2 group mt-2"
                  aria-busy={isLoading}
                >
                  {isLoading
                    ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    : <>{t("common.signIn")}<ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>}
                </Button>
              </form>
            )}

            {/* REGISTER FORM */}
            {mode === "register" && (
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4" noValidate>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="rfname" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {t("auth.firstName" as any)}
                    </Label>
                    <Input id="rfname" placeholder="สมชาย" autoComplete="given-name"
                      className="h-11 rounded-lg border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-visible:ring-blue-500 text-sm"
                      {...registerForm.register("name")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rlname" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {t("auth.lastName" as any)}
                    </Label>
                    <Input id="rlname" placeholder="วงศ์ไทย" autoComplete="family-name"
                      className="h-11 rounded-lg border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-visible:ring-blue-500 text-sm" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="runame" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {t("auth.username")}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    <Input id="runame" placeholder="janedoe" autoComplete="username"
                      className="h-11 pl-9 rounded-lg border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-visible:ring-blue-500 text-sm"
                      aria-invalid={registerForm.formState.errors.username ? "true" : undefined}
                      {...registerForm.register("username")} />
                  </div>
                  {registerForm.formState.errors.username && (
                    <p className="text-xs text-red-500" role="alert">{registerForm.formState.errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="remail" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {t("auth.email")}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    <Input id="remail" type="email" placeholder="jane@example.com" autoComplete="email"
                      className="h-11 pl-9 rounded-lg border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-visible:ring-blue-500 text-sm"
                      aria-invalid={registerForm.formState.errors.email ? "true" : undefined}
                      {...registerForm.register("email")} />
                  </div>
                  {registerForm.formState.errors.email && (
                    <p className="text-xs text-red-500" role="alert">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rpw" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {t("auth.password")}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    <Input id="rpw" type={showRegPw ? "text" : "password"} placeholder="อย่างน้อย 6 ตัวอักษร" autoComplete="new-password"
                      className="h-11 pl-9 pr-10 rounded-lg border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-visible:ring-blue-500 text-sm"
                      aria-invalid={registerForm.formState.errors.password ? "true" : undefined}
                      {...registerForm.register("password", { onChange: (e) => setPwValue(e.target.value) })} />
                    <button type="button" onClick={() => setShowRegPw(!showRegPw)} tabIndex={-1}
                      aria-label={showRegPw ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors focus:outline-none">
                      {showRegPw ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                    </button>
                  </div>

                  {pwValue && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                            i <= pwStrength.level
                              ? pwStrength.level === 1 ? "bg-red-500" : pwStrength.level === 2 ? "bg-amber-500" : "bg-emerald-500"
                              : "bg-zinc-200 dark:bg-zinc-700"
                          }`} />
                        ))}
                      </div>
                      <p className={`text-xs ${pwStrength.color}`}>
                        {pwStrength.key ? t(pwStrength.key as any) : ""}
                      </p>
                    </div>
                  )}

                  {registerForm.formState.errors.password && (
                    <p className="text-xs text-red-500" role="alert">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={isLoading}
                  className="w-full h-11 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold shadow-sm shadow-blue-600/20 transition-all flex items-center justify-center gap-2 group mt-2"
                  aria-busy={isLoading}>
                  {isLoading
                    ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    : <>{t("auth.createAccount")}<ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>}
                </Button>

                <p className="text-xs text-zinc-400 text-center leading-relaxed">
                  {"By signing up you agree to our "}
                  <button type="button" className="underline underline-offset-2 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Terms</button>
                  {" & "}
                  <button type="button" className="underline underline-offset-2 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Privacy Policy</button>
                </p>
              </form>
            )}

            {/* Switch mode */}
            <div className="text-center pt-1">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {mode === "login" ? "ยังไม่มีบัญชี? " : "มีบัญชีอยู่แล้ว? "}
              </span>
              <button onClick={switchMode} disabled={isLoading}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline underline-offset-4 font-medium disabled:opacity-50 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                {mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={(open) => {
        setForgotOpen(open);
        if (!open) { setForgotSent(false); forgotForm.reset(); }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">🔑</span>
              {t("auth.forgotPasswordTitle" as any)}
            </DialogTitle>
            <DialogDescription>{t("auth.forgotPasswordDesc" as any)}</DialogDescription>
          </DialogHeader>

          {forgotSent ? (
            <div className="py-4 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center mx-auto text-2xl" aria-hidden="true">
                ✓
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {(t("auth.resetLinkSent" as any) as string).replace("{email}", forgotForm.getValues("email"))}
              </p>
              <Button variant="outline" className="w-full" onClick={() => { setForgotOpen(false); setForgotSent(false); forgotForm.reset(); }}>
                {t("common.close")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgot} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="forgotEmail" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {t("auth.email")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  <Input id="forgotEmail" type="email" placeholder="your@email.com" autoComplete="email"
                    className="h-11 pl-9 rounded-lg focus-visible:ring-blue-500 text-sm"
                    aria-invalid={forgotForm.formState.errors.email ? "true" : undefined}
                    {...forgotForm.register("email")} />
                </div>
                {forgotForm.formState.errors.email && (
                  <p className="text-xs text-red-500" role="alert">{forgotForm.formState.errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full h-11 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                {forgotForm.formState.isSubmitting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : t("auth.sendResetLink" as any)}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
