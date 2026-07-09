import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEbook } from '../hooks/useEbook';
import api from '../lib/axios';
import { ArrowLeft, Loader2, RefreshCw, Download, Image as ImageIcon, Sparkles, BookOpen } from 'lucide-react';

export default function MarketingVisualsPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { data: book, isLoading: bookLoading } = useEbook(bookId);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null); // 1, 2, or 3
  const [assets, setAssets] = useState({
    mockupUrl1: null,
    mockupUrl2: null,
    mockupUrl3: null
  });

  useEffect(() => {
    loadVisuals();
  }, [bookId]);

  const loadVisuals = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/marketing/assets/${bookId}`);
      if (data) {
        setAssets({
          mockupUrl1: data.mockupUrl1,
          mockupUrl2: data.mockupUrl2,
          mockupUrl3: data.mockupUrl3
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (variantId) => {
    setGenerating(variantId);
    try {
      const { data } = await api.post('/marketing/mockup', { bookId, variantId });
      if (data) {
        setAssets({
          mockupUrl1: data.mockupUrl1,
          mockupUrl2: data.mockupUrl2,
          mockupUrl3: data.mockupUrl3
        });
      }
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la génération du visuel FLUX.");
    } finally {
      setGenerating(null);
    }
  };

  const getFullUrl = (url) => url ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}` : null;

  // Render on canvas to download with superimposed text
  const downloadWithText = (relativeUrl, variantName) => {
    const imageUrl = getFullUrl(relativeUrl);
    const img = new Image();
    img.crossOrigin = "anonymous"; // Bypasses CORS issues
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      
      // Draw primary image
      ctx.drawImage(img, 0, 0, 1080, 1080);
      
      // Dark slate transparent overlay banner at bottom (240px high)
      ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
      ctx.fillRect(0, 840, 1080, 240);
      
      // Yellow/Gold top divider line
      ctx.fillStyle = "#F59E0B";
      ctx.fillRect(0, 836, 1080, 4);

      // Book Title text overlay
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 44px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(book?.title?.toUpperCase() || "EBOOK", 540, 905);
      
      // Subtitle info
      ctx.fillStyle = "#94A3B8";
      ctx.font = "28px sans-serif";
      ctx.fillText("GUIDE PRATIQUE & ILLUSTRÉ EN HAUTE DÉFINITION", 540, 965);
      
      // Call to action text
      ctx.fillStyle = "#F59E0B";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText("TÉLÉCHARGEZ VOTRE EXEMPLAIRE MAINTENANT", 540, 1020);

      // Download trigger
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `mockup_${variantName}_${book?.title?.replace(/\s+/g, '_')}.png`;
      a.click();
    };
    img.src = imageUrl;
  };

  if (bookLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-semibold text-lg">Chargement du module visuels...</p>
      </div>
    );
  }

  const variants = [
    {
      id: 1,
      name: 'posé sur une table',
      title: 'Livre sur table',
      desc: 'Variante photo réaliste d\'un livre physique posé sur une table basse en bois.',
      url: assets.mockupUrl1
    },
    {
      id: 2,
      name: 'tenu dans une main',
      title: 'Livre tenu en main',
      desc: 'Variante mettant en scène le livre tenu fièrement dans une main en gros plan.',
      url: assets.mockupUrl2
    },
    {
      id: 3,
      name: 'avec ordinateur portable',
      title: 'Livre à côté d\'un PC',
      desc: 'Variante moderne montrant l\'ebook disposé à côté d\'un ordinateur sur un bureau.',
      url: assets.mockupUrl3
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      
      {/* Header bar */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-md">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Visuels Marketing</h1>
            <p className="text-muted-foreground text-sm">Générez des mockups 3D réalistes au format carré 1080x1080 pour vos publicités.</p>
          </div>
        </div>
      </div>

      {/* Grid of Mockup Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {variants.map((v) => (
          <div key={v.id} className="border rounded-2xl bg-card overflow-hidden shadow-sm flex flex-col justify-between">
            <div>
              {/* Image Preview Box */}
              <div className="aspect-square bg-muted flex items-center justify-center border-b relative group">
                {v.url ? (
                  <>
                    <img 
                      src={getFullUrl(v.url)} 
                      alt={v.title} 
                      className="w-full h-full object-cover"
                    />
                    {/* Hover Canvas Text Preview Mock */}
                    <div className="absolute inset-x-0 bottom-0 bg-slate-900/90 text-white p-3 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-[10px] font-bold text-amber-500">APERCU TEXTE SUPERPOSÉ</div>
                      <div className="text-xs font-semibold truncate uppercase">{book?.title}</div>
                      <div className="text-[9px] text-slate-400">GUIDE PRATIQUE & ILLUSTRÉ</div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-2 text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mx-auto opacity-40" />
                    <p className="text-xs font-medium">Aucun visuel généré</p>
                  </div>
                )}

                {generating === v.id && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-xs font-semibold text-muted-foreground">Rendu FLUX en cours...</span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-5 space-y-2">
                <h3 className="text-lg font-bold">{v.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-5 border-t bg-muted/10 flex gap-2">
              {v.url ? (
                <>
                  <button 
                    onClick={() => handleGenerate(v.id)}
                    disabled={generating !== null}
                    className="flex-1 py-2 px-3 border rounded-lg text-xs font-bold hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Régénérer</span>
                  </button>
                  <button 
                    onClick={() => downloadWithText(v.url, v.name)}
                    className="flex-1 py-2 px-3 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Télécharger HD</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => handleGenerate(v.id)}
                  disabled={generating !== null}
                  className="w-full py-2.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-bold hover:bg-secondary/85 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Générer le visuel</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
