import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import API from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Loader2,
  Filter,
} from "lucide-react";

export default function TransactionsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Receipt Preview Dialog State
  const [receiptModal, setReceiptModal] = useState({
    isOpen: false,
    transaction: null,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transRes, catRes] = await Promise.all([
        API.get("/transactions"),
        API.get("/categories"),
      ]);
      setTransactions(transRes.data?.data || []);
      setCategories(catRes.data?.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Quick Action via URL
  useEffect(() => {
    if (searchParams.get("action") === "add") {
      const flow = searchParams.get("flow");
      setFormData((prev) => ({
        ...prev,
        type: flow === "income" ? "income" : "expense",
      }));
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: "",
      amount: "",
      type: "expense",
      category: categories[0]?._id || "",
      description: "",
    });
    setImageFile(null);
    setModalError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx) => {
    setEditingId(tx._id);
    setFormData({
      title: tx.title || "",
      amount: tx.amount || "",
      type: tx.type || "expense",
      category: tx.category?._id || tx.category || "",
      description: tx.description || "",
    });
    setImageFile(null);
    setModalError("");
    setIsModalOpen(true);
  };

  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!formData.category && categories.length > 0) {
      formData.category = categories[0]._id;
    }

    if (!formData.category) {
      setModalError("Please create at least one category first.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("amount", formData.amount);
      payload.append("type", formData.type);
      payload.append("category", formData.category);
      payload.append("user", user._id);
      if (formData.description) payload.append("description", formData.description);
      if (imageFile) payload.append("image", imageFile);

      if (editingId) {
        await API.put(`/transactions/${editingId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await API.post("/transactions", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setModalError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        "Failed to save transaction."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await API.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert("Failed to delete transaction.");
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    const catId = tx.category?._id || tx.category;
    const matchesCategory = categoryFilter === "all" || catId === categoryFilter;
    const text = `${tx.title} ${tx.description || ""}`.toLowerCase();
    const matchesQuery = !searchQuery || text.includes(searchQuery.toLowerCase().trim());
    return matchesType && matchesCategory && matchesQuery;
  });

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const netInflow = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="w-full pt-20 pb-12 flex-1">
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                  Net Inflow
                </CardTitle>
                <div className="h-7 w-7 rounded-md bg-accent flex items-center justify-center text-primary">
                  <ArrowDownLeft className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {netInflow >= 0 ? "+" : ""}${netInflow.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Real-time balance</p>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                  Total Income
                </CardTitle>
                <div className="h-7 w-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ArrowDownLeft className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-emerald-600">
                  +${totalIncome.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {transactions.filter((t) => t.type === "income").length} credits
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                  Total Outflow
                </CardTitle>
                <div className="h-7 w-7 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-rose-600">
                  -${totalExpense.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {transactions.filter((t) => t.type === "expense").length} debits
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                  Audited Receipts
                </CardTitle>
                <div className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center text-foreground">
                  <Receipt className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {transactions.filter((t) => t.image).length} / {transactions.length}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">With receipt attached</p>
              </CardContent>
            </Card>
          </div>

          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>Transactions</span>
                <Badge variant="secondary" className="font-normal text-xs">
                  {filteredTransactions.length} records
                </Badge>
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage, filter, and track all your financial operations
              </p>
            </div>

            <Button onClick={handleOpenAdd} className="gap-2 shadow-xs">
              <Plus className="h-4 w-4" />
              <span>Add Transaction</span>
            </Button>
          </div>

          {/* Filter Bar */}
          <Card className="p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or note..."
                  className="pl-9 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Type Filter Pills */}
                <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/40">
                  {["all", "income", "expense"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer ${
                        typeFilter === t
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Category Dropdown */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-9 px-3 text-xs rounded-md border border-input bg-background font-medium focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Transactions Table Card */}
          <Card className="shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-[30%]">Title & Note</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Receipt</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                      <span>Loading transactions...</span>
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No transactions found. Click "Add Transaction" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx) => (
                    <TableRow key={tx._id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              tx.type === "income"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-rose-50 text-rose-600"
                            }`}
                          >
                            {tx.type === "income" ? (
                              <ArrowDownLeft className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {tx.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {tx.description || "No note"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary" className="font-normal text-xs">
                          {tx.category?.title || "General"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={tx.type === "income" ? "success" : "danger"}
                          className="capitalize text-xs font-medium"
                        >
                          {tx.type}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right font-bold text-sm">
                        <span
                          className={
                            tx.type === "income" ? "text-emerald-600" : "text-rose-600"
                          }
                        >
                          {tx.type === "income" ? "+" : "-"}${Number(tx.amount).toFixed(2)}
                        </span>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(tx.createdAt || Date.now()).toLocaleDateString()}
                      </TableCell>

                      <TableCell className="text-center">
                        {tx.image ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReceiptModal({ isOpen: true, transaction: tx })}
                            className="h-8 gap-1 text-xs text-primary"
                          >
                            <Receipt className="h-3.5 w-3.5" />
                            <span>View</span>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground/60 italic">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(tx)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTransaction(tx._id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>

      {/* Add / Edit Transaction Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Transaction" : "New Transaction"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update your transaction record details."
                : "Fill in the details below to record a new transaction."}
            </DialogDescription>
          </DialogHeader>

          {modalError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {modalError}
            </div>
          )}

          <form onSubmit={handleSubmitTransaction} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="type">Flow Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="expense">Expense (-)</option>
                  <option value="income">Income (+)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="amount">Amount ($ USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title">Title / Merchant</Label>
              <Input
                id="title"
                placeholder="e.g. Groceries, Consulting Retainer"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title} ({c.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="receipt">Receipt File (Optional)</Label>
              <Input
                id="receipt"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="cursor-pointer file:cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Note / Memo</Label>
              <Input
                id="description"
                placeholder="Optional memo or reference notes..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Transaction"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Receipt Preview Dialog */}
      <Dialog
        open={receiptModal.isOpen}
        onOpenChange={(open) => !open && setReceiptModal({ isOpen: false, transaction: null })}
      >
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle>Receipt Attachment</DialogTitle>
            <DialogDescription>
              Verified receipt file uploaded with this transaction.
            </DialogDescription>
          </DialogHeader>

          {receiptModal.transaction && (
            <div className="space-y-4 py-2">
              {receiptModal.transaction.image && (
                <div className="rounded-xl overflow-hidden border border-border max-h-64 flex items-center justify-center bg-muted/30">
                  <img
                    src={`http://localhost:4000/uploads/${receiptModal.transaction.image}`}
                    alt="Receipt"
                    className="max-h-64 object-contain"
                  />
                </div>
              )}
              <div>
                <p className="text-base font-bold text-foreground">
                  {receiptModal.transaction.title}
                </p>
                <p className="text-lg font-bold text-primary mt-1">
                  {receiptModal.transaction.type === "income" ? "+" : "-"}$
                  {Number(receiptModal.transaction.amount).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Logged on {new Date(receiptModal.transaction.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setReceiptModal({ isOpen: false, transaction: null })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
