import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { label: 'Accueil', href: '/' },
    { label: 'Tarifs', href: '/pricing' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="border-b border-slate-100 bg-white text-slate-800 relative z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2.5 shrink-0">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-500 flex items-center justify-center shadow-md shadow-violet-500/30">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold font-serif text-xl tracking-tight text-slate-900">
            Neno <span className="bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">AI</span>
          </span>
        </Link>

        {/* Desktop Nav Links (middle) */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'text-violet-700 bg-violet-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {link.label}
              {isActive(link.href) && link.href !== '/' && (
                <span className="block h-0.5 bg-violet-600 rounded-full mt-0.5 mx-auto" style={{width:'60%'}} />
              )}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-violet-200 text-violet-700 font-semibold text-sm hover:bg-violet-50 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Tableau de bord
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-medium transition-colors text-sm px-3 py-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors text-sm px-3 py-2"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-5 py-2 rounded-xl hover:opacity-90 font-semibold transition-opacity text-sm shadow-md shadow-violet-500/20"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-1 shadow-lg">
          {navLinks.map(link => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'text-violet-700 bg-violet-50'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block w-full text-center px-4 py-2.5 rounded-xl border border-violet-200 text-violet-700 font-semibold text-sm">
                  Tableau de bord
                </Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="block w-full text-center px-4 py-2.5 text-slate-500 text-sm">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block w-full text-center px-4 py-2.5 text-slate-600 text-sm">Connexion</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold text-sm">S'inscrire</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
