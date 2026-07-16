import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-slate-200 bg-white text-slate-800 relative z-30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center shadow-md shadow-brand-primary/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold font-serif text-xl tracking-tight text-slate-900">
            Neno <span className="bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">AI</span>
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-slate-600 hover:text-slate-900 font-medium transition-colors text-sm">Dashboard</Link>
              <button onClick={logout} className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 font-medium transition-colors text-sm">
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium transition-colors text-sm">Connexion</Link>
              <Link to="/register" className="bg-brand-primary text-white px-4 py-2 rounded-xl hover:bg-brand-primary/90 font-semibold transition-colors text-sm">S'inscrire</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
