import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEbook } from '../hooks/useEbook';
import api from '../lib/axios';
import HTMLFlipBook from 'react-pageflip';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';

export default function PreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: book, isLoading } = useEbook(id);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingZip, setExportingZip] = useState(false);

  const getFullUrl = (url) => url ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}` : null;

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const { data } = await api.post(`/export/pdf/${id}`);
      window.open(getFullUrl(data.pdfPath), '_blank');
    } catch (error) {
      alert('Erreur export PDF');
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportZip = async () => {
    setExportingZip(true);
    try {
      const { data } = await api.post(`/export/zip/${id}`);
      window.open(getFullUrl(data.zipPath), '_blank');
    } catch (error) {
      alert('Erreur export ZIP');
    } finally {
      setExportingZip(false);
    }
  };

  if (isLoading || !book) return <div className="p-12 text-center">Chargement...</div>;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-muted/30">
      <div className="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-md">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold">Aperçu : {book.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted text-sm font-medium"
          >
            {exportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Export PDF</span>
          </button>
          <button 
            onClick={handleExportZip}
            disabled={exportingZip}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium"
          >
            {exportingZip ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Export HTML5 (ZIP)</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 flex justify-center items-center">
        {/* Simple vertical preview for now. react-pageflip can be tricky with dynamic content sizes without fixed dimensions */}
        <div className="max-w-3xl w-full bg-card shadow-2xl rounded-sm">
          <div className="min-h-[800px] flex flex-col items-center justify-center p-12 text-center bg-slate-900 text-white rounded-t-sm">
            {book.coverUrl && <img src={getFullUrl(book.coverUrl)} alt="Cover" className="max-w-md w-full rounded-md shadow-lg mb-8" />}
            <h1 className="text-5xl font-serif mb-4">{book.title}</h1>
            <p className="text-xl opacity-80">{book.subject}</p>
          </div>
          
          <div className="p-12 prose prose-slate dark:prose-invert max-w-none">
            <h2>Sommaire</h2>
            <ul>
              {book.chapters.map((ch, i) => (
                <li key={ch.id} className="text-lg">{i + 1}. {ch.title}</li>
              ))}
            </ul>
          </div>

          {book.chapters.map((ch, i) => (
            <div key={ch.id} className="p-12 border-t prose prose-slate dark:prose-invert max-w-none">
              <h1 className="text-4xl font-serif mb-8">{ch.title}</h1>
              {ch.imageUrl && <img src={getFullUrl(ch.imageUrl)} alt="Illustration" className="w-full rounded-xl mb-8 shadow-md" />}
              <ReactMarkdown>{ch.content}</ReactMarkdown>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
