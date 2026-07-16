import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, BookOpen, User } from 'lucide-react';

export default function BottomTabBar() {
  const location = useLocation();
  const path = location.pathname;

  const tabs = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Créer', path: '/create', icon: PlusCircle },
    { label: 'Bibliothèque', path: '/dashboard', icon: BookOpen }, // Points to dashboard which hosts the ebook list
    { label: 'Compte', path: '/pricing', icon: User } // Pricing hosts the plan selection & subscription management
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-surface-1/90 border-t border-white/5 backdrop-blur-md z-40 md:hidden flex items-center justify-around px-4">
      {tabs.map((tab, idx) => {
        const Icon = tab.icon;
        const isActive = path === tab.path || (tab.path === '/create' && path.startsWith('/create'));
        return (
          <Link 
            key={idx} 
            to={tab.path} 
            className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${isActive ? 'text-brand-accent' : 'text-slate-400 hover:text-white'}`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[9px] font-mono mt-1 font-semibold">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
