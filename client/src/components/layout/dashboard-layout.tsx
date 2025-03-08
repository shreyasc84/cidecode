import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/ui/sidebar";
import { Shield, Upload, List, BarChart2, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const [location] = useLocation();

  const navigationItems = [
    { href: "/", label: "Dashboard", icon: BarChart2 },
    { href: "/upload", label: "Upload Evidence", icon: Upload },
    { href: "/tracker", label: "Evidence Tracker", icon: List },
  ];

  return (
    <div className="flex h-screen">
      <Sidebar className="w-64 border-r">
        <div className="flex items-center gap-2 p-6">
          <Shield className="h-6 w-6" />
          <span className="font-bold">JusticeChain</span>
        </div>

        <div className="space-y-1 px-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto p-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </Sidebar>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
