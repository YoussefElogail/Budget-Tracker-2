import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import API from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Plus,
  Minus,
  Receipt,
  ArrowRight,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalIncomes: 0,
    totalExpenses: 0,
    balance: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balanceRes, transRes] = await Promise.all([
          API.get("/transactions/balance"),
          API.get("/transactions"),
        ]);
        if (balanceRes.data?.data) {
          setStats(balanceRes.data.data);
        }
        if (transRes.data?.data) {
          setRecentTransactions(transRes.data.data.slice(0, 5));
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const savingsRate =
    stats.totalIncomes > 0
      ? Math.max(0, Math.round(((stats.totalIncomes - stats.totalExpenses) / stats.totalIncomes) * 100))
      : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="w-full pt-20 pb-12 flex-1">
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          {/* Greeting Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Welcome back, {user?.name || "User"} 👋
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Here's what is happening with your personal finances today.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 bg-secondary px-3.5 py-1.5 rounded-full text-secondary-foreground text-xs font-medium self-start sm:self-auto border border-border">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>Current Financial Period</span>
            </div>
          </div>

          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Income */}
            <Card className="border-border/80 shadow-xs hover:shadow-sm transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Total Income
                </CardTitle>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                  <ArrowDownLeft className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  +${stats.totalIncomes.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <span>Logged inflows</span>
                </p>
              </CardContent>
            </Card>

            {/* Total Expenses */}
            <Card className="border-border/80 shadow-xs hover:shadow-sm transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Total Expenses
                </CardTitle>
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                  -${stats.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <span>Total debits and spendings</span>
                </p>
              </CardContent>
            </Card>

            {/* Net Balance */}
            <Card className="border-border/80 shadow-xs hover:shadow-sm transition-shadow bg-accent/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-foreground uppercase tracking-wider">
                  Net Balance
                </CardTitle>
                <Badge variant={stats.balance >= 0 ? "success" : "danger"} className="gap-1">
                  {stats.balance >= 0 ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  <span>{stats.balance >= 0 ? "Healthy" : "Deficit"}</span>
                </Badge>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats.balance >= 0 ? "text-foreground" : "text-destructive"}`}>
                  {stats.balance >= 0 ? "+" : ""}${stats.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Savings Rate: <strong className="text-foreground">{savingsRate}%</strong>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate("/transactions?action=add&flow=income")}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="h-4 w-4" />
                <span>Add Income</span>
              </Button>
              <Button
                onClick={() => navigate("/transactions?action=add&flow=expense")}
                variant="destructive"
                className="gap-2"
              >
                <Minus className="h-4 w-4" />
                <span>Add Expense</span>
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/transactions")}
              className="gap-1.5"
            >
              <span>View All Transactions</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Recent Activity Card */}
          <Card className="shadow-xs border-border/80">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>
                  Your latest financial transactions
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/transactions" className="gap-1 text-xs text-primary">
                  <span>View All</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>

            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <p>No transactions logged yet.</p>
                  <Button
                    variant="link"
                    onClick={() => navigate("/transactions?action=add")}
                    className="mt-2 text-primary"
                  >
                    + Record your first transaction
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentTransactions.map((tx) => (
                    <div
                      key={tx._id}
                      className="py-3.5 flex items-center justify-between hover:bg-muted/30 px-3 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            tx.type === "income"
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                              : "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
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
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.createdAt || Date.now()).toLocaleDateString()} •{" "}
                            {tx.category?.title || "General"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 ml-4">
                        <p
                          className={`text-sm font-bold ${
                            tx.type === "income"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {tx.type === "income" ? "+" : "-"}${Number(tx.amount).toFixed(2)}
                        </p>
                        <Badge
                          variant={tx.type === "income" ? "success" : "danger"}
                          className="text-[10px] uppercase font-semibold mt-0.5"
                        >
                          {tx.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
