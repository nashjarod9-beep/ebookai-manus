import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    }
  };

  return (
    <div className="flex justify-center items-center h-[calc(100vh-64px)]">
      <div className="w-full max-w-md p-8 border rounded-xl bg-card shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>
        {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full p-2 border rounded-md bg-background"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mot de passe</label>
            <input 
              type="password" 
              required
              className="w-full p-2 border rounded-md bg-background"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90">
            Se connecter
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Pas encore de compte ? <Link to="/register" className="text-primary hover:underline">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}
