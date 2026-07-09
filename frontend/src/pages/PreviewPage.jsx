import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEbook } from '../hooks/useEbook';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/axios';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Download, Loader2, Lock, AlertTriangle } from 'lucide-react';

export default function PreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: book, isLoading } = useEbook(id);
  const { user } = useAuth();
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingZip, setExportingZip] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`;
  };

  const handleExportPdf = async () => {
    if (user?.plan === 'free' && user?.email !== 'nashjarod9@gmail.com') {
      setShowUpgradeModal(true);
      return;
    }
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
    if (user?.plan === 'free' && user?.email !== 'nashjarod9@gmail.com') {
      setShowUpgradeModal(true);
      return;
    }
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

  if (isLoading || !book) return <div className="p-12 text-center font-medium">Chargement de l'aperçu...</div>;

  const isFreePlan = user?.plan === 'free' && user?.email !== 'nashjarod9@gmail.com';

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-muted/30">
      {/* Header bar */}
      <div className="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-md">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold line-clamp-1">Aperçu : {book.title}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* PDF Download Button */}
          <button 
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className={`flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium ${isFreePlan ? 'hover:bg-red-50 text-red-500 border-red-200' : 'hover:bg-muted'}`}
          >
            {exportingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isFreePlan ? (
              <Lock className="w-4 h-4 text-red-500" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Export PDF HD</span>
          </button>

          {/* ZIP Download Button */}
          <button 
            onClick={handleExportZip}
            disabled={exportingZip}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
              isFreePlan 
                ? 'bg-muted text-muted-foreground border cursor-not-allowed opacity-60' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {exportingZip ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isFreePlan ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Export HTML5 (ZIP)</span>
          </button>
        </div>
      </div>

      {/* Free Plan Notice */}
      {isFreePlan && (
        <div className="bg-red-50 text-red-700 px-6 py-3 text-sm font-medium border-b border-red-100 flex items-center gap-2 shrink-0">
          <AlertTriangle className="w-4 h-4" />
          <span>
            Offre Gratuite active : Le PDF ci-dessous comporte un filigrane. Les téléchargements propres sont réservés aux abonnés payants.
          </span>
          <button onClick={() => navigate('/pricing')} className="underline text-red-900 hover:text-red-950 font-bold ml-auto">
            Débloquer l'ebook complet
          </button>
        </div>
      )}

      {/* Preview book area */}
      <div className="flex-1 overflow-auto p-8 flex justify-center items-center relative">
        <div className="max-w-3xl w-full bg-card shadow-2xl rounded-sm relative overflow-hidden">
          
          {/* Watermark overlay on screen for Free plan */}
          {isFreePlan && (
            <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
              <div 
                className="text-red-600/5 text-5xl font-extrabold rotate-[-45deg] whitespace-nowrap uppercase select-none tracking-widest"
                style={{
                  position: 'absolute',
                  top: '20%',
                  left: '10%',
                  transform: 'rotate(-45deg)'
                }}
              >
                Aperçu EbookAI
              </div>
              <div 
                className="text-red-600/5 text-5xl font-extrabold rotate-[-45deg] whitespace-nowrap uppercase select-none tracking-widest"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '20%',
                  transform: 'rotate(-45deg)'
                }}
              >
                Aperçu EbookAI
              </div>
              <div 
                className="text-red-600/5 text-5xl font-extrabold rotate-[-45deg] whitespace-nowrap uppercase select-none tracking-widest"
                style={{
                  position: 'absolute',
                  top: '80%',
                  left: '10%',
                  transform: 'rotate(-45deg)'
                }}
              >
                Aperçu EbookAI
              </div>
            </div>
          )}

          {/* Book content layout */}
          <div className="min-h-[850px] flex flex-col items-center justify-center p-16 text-center bg-slate-900 text-white rounded-t-sm space-y-6">
            {book.coverUrl && (
              <div className="relative max-w-md w-full rounded-md shadow-2xl overflow-hidden border border-white/10">
                <img src={getFullUrl(book.coverUrl)} alt="Cover" className="w-full h-auto object-cover max-h-[500px]" />
                {isFreePlan && (
                  <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none select-none">
                    <span className="text-white/40 text-2xl font-extrabold rotate-[-25deg] uppercase tracking-widest border-2 border-white/40 px-4 py-2 bg-slate-950/40">
                      Aperçu EbookAI
                    </span>
                  </div>
                )}
              </div>
            )}
            <h1 className="text-5xl font-serif font-bold tracking-tight mb-2 pt-4 leading-tight">{book.title}</h1>
            <div className="w-24 h-1 bg-primary mx-auto my-4"></div>
            <p className="text-xl opacity-80 max-w-lg leading-relaxed">{book.subject}</p>
            {book.author && <p className="text-xs font-semibold tracking-widest uppercase text-primary pt-8">Par {book.author}</p>}
          </div>
          
          {/* TOC */}
          <div className="p-16 border-t bg-neutral-50/50 prose prose-slate max-w-none space-y-6">
            <h2 className="text-3xl font-serif border-b pb-4 mb-8">Table des Matières</h2>
            <ul className="space-y-3 pl-0 list-none">
              {book.chapters.map((ch, i) => (
                <li key={ch.id} className="flex justify-between items-center text-lg border-b border-dashed pb-2">
                  <span className="font-semibold text-slate-800">Chapitre {i + 1} : {ch.title}</span>
                  <span className="text-slate-400 font-bold">Page {i * 4 + 3}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Chapters rendering */}
          {book.chapters.map((ch, i) => (
            <div key={ch.id} className="p-16 border-t prose prose-slate max-w-none space-y-8">
              <div className="border-b pb-4 mb-8">
                <span className="text-xs uppercase tracking-wider text-primary font-bold">Chapitre {i + 1}</span>
                <h1 className="text-4xl font-serif font-bold mt-1 text-slate-800 leading-tight">{ch.title}</h1>
              </div>
              
              {ch.imageUrl && (
                <div className="relative rounded-xl overflow-hidden mb-10 shadow-lg border bg-muted max-w-2xl mx-auto">
                  <img src={getFullUrl(ch.imageUrl)} alt="Illustration" className="w-full h-auto object-cover max-h-[400px]" />
                  {isFreePlan && (
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] flex items-center justify-center pointer-events-none select-none">
                      <span className="text-white/40 text-xl font-extrabold rotate-[-25deg] uppercase tracking-widest border-2 border-white/40 px-4 py-2 bg-slate-900/40">
                        Aperçu EbookAI
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-slate-700 text-lg leading-relaxed space-y-6 whitespace-pre-line text-justify font-sans">
                <ReactMarkdown>{ch.content}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Quota / Download Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl p-6 max-w-md w-full shadow-lg space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <Lock className="w-10 h-10 shrink-0" />
              <div>
                <h3 className="text-lg font-bold">Fonctionnalité Verrouillée</h3>
                <p className="text-xs text-muted-foreground">Téléchargements réservés aux offres premium.</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Le téléchargement des PDF propres (sans filigrane) et des archives HTML5 (ZIP) est réservé aux abonnés Starter ou supérieur.
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 border rounded-md text-sm hover:bg-muted font-medium"
              >
                Rester sur l'offre gratuite
              </button>
              <button 
                onClick={() => {
                  setShowUpgradeModal(false);
                  navigate('/pricing');
                }}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm hover:bg-primary/90 font-semibold"
              >
                Débloquer l'Ebook
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
