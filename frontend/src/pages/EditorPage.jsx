import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEbook, useUpdateChapter, useUpdateEbook } from '../hooks/useEbook';
import { useAI } from '../hooks/useAI';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Save, Image as ImageIcon, Wand2, Eye, Download } from 'lucide-react';

export default function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: book, isLoading } = useEbook(id);
  const updateChapter = useUpdateChapter();
  const updateEbook = useUpdateEbook();
  const { generateChapterImage } = useAI();
  
  const [activeChapter, setActiveChapter] = useState(null);
  const [content, setContent] = useState('');
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    if (book?.chapters?.length > 0 && !activeChapter) {
      setActiveChapter(book.chapters[0]);
      setContent(book.chapters[0].content);
    }
  }, [book, activeChapter]);

  const handleChapterSelect = (chapter) => {
    // Auto save previous
    if (activeChapter && content !== activeChapter.content) {
      updateChapter.mutate({ id: activeChapter.id, content });
    }
    setActiveChapter(chapter);
    setContent(chapter.content);
  };

  const handleSave = async () => {
    setSaveStatus('Enregistrement...');
    await updateChapter.mutateAsync({ id: activeChapter.id, content });
    setSaveStatus('Enregistré !');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImg(true);
    try {
      const url = await generateChapterImage(activeChapter.title, book.subject);
      if (url) {
        await updateChapter.mutateAsync({ id: activeChapter.id, imageUrl: url });
        setActiveChapter({ ...activeChapter, imageUrl: url });
      }
    } catch (error) {
      alert("Erreur génération image");
    } finally {
      setIsGeneratingImg(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Chargement de l'éditeur...</div>;
  if (!book) return <div className="p-8 text-center">Ebook introuvable</div>;

  const getFullUrl = (url) => url ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}` : null;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Toolbar */}
      <div className="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-muted rounded-md tooltip" title="Retour">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold line-clamp-1">{book.title}</h1>
          <span className="text-xs text-muted-foreground">{saveStatus}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} className="flex items-center gap-2 px-3 py-1.5 border rounded-md hover:bg-muted text-sm">
            <Save className="w-4 h-4" />
            <span>Enregistrer</span>
          </button>
          <button onClick={() => navigate(`/preview/${book.id}`)} className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 text-sm">
            <Eye className="w-4 h-4" />
            <span>Aperçu</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r bg-muted/20 flex flex-col overflow-y-auto">
          <div className="p-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            Chapitres
          </div>
          <div className="flex-1 overflow-y-auto">
            {book.chapters?.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => handleChapterSelect(ch)}
                className={`w-full text-left px-4 py-3 text-sm transition-colors border-l-2 ${
                  activeChapter?.id === ch.id 
                    ? 'border-primary bg-primary/5 font-medium' 
                    : 'border-transparent hover:bg-muted'
                }`}
              >
                <div className="line-clamp-2">{idx + 1}. {ch.title}</div>
                {ch.imageUrl && <ImageIcon className="w-3 h-3 mt-1 text-muted-foreground inline-block" />}
              </button>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        {activeChapter ? (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 border-r flex flex-col relative">
              {/* Image Gen Action */}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button 
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImg}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md text-sm border border-primary/20 backdrop-blur-md"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>{isGeneratingImg ? 'Génération...' : 'Illustrer'}</span>
                </button>
              </div>
              
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full p-8 resize-none bg-background focus:outline-none font-mono text-sm leading-relaxed"
                placeholder="Rédigez votre contenu en Markdown..."
              />
            </div>

            {/* Live Preview */}
            <div className="flex-1 bg-muted/10 overflow-y-auto p-8 prose prose-slate dark:prose-invert max-w-none">
              {activeChapter.imageUrl && (
                <div className="mb-6 relative rounded-xl overflow-hidden border bg-muted">
                  <img src={getFullUrl(activeChapter.imageUrl)} alt="Illustration" className="w-full h-auto object-cover max-h-[300px]" />
                </div>
              )}
              <h1 className="text-3xl font-bold mb-8">{activeChapter.title}</h1>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Sélectionnez un chapitre
          </div>
        )}
      </div>
    </div>
  );
}
