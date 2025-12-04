import React from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-text-main transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 ml-20 md:ml-24 p-6 md:p-8 overflow-y-auto h-screen scroll-smooth">
        <div className="max-w-[1600px] mx-auto fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};
