import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/contexts/I18nContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpendingHeatmap } from "@/components/SpendingHeatmap";
import {
  TrendingUp, TrendingDown, Wallet, Activity,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { useEffect } from "react";

// ── helpers ─────────────────────────────────────────────────────────────────
function useScrollReveal() {
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
  }, []);
}

const SPENDING_DATA = [
  { location: "Shopping Mall",  amount: 1250.5,  transactionCount: 15 },
  { location: "Restaurants",    amount: 890.25,  transactionCount: 23 },
  { location: "Gas Stations",   amount: 450.0,   transactionCount: 8  },
  { location: "Groceries",      amount: 320.75,  transactionCount: 12 },
  { location: "Entertainment",  amount: 280.5,   transactionCount: 6  },
];

const FEATURE_LIST = [
  { emoji: "📊", titleKey: "Real vs Nominal View",    descKey: "See purchasing power adjusted for inflation" },
  { emoji: "🧾", titleKey: "Tax Calculations",        descKey: "Auto VAT & income tax for accurate reporting" },
  { emoji: "🔒", titleKey: "AES-256 Encryption",      descKey: "Your financial data encrypted at rest" },
  { emoji: "📋", titleKey: "Audit Logging",           descKey: "Full change history with timestamps" },
  { emoji: "🌐", titleKey: "Multi-Language Support",  descKey: "English · Thai · Lao" },
  { emoji: "📁", titleKey: "Professional Export",     descKey: "CSV / Excel for accounting integration" },
];

// ── component ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  useScrollReveal();

  const stats = [
    {
      labelKey: "dashboard.totalIncome",
      value: "$12,450.50", change: "+5.2%", up: true,
      icon: TrendingUp,
      colorClass: "text-emerald-600 dark:text-emerald-400",
      bgClass: "bg-emerald-50 dark:bg-emerald-950/50",
      noteKey: "dashboard.afterTax",
    },
    {
      labelKey: "dashboard.totalExpense",
      value: "$8,320.75", change: "+2.1%", up: false,
      icon: TrendingDown,
      colorClass: "text-red-600 dark:text-red-400",
      bgClass: "bg-red-50 dark:bg-red-950/50",
      noteKey: "dashboard.vsLastMonth",
    },
    {
      labelKey: "dashboard.netIncome",
      value: "$4,129.75", change: "+8.4%", up: true,
      icon: Wallet,
      colorClass: "text-blue-600 dark:text-blue-400",
      bgClass: "bg-blue-50 dark:bg-blue-950/50",
      noteKey: "dashboard.afterTax",
    },
    {
      labelKey: "dashboard.realValue",
      value: "$4,098.32", change: "-0.8%", up: false,
      icon: Activity,
      colorClass: "text-violet-600 dark:text-violet-400",
      bgClass: "bg-violet-50 dark:bg-violet-950/50",
      noteKey: "dashboard.inflationAdj",
    },
  ];

  return (
    <div className="space-y-8">

      {/* ── Welcome ── */}
      <div className="anim-fade-up" style={{ transitionDelay: "0ms" }}>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          {t("dashboard.welcome")}, {user?.name || "User"} 👋
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {t("dashboard.title")} — {new Date().toLocaleDateString(undefined, {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          })}
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.labelKey}
              className="anim-fade-up border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow"
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  {t(s.labelKey)}
                </CardTitle>
                <div className={`w-8 h-8 rounded-lg ${s.bgClass} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${s.colorClass}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${s.colorClass}`}>{s.value}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  {s.up
                    ? <ArrowUpRight className="w-3 h-3 text-emerald-500 shrink-0" />
                    : <ArrowDownRight className="w-3 h-3 text-zinc-400 shrink-0" />}
                  <span className={`text-xs font-medium ${s.up ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`}>
                    {s.change}
                  </span>
                  <span className="text-xs text-zinc-400 truncate">· {t(s.noteKey)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Spending heatmap ── */}
      <div className="anim-fade-up" style={{ transitionDelay: "300ms" }}>
        <SpendingHeatmap
          data={SPENDING_DATA}
          title={t("dashboard.spendingByCategory")}
          description={t("dashboard.recentTransactions")}
        />
      </div>

      {/* ── Feature highlights ── */}
      <div className="anim-fade-up" style={{ transitionDelay: "380ms" }}>
        <Card className="border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-zinc-900 dark:text-white">
              {t("dashboard.features")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {FEATURE_LIST.map((f) => (
                <div key={f.titleKey}
                  className="flex gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                  <span className="text-xl leading-none mt-0.5">{f.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{f.titleKey}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{f.descKey}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
