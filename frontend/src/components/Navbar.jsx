import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Wallet, LogOut, ArrowRightLeft, Tags, LayoutDashboard, User } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? "bg-accent text-accent-foreground font-semibold shadow-xs"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
    }`;

  return (
    <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-xs">
      <div className="h-16 max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2.5 focus:outline-none group">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-105">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Budget<span className="text-primary font-extrabold">Tracker</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/transactions" className={navLinkClass}>
              <ArrowRightLeft className="h-4 w-4" />
              <span>Transactions</span>
            </NavLink>
            <NavLink to="/categories" className={navLinkClass}>
              <Tags className="h-4 w-4" />
              <span>Categories</span>
            </NavLink>
            <NavLink to="/profile" className={navLinkClass}>
              <User className="h-4 w-4" />
              <span>Profile</span>
            </NavLink>
          </nav>

          {/* User & Actions */}
          <div className="flex items-center gap-3">
            <Link to="/profile">
              <Avatar className="h-9 w-9 border border-border cursor-pointer transition-transform hover:scale-105">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:inline-flex gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
