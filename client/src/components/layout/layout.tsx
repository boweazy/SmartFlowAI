import { useState } from "react";
import Sidebar from "./sidebar";
import Header from "./header";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-dark-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        
        <main className="flex-1 overflow-y-auto bg-dark-900" data-testid="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
