import { useState, useEffect } from "react";
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
  Tags,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "expense",
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await API.get("/categories");
      setCategories(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ title: "", type: "expense" });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingId(cat._id);
    setFormData({ title: cat.title, type: cat.type });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    setSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        type: formData.type,
        user: user._id,
      };

      if (editingId) {
        await API.put(`/categories/${editingId}`, payload);
      } else {
        await API.post("/categories", payload);
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      setModalError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        "Failed to save category."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await API.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert("Failed to delete category.");
    }
  };

  const filteredCategories = categories.filter((cat) => {
    const matchesType = typeFilter === "all" || cat.type === typeFilter;
    const matchesSearch = !searchQuery || cat.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesType && matchesSearch;
  });

  const expenseCount = categories.filter((c) => c.type === "expense").length;
  const incomeCount = categories.filter((c) => c.type === "income").length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="w-full pt-20 pb-12 flex-1">
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                  Total Categories
                </CardTitle>
                <div className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center text-foreground">
                  <Tags className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{categories.length}</div>
                <p className="text-xs text-muted-foreground mt-0.5">Active categories</p>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                  Expense Categories
                </CardTitle>
                <div className="h-7 w-7 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-rose-600">{expenseCount}</div>
                <p className="text-xs text-muted-foreground mt-0.5">Debits and outflows</p>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                  Income Categories
                </CardTitle>
                <div className="h-7 w-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ArrowDownLeft className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-emerald-600">{incomeCount}</div>
                <p className="text-xs text-muted-foreground mt-0.5">Credits and inflows</p>
              </CardContent>
            </Card>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>Categories</span>
                <Badge variant="secondary" className="font-normal text-xs">
                  {filteredCategories.length} categories
                </Badge>
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Organize your income and expenses into structured categories
              </p>
            </div>

            <Button onClick={handleOpenAdd} className="gap-2 shadow-xs">
              <Plus className="h-4 w-4" />
              <span>Add Category</span>
            </Button>
          </div>

          {/* Filter Bar */}
          <Card className="p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  className="pl-9 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

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
            </div>
          </Card>

          {/* Table Card */}
          <Card className="shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-[40%]">Category Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                      <span>Loading categories...</span>
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      No categories found. Click "Add Category" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((cat) => (
                    <TableRow key={cat._id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-semibold text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                              cat.type === "income"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-rose-50 text-rose-600"
                            }`}
                          >
                            <Tags className="h-3.5 w-3.5" />
                          </div>
                          <span>{cat.title}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={cat.type === "income" ? "success" : "danger"}
                          className="capitalize text-xs font-medium"
                        >
                          {cat.type}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(cat.createdAt || Date.now()).toLocaleDateString()}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(cat)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(cat._id)}
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

      {/* Add / Edit Category Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Category" : "New Category"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update your category details."
                : "Add a new category to classify your income and expenses."}
            </DialogDescription>
          </DialogHeader>

          {modalError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {modalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Category Title</Label>
              <Input
                id="title"
                placeholder="e.g. Groceries, Freelance, Health"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Category Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={formData.type === "expense" ? "destructive" : "outline"}
                  onClick={() => setFormData({ ...formData, type: "expense" })}
                  className="gap-2"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Expense</span>
                </Button>
                <Button
                  type="button"
                  variant={formData.type === "income" ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, type: "income" })}
                  className="gap-2"
                >
                  <ArrowDownLeft className="h-4 w-4" />
                  <span>Income</span>
                </Button>
              </div>
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
                  "Save Category"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
