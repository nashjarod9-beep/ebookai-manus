import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function FlipbookViewer({ book, chapters = [], onClose }) {
  const [currentPage, setCurrentPage] = useState(0);

  // Build the list of pages:
  // Page 0: Cover page
  // Page 1: Introduction / Table of Contents
  // Page 2..N: Chapter text / Chapter illustration
  // Let's create pages. Each chapter will have:
  // - Left page: Illustration / title
  // - Right page: Content markdown text
  const pages = [];

  // Page 0: Cover
  pages.push({
    type: 'cover',
    title: book.title,
    coverUrl: book.coverUrl,
    author: book.author || 'Auteur Anonyme',
    subject: book.subject
  });

  // Page 1: Table of Contents
  pages.push({
    type: 'toc',
    title: 'Sommaire',
    chapters: chapters.map(ch => ({ title: ch.title, order: ch.order }))
  });

  // Chapters
  chapters.forEach((ch, idx) => {
    // Page: Chapter Cover / Image
    pages.push({
      type: 'chapter_intro',
      chapterOrder: ch.order || idx + 1,
      title: ch.title,
      imageUrl: ch.imageUrl,
      summary: ch.summary
    });

    // Page: Chapter Text content
    pages.push({
      type: 'chapter_content',
      chapterOrder: ch.order || idx + 1,
      title: ch.title,
      content: ch.content
    });
  });

  // Page N: Back cover
  pages.push({
    type: 'back_cover',
    title: book.title,
    author: book.author
  });

  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`;
  };

  const nextPage = () => {
    if (currentPage < pages.length - 2) {
      setCurrentPage(prev => prev + 2);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 2);
    }
  };

  const renderPageContent = (page) => {
    if (!page) return <div className="p-6 bg-surface-1 h-full rounded-r-2xl border-l border-white/10" />;

    switch (page.type) {
      case 'cover':
        return (
          <div className="flex flex-col justify-between h-full p-8 bg-gradient-to-b from-surface-2 to-surface-1 rounded-l-2xl border-r border-white/5 relative overflow-hidden">
            {page.coverUrl && (
              <div className="absolute inset-0 opacity-15 blur-sm scale-110 pointer-events-none">
                <img src={getFullUrl(page.coverUrl)} alt="background" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="text-left space-y-2 z-10">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-accent bg-brand-accent/15 px-2.5 py-0.5 rounded-full">
                {page.subject || 'Ebook Premium'}
              </span>
              <h1 className="text-3xl font-bold font-serif text-white pt-2 leading-tight">
                {page.title}
              </h1>
            </div>
            <div className="my-6 aspect-[3/4] rounded-lg overflow-hidden border border-white/15 shadow-2xl z-10 flex items-center justify-center bg-slate-900">
              {page.coverUrl ? (
                <img src={getFullUrl(page.coverUrl)} alt={page.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-12 h-12 text-slate-700" />
              )}
            </div>
            <div className="text-left border-t border-white/5 pt-4 z-10">
              <p className="text-xs text-slate-400">Rédigé par</p>
              <p className="text-sm font-semibold text-white">{page.author}</p>
            </div>
          </div>
        );

      case 'toc':
        return (
          <div className="flex flex-col justify-between h-full p-8 bg-surface-1 rounded-r-2xl border-l border-white/10 text-left">
            <div>
              <h2 className="text-xl font-bold font-serif text-white border-b border-white/5 pb-3">
                {page.title}
              </h2>
              <div className="mt-6 space-y-4">
                {page.chapters.map((ch, idx) => (
                  <div key={idx} className="flex justify-between items-baseline gap-2 group">
                    <span className="text-xs text-brand-accent font-bold">0{ch.order || idx + 1}.</span>
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors truncate flex-1">
                      {ch.title}
                    </span>
                    <div className="border-b border-dashed border-white/10 flex-grow mx-1 min-w-[20px]" />
                    <span className="text-xs font-mono text-slate-500">Page {idx * 2 + 2}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">Sommaire · Neno AI</p>
          </div>
        );

      case 'chapter_intro':
        return (
          <div className="flex flex-col justify-between h-full p-8 bg-surface-2 rounded-l-2xl border-r border-white/5 text-left relative overflow-hidden">
            {page.imageUrl && (
              <div className="absolute inset-0 opacity-10 blur-sm scale-110 pointer-events-none">
                <img src={getFullUrl(page.imageUrl)} alt="background" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="space-y-1 z-10">
              <span className="text-[10px] font-mono font-bold text-brand-accent">CHAPITRE 0{page.chapterOrder}</span>
              <h2 className="text-2xl font-bold font-serif text-white leading-tight">
                {page.title}
              </h2>
            </div>

            <div className="my-6 aspect-[4/3] rounded-lg overflow-hidden border border-white/10 shadow-lg bg-slate-950 flex items-center justify-center z-10">
              {page.imageUrl ? (
                <img src={getFullUrl(page.imageUrl)} alt={page.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-10 h-10 text-slate-800" />
              )}
            </div>

            <div className="text-xs text-slate-400 bg-white/5 p-4 rounded-xl border border-white/5 z-10 italic leading-relaxed">
              {page.summary || 'Aucun résumé disponible pour ce chapitre.'}
            </div>
          </div>
        );

      case 'chapter_content':
        return (
          <div className="flex flex-col justify-between h-full p-8 bg-surface-1 rounded-r-2xl border-l border-white/10 text-left">
            <div className="overflow-y-auto max-h-[500px] pr-2 space-y-4 text-xs text-slate-300 leading-relaxed font-sans scrollbar-thin">
              <ReactMarkdown>{page.content || '*Contenu en cours de génération...*'}</ReactMarkdown>
            </div>
            <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-4 text-[10px] text-slate-500 font-mono">
              <span>{page.title}</span>
              <span>Page {page.chapterOrder * 2 + 1}</span>
            </div>
          </div>
        );

      case 'back_cover':
        return (
          <div className="flex flex-col justify-center items-center h-full p-8 bg-gradient-to-b from-surface-1 to-surface-2 rounded-r-2xl border-l border-white/10 text-center relative overflow-hidden">
            <div className="absolute top-6 left-6 flex items-center gap-1.5 opacity-55">
              <BookOpen className="w-4 h-4 text-brand-accent" />
              <span className="font-mono text-xs text-white font-bold">Neno AI</span>
            </div>
            <div className="space-y-4 max-w-xs">
              <h2 className="text-xl font-bold font-serif text-white">{page.title}</h2>
              <p className="text-xs text-slate-400">Ce livre a été entièrement rédigé et mis en page par l'intelligence artificielle premium de Neno AI.</p>
              <div className="w-12 h-[1px] bg-brand-accent/50 mx-auto" />
              <p className="text-xs font-mono text-slate-500">Auteur : {page.author}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const leftPage = pages[currentPage];
  const rightPage = pages[currentPage + 1];

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
      {/* Container */}
      <div className="relative w-full max-w-5xl flex flex-col h-[90vh] md:h-[80vh] justify-between">
        
        {/* Header toolbar */}
        <div className="flex justify-between items-center text-white border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-accent" />
            <h2 className="font-bold text-sm tracking-wide uppercase font-mono">Aperçu interactif 3D</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D Book Layout */}
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 aspect-[4/3] md:aspect-[8/5] rounded-2xl shadow-2xl bg-surface-0 overflow-hidden border border-white/10 select-none">
            
            {/* Split Page Render */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentPage} 
                initial={{ opacity: 0, rotateY: 30 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -30 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex flex-col md:grid md:grid-cols-2 col-span-2 relative"
                style={{ perspective: 1000 }}
              >
                {/* Left Page (Visible on desktop or mobile depending on index) */}
                <div className="w-full h-full hidden md:block">
                  {renderPageContent(leftPage)}
                </div>

                {/* Right Page */}
                <div className="w-full h-full">
                  {renderPageContent(rightPage)}
                </div>

                {/* Center binding shadow */}
                <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-slate-950/60 shadow-lg pointer-events-none hidden md:block" />
              </motion.div>
            </AnimatePresence>

          </div>
        </div>

        {/* Navigation Toolbar */}
        <div className="flex justify-between items-center text-white border-t border-white/10 pt-4 px-4">
          <button 
            onClick={prevPage} 
            disabled={currentPage === 0}
            className="flex items-center gap-2 text-xs font-bold font-mono px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Précédent
          </button>
          <span className="text-xs font-mono text-slate-500">
            Pages {currentPage + 1} - {currentPage + 2} sur {pages.length}
          </span>
          <button 
            onClick={nextPage} 
            disabled={currentPage >= pages.length - 2}
            className="flex items-center gap-2 text-xs font-bold font-mono px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            Suivant <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
