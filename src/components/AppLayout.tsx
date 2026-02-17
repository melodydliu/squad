import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Flower2, LayoutDashboard, Bell, User, LogOut, ChevronLeft, Settings, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  role?: "admin" | "freelancer";
  headerAction?: ReactNode;
}

const ADMIN_CONTACT = {
  name: "Jane Bloom",
  phone: "(555) 000-1234",
  email: "jane@bloomstudio.com",
};

const AppLayout = ({ children, title, showBack, role: roleProp, headerAction }: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role: authRole, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const role = roleProp || authRole || "freelancer";

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const adminTabs = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/notifications", icon: Bell, label: "Alerts", badge: unreadCount },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  const freelancerTabs = [
    { path: "/freelancer", icon: LayoutDashboard, label: "Projects" },
    { path: "/notifications", icon: Bell, label: "Alerts", badge: unreadCount },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  const tabs = role === "admin" ? adminTabs : freelancerTabs;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack ? (
              <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <Flower2 className="w-6 h-6 text-primary" />
            )}
            <h1 className="font-display text-xl font-bold text-foreground">
              {title || "Bloom Studio"}
            </h1>
          </div>
          <div className="flex items-center gap-1">
            {headerAction}
            {role === "freelancer" && (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Phone className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 p-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Admin Contact</p>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-foreground">{ADMIN_CONTACT.name}</p>
                    <a href={`tel:${ADMIN_CONTACT.phone}`} className="block text-muted-foreground hover:text-foreground transition-colors">{ADMIN_CONTACT.phone}</a>
                    <a href={`mailto:${ADMIN_CONTACT.email}`} className="block text-muted-foreground hover:text-foreground transition-colors">{ADMIN_CONTACT.email}</a>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            <button
              onClick={() => navigate(`/${role}/settings`)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-5 py-4 pb-28 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border max-w-lg mx-auto">
        <div className="flex items-center justify-around py-2.5 pb-3">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors relative",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <div className="relative">
                  <tab.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-semibold">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-foreground rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
