import { Link } from 'react-router-dom';
import { Edit, Eye, Download, BookText } from 'lucide-react';

export default function EbookCard({ ebook }) {
  const coverUrl = ebook.coverUrl ? (import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000') + ebook.coverUrl : null;

  return (
    <div className="border rounded-xl bg-card overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
      <div className="h-48 bg-muted relative">
        {coverUrl ? (
          <img src={coverUrl} alt={ebook.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <BookText className="w-12 h-12 opacity-20" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {ebook.status === 'ready' ? 'Terminé' : ebook.status === 'draft' ? 'Brouillon' : 'En cours'}
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-lg line-clamp-1 mb-1">{ebook.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{new Date(ebook.createdAt).toLocaleDateString()}</p>
        
        <div className="mt-auto grid grid-cols-3 gap-2">
          <Link to={`/editor/${ebook.id}`} className="flex items-center justify-center p-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 tooltip" title="Éditer">
            <Edit className="w-4 h-4" />
          </Link>
          <Link to={`/preview/${ebook.id}`} className="flex items-center justify-center p-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 tooltip" title="Aperçu">
            <Eye className="w-4 h-4" />
          </Link>
          <button className="flex items-center justify-center p-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 tooltip" title="Exporter">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
