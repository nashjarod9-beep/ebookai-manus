import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <span className="font-bold text-xl">EbookAI</span>
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
              <button onClick={logout} className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-muted-foreground hover:text-foreground">Connexion</Link>
              <Link to="/register" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">S'inscrire</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
