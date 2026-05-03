import { useLocation } from "wouter";
import { useI18n, LANGUAGES } from "@/contexts/I18nContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  TrendingUp, ShieldCheck, BarChart3, Globe,
  ArrowRight, Zap, Lock, FileSpreadsheet,
  Menu, X, Sun, Moon,
} from "lucide-react";
import { useState } from "react";

// ── Public Landing Page ─────────────────────────────────────────────────────
// แสดงเมื่อผู้ใช้ยังไม่ได้เข้าสู่ระบบ — ไม่ redirect ไป /login ทันที
// ─────────────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: BarChart3,
    title: "Real vs Nominal Value",
    desc: "ดูมูลค่าจริงของเงินที่ปรับตามอัตราเงินเฟ้อแบบเรียลไทม์",
  },
  {
    icon: ShieldCheck,
    title: "AES-256 Encryption",
    desc: "ข้อมูลการเงินทุกอย่างเข้ารหัสด้วยมาตรฐานระดับองค์กร",
  },
  {
    icon: Globe,
    title: "Thai · Lao · English",
    desc: "รองรับ 3 ภาษา ไทย ลาว และอังกฤษ ครบในที่เดียว",
  },
  {
    icon: FileSpreadsheet,
    title: "Professional Export",
    desc: "ส่งออกข้อมูลเป็น CSV / Excel สำหรับโปรแกรมบัญชีทุกชนิด",
  },
  {
    icon: Zap,
    title: "Tax Calculations",
    desc: "คำนวณ VAT และภาษีรายได้อัตโนมัติ แม่นยำทุกรายการ",
  },
  {
    icon: Lock,
    title: "Audit Logging",
    desc: "บันทึกประวัติการเปลี่ยนแปลงทุกอย่างพร้อม timestamp",
  },
];

const STATS = [
  { value: "3", label: "ภาษาที่รองรับ" },
  { value: "AES-256", label: "มาตรฐานการเข้ารหัส" },
  { value: "100%", label: "Open Source" },
];

export default function Landing() {
  const [, setLocation] = useLocation();
  const { t, language, setLanguage } = useI18n();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">

      {/* ── Topbar / Navbar ──────────────────────────────────────────── */}
      <header className="bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800/80 sticky top-0 z-50 w-full">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2.5 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
            aria-label="Flow Finance By Bay — หน้าหลัก"
          >
            <div className="w-8 h-8 rounded-[9px] bg-blue-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-600/25">
              <TrendingUp className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[14px] font-bold text-zinc-900 dark:text-white tracking-tight">Flow Finance</span>
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">By Bay</span>
            </div>
          </button>

          {/* Desktop right controls */}
          <nav className="hidden sm:flex items-center gap-2" aria-label="การนำทางหลัก">

            {/* Language switcher */}
            <div className="flex items-center gap-0.5 mr-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  aria-pressed={language === lang.id}
                  aria-label={`เปลี่ยนภาษาเป็น ${lang.label}`}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    language === lang.id
                      ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800"
                      : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-white"
                  }`}
                >
                  <span aria-hidden="true">{lang.flag}</span>
                  <span className="hidden md:inline">{lang.nativeLabel}</span>
                </button>
              ))}
            </div>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? "เปลี่ยนเป็น light mode" : "เปลี่ยนเป็น dark mode"}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {theme === "dark"
                ? <Sun className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                : <Moon className="w-3.5 h-3.5" aria-hidden="true" />}
            </button>

            {/* Sign In */}
            <button
              onClick={() => setLocation("/login")}
              className="
                inline-flex items-center justify-center h-9 px-4
                rounded-lg text-sm font-medium
                text-zinc-700 dark:text-zinc-300
                border border-zinc-200 dark:border-zinc-700
                hover:bg-zinc-50 dark:hover:bg-zinc-800
                hover:border-zinc-300 dark:hover:border-zinc-600
                transition-all duration-150 active:scale-[0.97]
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              "
            >
              {t("common.signIn")}
            </button>

            {/* Register */}
            <button
              onClick={() => setLocation("/login")}
              className="
                inline-flex items-center justify-center h-9 px-4
                rounded-lg text-sm font-medium
                bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                text-white shadow-sm shadow-blue-600/20
                transition-all duration-150 active:scale-[0.97]
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
              "
            >
              {t("auth.createAccount")}
            </button>
          </nav>

          {/* Mobile hamburger */}
          <div className="sm:hidden flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              {theme === "dark"
                ? <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
                : <Moon className="w-4 h-4" aria-hidden="true" />}
            </button>
            <button
              className="
                flex items-center justify-center
                w-9 h-9 rounded-lg
                border border-zinc-200 dark:border-zinc-700
                text-zinc-600 dark:text-zinc-300
                hover:bg-zinc-50 dark:hover:bg-zinc-800
                transition-colors
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              "
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="landing-mobile-menu"
              aria-label={mobileMenuOpen ? "ปิดเมนู" : "เปิดเมนู"}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" aria-hidden="true" /> : <Menu className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div
            id="landing-mobile-menu"
            className="sm:hidden flex flex-col gap-3 px-5 pb-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950"
            role="navigation"
            aria-label="เมนูมือถือ"
          >
            {/* Language */}
            <div className="flex items-center gap-1 flex-wrap">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  aria-pressed={language === lang.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    language === lang.id
                      ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800"
                      : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.nativeLabel}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => { setLocation("/login"); setMobileMenuOpen(false); }}
              className="
                flex items-center justify-center h-11 rounded-xl
                text-[15px] font-medium
                text-zinc-700 dark:text-zinc-300
                border border-zinc-200 dark:border-zinc-700
                hover:bg-zinc-50 dark:hover:bg-zinc-800
                transition-colors active:scale-[0.98]
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              "
            >
              {t("common.signIn")}
            </button>
            <button
              onClick={() => { setLocation("/login"); setMobileMenuOpen(false); }}
              className="
                flex items-center justify-center h-11 rounded-xl
                text-[15px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700
                shadow-sm shadow-blue-600/20
                transition-colors active:scale-[0.98]
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              "
            >
              {t("auth.createAccount")}
            </button>
          </div>
        )}
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Subtle background grid */}
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(var(--color-zinc-900) 1px, transparent 1px),
                              linear-gradient(90deg, var(--color-zinc-900) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
          aria-hidden="true"
        />
        {/* Blue accent glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/[0.06] dark:bg-blue-400/[0.07] rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-6 pt-14 pb-20 sm:pt-20 sm:pb-28">

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-medium ring-1 ring-blue-200 dark:ring-blue-800 mb-6">
            <TrendingUp className="w-3 h-3" aria-hidden="true" />
            Personal Finance Tracker
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white tracking-tight leading-[1.1] mb-6 max-w-3xl">
            จัดการเงินให้{" "}
            <span className="text-blue-600 dark:text-blue-400">ชัดเจน</span>
            <br />
            ทุกบาท ทุกธุรกรรม
          </h1>

          {/* Tagline */}
          <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl mb-10">
            {t("auth.tagline")}
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-3"
            role="group"
            aria-label="การดำเนินการหลัก"
          >
            <button
              onClick={() => setLocation("/login")}
              className="
                inline-flex items-center justify-center gap-2
                h-12 px-6 rounded-xl
                bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                text-white font-semibold text-[15px]
                shadow-md shadow-blue-600/20
                transition-all duration-150 active:scale-[0.98]
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                group
              "
            >
              {t("auth.createAccount")}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </button>
            <button
              onClick={() => setLocation("/login")}
              className="
                inline-flex items-center justify-center
                h-12 px-6 rounded-xl
                text-[15px] font-medium
                text-zinc-700 dark:text-zinc-300
                border border-zinc-200 dark:border-zinc-700
                hover:bg-zinc-50 dark:hover:bg-zinc-800
                transition-all duration-150 active:scale-[0.98]
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              "
            >
              {t("common.signIn")}
            </button>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-8 mt-14 pt-10 border-t border-zinc-100 dark:border-zinc-800/80">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{s.value}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ──────────────────────────────────────────────── */}
      <section
        className="bg-zinc-50 dark:bg-zinc-900/50 border-y border-zinc-100 dark:border-zinc-800/80 py-16 sm:py-20"
        aria-labelledby="features-heading"
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="mb-10">
            <h2
              id="features-heading"
              className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-3"
            >
              ทุกอย่างที่คุณต้องการ
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              ออกแบบมาเพื่อคนที่อยากรู้ว่าเงินตัวเองไปอยู่ที่ไหน
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="
                  bg-white dark:bg-zinc-900 rounded-xl p-5
                  border border-zinc-100 dark:border-zinc-800/80
                  hover:border-zinc-200 dark:hover:border-zinc-700
                  hover:shadow-sm transition-all duration-150
                "
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center mb-4">
                  <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1.5">{title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">
            พร้อมเริ่มต้นแล้วหรือยัง?
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto">
            สร้างบัญชีฟรี เริ่มติดตามการเงินของคุณได้เลยทันที
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setLocation("/login")}
              className="
                inline-flex items-center justify-center gap-2
                h-12 px-8 rounded-xl
                bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                text-white font-semibold text-[15px]
                shadow-md shadow-blue-600/20
                transition-all duration-150 active:scale-[0.98]
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                group
              "
            >
              {t("auth.createAccount")}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </button>
            <button
              onClick={() => setLocation("/login")}
              className="
                inline-flex items-center justify-center
                h-12 px-8 rounded-xl
                text-[15px] font-medium
                text-zinc-700 dark:text-zinc-300
                border border-zinc-200 dark:border-zinc-700
                hover:bg-zinc-50 dark:hover:bg-zinc-800
                transition-all duration-150 active:scale-[0.98]
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              "
            >
              {t("common.signIn")}
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-100 dark:border-zinc-800/80 py-8">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-white" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight">Flow Finance</span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">by Bay</span>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            © {new Date().getFullYear()} Flow Finance Tracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
