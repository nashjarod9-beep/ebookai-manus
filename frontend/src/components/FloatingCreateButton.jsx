import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function FloatingCreateButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Show only on dashboard and pricing pages on mobile
  const activeRoutes = ['/dashboard', '/pricing'];
  const shouldShow = activeRoutes.includes(location.pathname);

  if (!shouldShow || !user) return null;

  return (
    <button
      onClick={() => navigate('/create')}
      className="fixed bottom-20 right-6 z-45 md:hidden flex items-center justify-center gap-1 bg-brand-accent text-white px-4 py-3 rounded-full shadow-2xl shadow-brand-accent/30 font-bold text-xs hover:bg-brand-accent/95 active:scale-95 transition-all"
    >
      <Plus className="w-4 h-4" />
      <span>Créer</span>
    </button>
  );
}
