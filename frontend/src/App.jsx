import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateEbook from './pages/CreateEbook';
import EditorPage from './pages/EditorPage';
import PreviewPage from './pages/PreviewPage';
import PricingPage from './pages/PricingPage';
import { useAuth } from './hooks/useAuth';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/create" element={<PrivateRoute><CreateEbook /></PrivateRoute>} />
            <Route path="/create/:draftId" element={<PrivateRoute><CreateEbook /></PrivateRoute>} />
            <Route path="/editor/:id" element={<PrivateRoute><EditorPage /></PrivateRoute>} />
            <Route path="/preview/:id" element={<PrivateRoute><PreviewPage /></PrivateRoute>} />
            <Route path="/pricing" element={<PrivateRoute><PricingPage /></PrivateRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
