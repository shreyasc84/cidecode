import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Sidebar, 
  SidebarProvider, 
  SidebarContent,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar";
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
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar className="w-64 border-r">
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              <span className="font-bold">JusticeChain</span>
            </div>
          </SidebarHeader>

          <SidebarContent>
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
          </SidebarContent>

          <SidebarFooter className="mt-auto p-3">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}