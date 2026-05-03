import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

type TxType = "income" | "expense";
type FormState = {
  accountId: string; categoryId: string; type: TxType;
  description: string; amount: string; date: string; notes: string;
};

const EMPTY: FormState = {
  accountId: "", categoryId: "", type: "expense",
  description: "", amount: "", date: new Date().toISOString().slice(0, 10), notes: "",
};

export default function TransactionsPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"income" | "expense" | "all">("all");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.transactions.list.useQuery({ type: filterType, limit: 100 });
  const { data: accountsData } = trpc.accounts.list.useQuery();
  const { data: categoriesData } = trpc.categories.list.useQuery({ type: filterType === "all" ? "all" : filterType });

  const createMut = trpc.transactions.create.useMutation({
    onSuccess: () => { toast.success(t("messages.saved")); utils.transactions.list.invalidate(); close(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.transactions.update.useMutation({
    onSuccess: () => { toast.success(t("messages.updated")); utils.transactions.list.invalidate(); close(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.transactions.delete.useMutation({
    onSuccess: () => { toast.success(t("messages.deleted")); utils.transactions.list.invalidate(); setDeleteId(null); },
    onError: (e) => toast.error(e.message),
  });

  function close() { setOpen(false); setEditId(null); setForm(EMPTY); }
  function openCreate() { setForm(EMPTY); setEditId(null); setOpen(true); }
  function openEdit(row: any) {
    setForm({
      accountId: String(row.transaction.accountId),
      categoryId: String(row.transaction.categoryId),
      type: row.transaction.type,
      description: row.transaction.description,
      amount: row.transaction.amount,
      date: new Date(row.transaction.date).toISOString().slice(0, 10),
      notes: row.transaction.notes ?? "",
    });
    setEditId(row.transaction.id);
    setOpen(true);
  }

  function submit() {
    if (!form.description || !form.amount || !form.accountId || !form.categoryId) {
      toast.error("Please fill all required fields"); return;
    }
    const payload = {
      ...form,
      accountId: parseInt(form.accountId),
      categoryId: parseInt(form.categoryId),
    };
    if (editId) updateMut.mutate({ id: editId, data: payload });
    else createMut.mutate(payload);
  }

  const rows = (data?.rows ?? []).filter(r =>
    r.transaction.description.toLowerCase().includes(search.toLowerCase())
  );
  const isSaving = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{t("transactions.title")}</h1>
          <p className="text-sm text-zinc-500 mt-1">{data?.total ?? 0} records</p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus className="w-4 h-4" />{t("common.add")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t("common.search")}
            className="pl-9 h-9 border-zinc-200 dark:border-zinc-700" />
        </div>
        <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          {(["all", "income", "expense"] as const).map(f => (
            <button key={f} onClick={() => setFilterType(f)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                filterType === f
                  ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700"
              }`}>
              {f === "all" ? "All" : t(`transactions.${f}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-zinc-400">
            <TrendingUp className="w-8 h-8 opacity-30" />
            <p className="text-sm">{t("transactions.noTransactions")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Description</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Account</th>
                  <th className="text-right px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Amount</th>
                  <th className="text-right px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isIncome = row.transaction.type === "income";
                  return (
                    <tr key={row.transaction.id}
                      className="border-b border-zinc-50 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                        {new Date(row.transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">
                        {row.transaction.description}
                        {row.transaction.notes && <p className="text-xs text-zinc-400 font-normal mt-0.5 truncate max-w-xs">{row.transaction.notes}</p>}
                      </td>
                      <td className="px-4 py-3">
                        {row.category ? (
                          <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
                            <span>{row.category.icon}</span>{row.category.name}
                          </span>
                        ) : <span className="text-zinc-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                        {row.account?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold ${isIncome ? "text-emerald-600" : "text-red-500"}`}>
                          {isIncome ? "+" : "-"}${parseFloat(row.transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                            onClick={() => openEdit(row)}>
                            <Pencil className="w-3.5 h-3.5 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-50 dark:hover:bg-red-950/50"
                            onClick={() => setDeleteId(row.transaction.id)}>
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={v => { if (!v) close(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? t("common.edit") : t("common.add")} {t("transactions.title").replace(/s$/, "")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Type */}
            <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              {(["expense", "income"] as TxType[]).map(tp => (
                <button key={tp} onClick={() => setForm(f => ({ ...f, type: tp }))}
                  className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${
                    form.type === tp
                      ? tp === "income" ? "bg-emerald-600 text-white shadow-sm" : "bg-red-500 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-700"
                  }`}>
                  {tp === "income" ? <><TrendingUp className="w-3.5 h-3.5 inline mr-1" />{t("transactions.income")}</> : <><TrendingDown className="w-3.5 h-3.5 inline mr-1" />{t("transactions.expense")}</>}
                </button>
              ))}
            </div>
            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-sm">Description *</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Grocery shopping" className="h-10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Amount */}
              <div className="space-y-1.5">
                <Label className="text-sm">Amount *</Label>
                <Input type="number" step="0.01" value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00" className="h-10" />
              </div>
              {/* Date */}
              <div className="space-y-1.5">
                <Label className="text-sm">Date *</Label>
                <Input type="date" value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="h-10" />
              </div>
            </div>
            {/* Account */}
            <div className="space-y-1.5">
              <Label className="text-sm">Account *</Label>
              <Select value={form.accountId} onValueChange={v => setForm(f => ({ ...f, accountId: v }))}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  {(accountsData ?? []).map(a => (
                    <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-sm">Category *</Label>
              <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {(categoriesData ?? []).filter(c => c.type === form.type).map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.icon} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-sm">Notes</Label>
              <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Optional notes" className="h-10" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>{t("common.cancel")}</Button>
            <Button onClick={submit} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 gap-2">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editId ? t("common.save") : t("common.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={v => { if (!v) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMut.mutate({ id: deleteId })}
              className="bg-red-600 hover:bg-red-700">
              {deleteMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
