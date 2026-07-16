import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function FlipbookViewer({ book, chapters = [], onClose }) {
  const [currentPage, setCurrentPage] = useState(0);

  // Build the list of pages:
  // Page 0: Cover page
  // Page 1: Introduction / Table of Contents
  // Page 2..N: Chapter text / Chapter illustration
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextPage();
      if (e.key === 'ArrowLeft') prevPage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, pages.length]);

  const renderPageContent = (page) => {
    if (!page) return <div className="p-6 bg-surface-1 h-full rounded-r-2xl border-l border-white/10" />;

    switch (page.type) {
      case 'cover':
        return (
          <div className="flex flex-col justify-between h-full p-5 sm:p-8 bg-gradient-to-b from-surface-2 to-surface-1 rounded-l-2xl border-r border-white/5 relative overflow-hidden">
            {page.coverUrl && (
              <div className="absolute inset-0 opacity-15 blur-sm scale-110 pointer-events-none">
                <img src={getFullUrl(page.coverUrl)} alt="background" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="text-left space-y-1 z-10">
              <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-brand-accent bg-brand-accent/15 px-2 py-0.5 rounded-full">
                {page.subject || 'Ebook Premium'}
              </span>
              <h1 className="text-xl sm:text-3xl font-bold font-serif text-white pt-2 leading-tight">
                {page.title}
              </h1>
            </div>
            <div className="my-3 sm:my-6 aspect-[3/4] rounded-lg overflow-hidden border border-white/15 shadow-2xl z-10 flex items-center justify-center bg-slate-900 max-h-[160px] sm:max-h-none">
              {page.coverUrl ? (
                <img src={getFullUrl(page.coverUrl)} alt={page.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-slate-700" />
              )}
            </div>
            <div className="text-left border-t border-white/5 pt-2 sm:pt-4 z-10">
              <p className="text-[10px] text-slate-400">Rédigé par</p>
              <p className="text-xs sm:text-sm font-semibold text-white">{page.author}</p>
            </div>
          </div>
        );

      case 'toc':
        return (
          <div className="flex flex-col justify-between h-full p-5 sm:p-8 bg-surface-1 rounded-r-2xl border-l border-white/10 text-left">
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-white border-b border-white/5 pb-2 sm:pb-3">
                {page.title}
              </h2>
              <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                {page.chapters.map((ch, idx) => (
                  <div 
                    key={idx} 
                    onClick={(e) => {
                      e.stopPropagation(); // Avoid triggering right page turn
                      // Chapter idx begins at page 2 (Cover = 0, TOC = 1, Chap 1 Cover = 2, Chap 1 content = 3)
                      setCurrentPage(idx * 2 + 2);
                    }}
                    className="flex justify-between items-baseline gap-2 group cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-all"
                  >
                    <span className="text-[10px] sm:text-xs text-brand-accent font-bold">0{ch.order || idx + 1}.</span>
                    <span className="text-xs sm:text-sm font-medium text-slate-300 group-hover:text-white transition-colors truncate flex-1">
                      {ch.title}
                    </span>
                    <div className="border-b border-dashed border-white/10 flex-grow mx-1 min-w-[10px]" />
                    <span className="text-[10px] font-mono text-slate-500">Page {idx * 2 + 2}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-500 font-mono">Sommaire · Neno AI</p>
          </div>
        );

      case 'chapter_intro':
        return (
          <div className="flex flex-col justify-between h-full p-5 sm:p-8 bg-surface-2 rounded-l-2xl border-r border-white/5 text-left relative overflow-hidden">
            {page.imageUrl && (
              <div className="absolute inset-0 opacity-10 blur-sm scale-110 pointer-events-none">
                <img src={getFullUrl(page.imageUrl)} alt="background" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="space-y-0.5 z-10">
              <span className="text-[9px] sm:text-[10px] font-mono font-bold text-brand-accent">CHAPITRE 0{page.chapterOrder}</span>
              <h2 className="text-lg sm:text-2xl font-bold font-serif text-white leading-tight">
                {page.title}
              </h2>
            </div>

            <div className="my-3 sm:my-6 aspect-[4/3] rounded-lg overflow-hidden border border-white/10 shadow-lg bg-slate-950 flex items-center justify-center z-10 max-h-[160px] sm:max-h-none">
              {page.imageUrl ? (
                <img src={getFullUrl(page.imageUrl)} alt={page.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-slate-800" />
              )}
            </div>

            <div className="text-[10px] sm:text-xs text-slate-400 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/5 z-10 italic leading-relaxed line-clamp-3 sm:line-clamp-none">
              {page.summary || 'Aucun résumé disponible pour ce chapitre.'}
            </div>
          </div>
        );

      case 'chapter_content':
        return (
          <div className="flex flex-col justify-between h-full p-5 sm:p-8 bg-surface-1 rounded-r-2xl border-l border-white/10 text-left">
            <div className="overflow-y-auto max-h-[38vh] sm:max-h-[50vh] pr-2 space-y-3 text-[10px] sm:text-xs text-slate-300 leading-relaxed font-sans scrollbar-thin">
              <ReactMarkdown>{page.content || '*Contenu en cours de génération...*'}</ReactMarkdown>
            </div>
            <div className="flex justify-between items-center border-t border-white/5 pt-2 sm:pt-4 mt-2 sm:mt-4 text-[9px] sm:text-[10px] text-slate-500 font-mono">
              <span className="truncate max-w-[120px]">{page.title}</span>
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
      <div className="relative w-full max-w-5xl flex flex-col h-[92vh] justify-between">
        
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
        <div className="flex-1 flex items-center justify-center py-4">
          <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 h-[62vh] md:h-auto md:aspect-[8/5] rounded-2xl shadow-2xl bg-surface-0 border border-white/10 select-none">
            
            {/* Click Left Page overlay */}
            {currentPage > 0 && (
              <button 
                onClick={prevPage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900/80 hover:bg-brand-primary text-white border border-white/10 rounded-full z-20 transition-all shadow-xl group hidden md:flex items-center justify-center cursor-pointer"
                title="Page précédente"
              >
                <ChevronLeft className="w-5 h-5 group-hover:scale-110" />
              </button>
            )}

            {/* Click Right Page overlay */}
            {currentPage < pages.length - 2 && (
              <button 
                onClick={nextPage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900/80 hover:bg-brand-primary text-white border border-white/10 rounded-full z-20 transition-all shadow-xl group hidden md:flex items-center justify-center cursor-pointer"
                title="Page suivante"
              >
                <ChevronRight className="w-5 h-5 group-hover:scale-110" />
              </button>
            )}

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
                {/* Left Page (Click turns page back) */}
                <div 
                  onClick={prevPage}
                  className={`w-full h-full hidden md:block ${currentPage > 0 ? 'cursor-pointer hover:brightness-105 active:scale-[0.99] transition-all' : ''}`}
                >
                  {renderPageContent(leftPage)}
                </div>

                {/* Right Page (Click turns page forward) */}
                <div 
                  onClick={nextPage}
                  className={`w-full h-full ${currentPage < pages.length - 2 ? 'cursor-pointer hover:brightness-105 active:scale-[0.99] transition-all' : ''}`}
                >
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
            className="flex items-center gap-2 text-xs font-bold font-mono px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Précédent
          </button>
          <span className="text-xs font-mono text-slate-500">
            Pages {currentPage + 1} - {currentPage + 2} sur {pages.length}
          </span>
          <button 
            onClick={nextPage} 
            disabled={currentPage >= pages.length - 2}
            className="flex items-center gap-2 text-xs font-bold font-mono px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            Suivant <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
