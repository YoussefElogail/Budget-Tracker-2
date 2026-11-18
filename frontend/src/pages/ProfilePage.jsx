import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogOut, ShieldCheck, User, Mail, Shield, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="w-full pt-20 pb-12 flex-1">
        <div className="max-w-3xl mx-auto px-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Account Profile
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your personal credentials, identity, and security preferences
            </p>
          </div>

          <Card className="shadow-xs border-border/80">
            <CardHeader className="flex flex-row items-center gap-4 pb-6 border-b border-border">
              <Avatar className="h-16 w-16 border-2 border-border shadow-xs">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold text-foreground">
                  {user?.name || "User"}
                </CardTitle>
                <CardDescription>{user?.email || "user@example.com"}</CardDescription>
                <div className="flex items-center gap-2 pt-1">
                  <Badge variant="secondary" className="capitalize text-xs">
                    {user?.role || "user"}
                  </Badge>
                  <Badge variant="success" className="gap-1 text-xs">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{user?.isActive ? "Active Account" : "Inactive"}</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-muted/20">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <User className="h-3.5 w-3.5 text-primary" />
                    <span>Display Name</span>
                  </p>
                  <p className="text-base font-semibold text-foreground">{user?.name}</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/20">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    <span>Email Address</span>
                  </p>
                  <p className="text-base font-semibold text-foreground truncate">{user?.email}</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/20">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    <span>System Role</span>
                  </p>
                  <p className="text-base font-semibold text-foreground capitalize">
                    {user?.role || "user"}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/20">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    <span>Authentication</span>
                  </p>
                  <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
                    JWT Session Active
                  </p>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Sign Out Session
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    End your active session on this device
                  </p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
