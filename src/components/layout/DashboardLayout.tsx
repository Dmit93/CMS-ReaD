import React, { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardLayoutProps {
  children?: ReactNode;
  defaultSidebarCollapsed?: boolean;
  username?: string;
  userAvatar?: string;
  notificationCount?: number;
}

const DashboardLayout = ({
  children,
  defaultSidebarCollapsed = false,
  username = "John Doe",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  notificationCount = 3,
}: DashboardLayoutProps) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar defaultCollapsed={defaultSidebarCollapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          username={username}
          userAvatar={userAvatar}
          notificationCount={notificationCount}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
