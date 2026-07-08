import { Link } from 'react-router-dom';
import { useEbooks } from '../hooks/useEbook';
import EbookCard from '../components/EbookCard';
import { Plus } from 'lucide-react';

export default function Dashboard() {
  const { data: ebooks, isLoading } = useEbooks();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mes Ebooks</h1>
        <Link 
          to="/create" 
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel Ebook</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 rounded-xl bg-muted animate-pulse"></div>
          ))}
        </div>
      ) : ebooks?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ebooks.map(ebook => (
            <EbookCard key={ebook.id} ebook={ebook} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border rounded-xl border-dashed">
          <p className="text-muted-foreground mb-4">Vous n'avez pas encore d'ebook.</p>
          <Link to="/create" className="text-primary hover:underline">Créer mon premier ebook</Link>
        </div>
      )}
    </div>
  );
}
