import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Wallet, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

type FormState = {
  name: string; type: "asset" | "liability"; currency: string;
  initialBalance: string; color: string; icon: string;
};
const EMPTY: FormState = { name: "", type: "asset", currency: "USD", initialBalance: "0", color: "#3B82F6", icon: "🏦" };

const CURRENCY_OPTIONS = ["USD", "THB", "LAK", "EUR", "GBP", "JPY", "CNY", "SGD"];
const ICON_OPTIONS = ["🏦", "💳", "💰", "🏠", "🚗", "📈", "💎", "🏧", "💼", "🪙"];

export default function AccountsPage() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const utils = trpc.useUtils();

  const { data: accounts, isLoading } = trpc.accounts.list.useQuery();
  const createMut = trpc.accounts.create.useMutation({
    onSuccess: () => { toast.success(t("messages.saved")); utils.accounts.list.invalidate(); close(); },
    onError: e => toast.error(e.message),
  });
  const updateMut = trpc.accounts.update.useMutation({
    onSuccess: () => { toast.success(t("messages.updated")); utils.accounts.list.invalidate(); close(); },
    onError: e => toast.error(e.message),
  });
  const deleteMut = trpc.accounts.delete.useMutation({
    onSuccess: () => { toast.success(t("messages.deleted")); utils.accounts.list.invalidate(); setDeleteId(null); },
    onError: e => toast.error(e.message),
  });

  function close() { setOpen(false); setEditId(null); setForm(EMPTY); }
  function openCreate() { setForm(EMPTY); setEditId(null); setOpen(true); }
  function openEdit(a: any) {
    setForm({ name: a.name, type: a.type, currency: a.currency, initialBalance: a.initialBalance, color: a.color ?? "#3B82F6", icon: a.icon ?? "🏦" });
    setEditId(a.id); setOpen(true);
  }
  function submit() {
    if (!form.name) { toast.error("Name is required"); return; }
    if (editId) updateMut.mutate({ id: editId, data: form });
    else createMut.mutate(form);
  }
  const isSaving = createMut.isPending || updateMut.isPending;

  const assets = (accounts ?? []).filter(a => a.type === "asset");
  const liabilities = (accounts ?? []).filter(a => a.type === "liability");
  const totalAssets = assets.reduce((s, a) => s + parseFloat(a.initialBalance), 0);
  const totalLiab = liabilities.reduce((s, a) => s + parseFloat(a.initialBalance), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{t("accounts.title")}</h1>
          <p className="text-sm text-zinc-500 mt-1">{accounts?.length ?? 0} accounts</p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus className="w-4 h-4" />{t("common.add")}
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Assets", value: totalAssets, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
          { label: "Total Liabilities", value: totalLiab, icon: TrendingDown, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/40" },
          { label: "Net Worth", value: totalAssets - totalLiab, icon: Wallet, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40" },
        ].map(item => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="border border-zinc-100 dark:border-zinc-800 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.label}</p>
                  <p className={`text-xl font-bold ${item.color}`}>
                    ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Account cards */}
      {isLoading ? (
        <div className="flex justify-center h-32 items-center"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>
      ) : (
        <div className="space-y-4">
          {[{ title: "Assets", items: assets }, { title: "Liabilities", items: liabilities }].map(section => (
            <div key={section.title}>
              <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">{section.title}</h2>
              {section.items.length === 0 ? (
                <Card className="border-dashed border-zinc-200 dark:border-zinc-700">
                  <CardContent className="p-6 text-center text-zinc-400 text-sm">No {section.title.toLowerCase()} yet</CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {section.items.map(account => (
                    <Card key={account.id} className="border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                              style={{ background: `${account.color ?? "#3B82F6"}20` }}>
                              {account.icon ?? "🏦"}
                            </div>
                            <div>
                              <p className="font-semibold text-zinc-900 dark:text-white text-sm">{account.name}</p>
                              <Badge variant="outline" className="text-xs mt-0.5">{account.currency}</Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-blue-50 dark:hover:bg-blue-950/50" onClick={() => openEdit(account)}>
                              <Pencil className="w-3.5 h-3.5 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-50 dark:hover:bg-red-950/50" onClick={() => setDeleteId(account.id)}>
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                          <p className={`text-xl font-bold ${account.type === "asset" ? "text-emerald-600" : "text-red-500"}`}>
                            ${parseFloat(account.initialBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-zinc-400 mt-0.5">Initial balance</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={v => { if (!v) close(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? t("common.edit") : t("common.add")} Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              {(["asset", "liability"] as const).map(tp => (
                <button key={tp} onClick={() => setForm(f => ({ ...f, type: tp }))}
                  className={`flex-1 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                    form.type === tp ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white" : "text-zinc-500"}`}>
                  {tp}
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Main Bank Account" className="h-10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Currency</Label>
                <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>{CURRENCY_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Initial Balance</Label>
                <Input type="number" step="0.01" value={form.initialBalance} onChange={e => setForm(f => ({ ...f, initialBalance: e.target.value }))} className="h-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Icon</Label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map(icon => (
                  <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
                    className={`w-9 h-9 text-xl rounded-lg border-2 transition-all ${form.icon === icon ? "border-blue-500 bg-blue-50 dark:bg-blue-950/50" : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"}`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Color</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer p-1" />
                <Input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="h-10 font-mono" maxLength={7} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>{t("common.cancel")}</Button>
            <Button onClick={submit} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 gap-2">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}{editId ? t("common.save") : t("common.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={v => { if (!v) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>This will also remove all associated transactions.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMut.mutate({ id: deleteId })} className="bg-red-600 hover:bg-red-700">
              {deleteMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
