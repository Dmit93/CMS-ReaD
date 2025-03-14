import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  FileText,
  Image,
  Users,
  Store,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive?: boolean;
  isCollapsed?: boolean;
}

const NavItem = ({
  icon,
  label,
  path,
  isActive = false,
  isCollapsed = false,
}: NavItemProps) => {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to={path} className="w-full block">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 py-3",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50",
                isCollapsed ? "px-3" : "px-4",
              )}
            >
              {icon}
              {!isCollapsed && <span>{label}</span>}
            </Button>
          </Link>
        </TooltipTrigger>
        {isCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
};

interface SidebarProps {
  defaultCollapsed?: boolean;
}

const Sidebar = ({ defaultCollapsed = false }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/" },
    {
      icon: <FileText size={20} />,
      label: "Content Management",
      path: "/content",
    },
    { icon: <Image size={20} />, label: "Media Library", path: "/media" },
    { icon: <Users size={20} />, label: "User Management", path: "/users" },
    {
      icon: <Store size={20} />,
      label: "Plugin Marketplace",
      path: "/marketplace",
    },
    {
      icon: <Settings size={20} />,
      label: "Admin Settings",
      path: "/settings",
    },
    {
      icon: <Store size={20} />,
      label: "Plugin System",
      path: "/settings/plugin-system",
    },
  ];

  return (
    <aside
      className={cn(
        "h-full bg-background border-r border-border flex flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[70px]" : "w-[250px]",
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-border">
        {!isCollapsed && <div className="font-bold text-xl">CMS Platform</div>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn("ml-auto", isCollapsed ? "mx-auto" : "")}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item, index) => (
            <li key={index}>
              <NavItem
                icon={item.icon}
                label={item.label}
                path={item.path}
                isActive={
                  currentPath === item.path ||
                  (item.path !== "/" && currentPath.startsWith(item.path))
                }
                isCollapsed={isCollapsed}
              />
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-border">
        {!isCollapsed && (
          <div className="text-xs text-muted-foreground">
            CMS Platform v1.0.0
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
