import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEbook } from '../hooks/useEbook';
import api from '../lib/axios';
import { 
  ArrowLeft, Save, Copy, FileText, Download, Loader2, 
  Check, Plus, Trash2, Globe, HelpCircle, Gift, Sparkles 
} from 'lucide-react';

export default function ProductSheetPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { data: book, isLoading: bookLoading } = useEbook(bookId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Structured state matching the backend JSON schema
  const [sheetData, setSheetData] = useState({
    commercialName: '',
    promise: '',
    longDescription: {
      introduction: '',
      problem: '',
      solution: '',
      whatTheyWillLearn: '',
      whyDifferent: '',
      conclusion: ''
    },
    benefits: [],
    bonus: [],
    faq: [],
    cta: '',
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: []
    }
  });

  useEffect(() => {
    loadProductSheet();
  }, [bookId]);

  const loadProductSheet = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/marketing/assets/${bookId}`);
      if (data && data.productSheet) {
        setSheetData(JSON.parse(data.productSheet));
      } else {
        // If not generated, trigger initial generation
        await handleGenerate();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post('/marketing/product-sheet', { bookId });
      if (data && data.productSheet) {
        setSheetData(JSON.parse(data.productSheet));
      }
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la génération de la fiche produit.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/marketing/product-sheet/update', {
        bookId,
        productSheet: JSON.stringify(sheetData)
      });
      alert("Fiche produit enregistrée avec succès !");
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  // Helper: List item operations (benefits, bonus, keywords)
  const updateListItem = (field, idx, val) => {
    const newList = [...sheetData[field]];
    newList[idx] = val;
    setSheetData({ ...sheetData, [field]: newList });
  };

  const addListItem = (field, defaultVal = '') => {
    const newList = [...sheetData[field]];
    newList.push(defaultVal);
    setSheetData({ ...sheetData, [field]: newList });
  };

  const removeListItem = (field, idx) => {
    const newList = sheetData[field].filter((_, i) => i !== idx);
    setSheetData({ ...sheetData, [field]: newList });
  };

  // Helper: FAQ operations
  const updateFaq = (idx, key, val) => {
    const newFaq = [...sheetData.faq];
    newFaq[idx][key] = val;
    setSheetData({ ...sheetData, faq: newFaq });
  };

  const addFaq = () => {
    const newFaq = [...sheetData.faq];
    newFaq.push({ question: 'Nouvelle Question', answer: 'Réponse...' });
    setSheetData({ ...sheetData, faq: newFaq });
  };

  const removeFaq = (idx) => {
    const newFaq = sheetData.faq.filter((_, i) => i !== idx);
    setSheetData({ ...sheetData, faq: newFaq });
  };

  // Copy to Clipboard
  const handleCopyText = () => {
    const text = `
🔥 NOM COMMERCIAL : ${sheetData.commercialName}
🎯 PROMESSE : ${sheetData.promise}

📝 DESCRIPTION COMMERCIALE :
- Introduction : ${sheetData.longDescription?.introduction}
- Problème : ${sheetData.longDescription?.problem}
- Solution : ${sheetData.longDescription?.solution}
- Ce que vous allez apprendre : ${sheetData.longDescription?.whatTheyWillLearn}
- Pourquoi cet ebook est unique : ${sheetData.longDescription?.whyDifferent}
- Conclusion : ${sheetData.longDescription?.conclusion}

💎 BÉNÉFICES CLÉS :
${sheetData.benefits?.map(b => `• ${b}`).join('\n')}

🎁 BONUS OFFERTS :
${sheetData.bonus?.map(b => `• ${b}`).join('\n')}

❓ QUESTIONS FRÉQUENTES (FAQ) :
${sheetData.faq?.map((f, i) => `${i + 1}. Q: ${f.question}\n   R: ${f.answer}`).join('\n\n')}

📢 CALL TO ACTION :
${sheetData.cta}

🌐 SEO :
- Meta Title : ${sheetData.seo?.metaTitle}
- Meta Description : ${sheetData.seo?.metaDescription}
- Mots-clés : ${sheetData.seo?.keywords?.join(', ')}
`;

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Client-side Word Download
  const handleDownloadWord = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Fiche Produit</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          h1 { color: #2B6CB0; font-size: 24pt; margin-bottom: 5pt; }
          .promise { font-style: italic; font-size: 14pt; color: #4A5568; margin-bottom: 20pt; }
          h2 { color: #2D3748; font-size: 16pt; border-bottom: 1px solid #ddd; padding-bottom: 5pt; margin-top: 20pt; }
          p { margin-bottom: 10pt; text-align: justify; }
          ul { margin-bottom: 15pt; }
          li { margin-bottom: 5pt; }
          .faq-item { margin-bottom: 12pt; }
          .faq-q { font-weight: bold; }
          .cta { background-color: #f7fafc; border: 1px solid #e2e8f0; padding: 15px; text-align: center; font-weight: bold; font-size: 14pt; color: #2b6cb0; margin-top: 25pt; }
          .seo { background-color: #edf2f7; padding: 12px; margin-top: 25pt; font-size: 10pt; }
        </style>
      </head>
      <body>
        <h1>${sheetData.commercialName}</h1>
        <p class="promise">"${sheetData.promise}"</p>

        <h2>Description Commerciale</h2>
        <p><strong>Introduction :</strong> ${sheetData.longDescription?.introduction}</p>
        <p><strong>Problème :</strong> ${sheetData.longDescription?.problem}</p>
        <p><strong>Solution :</strong> ${sheetData.longDescription?.solution}</p>
        <p><strong>Ce que le lecteur va apprendre :</strong> ${sheetData.longDescription?.whatTheyWillLearn}</p>
        <p><strong>Pourquoi cet ebook est différent :</strong> ${sheetData.longDescription?.whyDifferent}</p>
        <p><strong>Conclusion :</strong> ${sheetData.longDescription?.conclusion}</p>

        <h2>Bénéfices Clés</h2>
        <ul>
          ${sheetData.benefits?.map(b => `<li>${b}</li>`).join('')}
        </ul>

        <h2>Bonus Proposés</h2>
        <ul>
          ${sheetData.bonus?.map(b => `<li>${b}</li>`).join('')}
        </ul>

        <h2>Questions Fréquentes (FAQ)</h2>
        ${sheetData.faq?.map(f => `
          <div class="faq-item">
            <p class="faq-q">❓ Q : ${f.question}</p>
            <p>💡 R : ${f.answer}</p>
          </div>
        `).join('')}

        <div class="cta">
          📢 ${sheetData.cta}
        </div>

        <div class="seo">
          <p><strong>Meta Title :</strong> ${sheetData.seo?.metaTitle}</p>
          <p><strong>Meta Description :</strong> ${sheetData.seo?.metaDescription}</p>
          <p><strong>Mots-clés :</strong> ${sheetData.seo?.keywords?.join(', ')}</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fiche_produit_${book?.title?.replace(/\s+/g, '_') || 'ebook'}.doc`;
    a.click();
  };

  // Backend Playwright PDF Download
  const handleDownloadPdf = async () => {
    setExportingPdf(true);
    try {
      const response = await api.get(`/marketing/product-sheet/pdf/${bookId}`, {
        responseType: 'blob'
      });
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = fileURL;
      a.download = `fiche_produit_${book?.title?.replace(/\s+/g, '_') || 'ebook'}.pdf`;
      a.click();
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la génération du PDF.");
    } finally {
      setExportingPdf(false);
    }
  };

  if (bookLoading || loading || generating) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-semibold text-lg">
          {generating ? "Création de la fiche commerciale par l'IA..." : "Chargement de la fiche produit..."}
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-muted/10">
      
      {/* Top Header */}
      <div className="h-14 border-b bg-card flex items-center justify-between px-6 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-md">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">Fiche Commerciale : {book?.title}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCopyText} 
            className="flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-muted text-sm font-semibold transition-colors"
          >
            {copySuccess ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            <span>{copySuccess ? 'Copié !' : 'Copier'}</span>
          </button>
          
          <button 
            onClick={handleDownloadWord} 
            className="flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-muted text-sm font-semibold transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-500" />
            <span>Word (.doc)</span>
          </button>

          <button 
            onClick={handleDownloadPdf}
            disabled={exportingPdf}
            className="flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-muted text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {exportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-red-500" />}
            <span>PDF</span>
          </button>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Enregistrer</span>
          </button>
        </div>
      </div>

      {/* Main Form + Preview Grid */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Form Editors */}
        <div className="w-1/2 border-r bg-background overflow-y-auto p-6 space-y-6">
          
          {/* Section: Général */}
          <div className="space-y-4 border-b pb-6">
            <h3 className="text-md font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Informations de Vente
            </h3>
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Nom commercial</label>
              <input 
                type="text" 
                className="w-full p-2.5 border rounded bg-background font-medium"
                value={sheetData.commercialName}
                onChange={e => setSheetData({ ...sheetData, commercialName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Promesse / Accroche forte</label>
              <input 
                type="text" 
                className="w-full p-2.5 border rounded bg-background font-medium"
                value={sheetData.promise}
                onChange={e => setSheetData({ ...sheetData, promise: e.target.value })}
              />
            </div>
          </div>

          {/* Section: Description Longue */}
          <div className="space-y-4 border-b pb-6">
            <h3 className="text-md font-bold uppercase tracking-wider text-primary">Structure de Description</h3>
            {['introduction', 'problem', 'solution', 'whatTheyWillLearn', 'whyDifferent', 'conclusion'].map((f) => (
              <div key={f}>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1 capitalize">
                  {f === 'introduction' && "Introduction"}
                  {f === 'problem' && "Le Problème"}
                  {f === 'solution' && "La Solution"}
                  {f === 'whatTheyWillLearn' && "Ce que le lecteur va apprendre"}
                  {f === 'whyDifferent' && "Pourquoi cet ebook est différent"}
                  {f === 'conclusion' && "Conclusion / Appel"}
                </label>
                <textarea 
                  className="w-full p-2.5 border rounded bg-background text-sm h-24 resize-none"
                  value={sheetData.longDescription?.[f] || ''}
                  onChange={e => {
                    const newDesc = { ...sheetData.longDescription, [f]: e.target.value };
                    setSheetData({ ...sheetData, longDescription: newDesc });
                  }}
                />
              </div>
            ))}
          </div>

          {/* Section: Bénéfices & Bonus */}
          <div className="grid grid-cols-2 gap-6 border-b pb-6">
            {/* Benefits */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-bold uppercase tracking-wider text-primary">Bénéfices</h3>
                <button onClick={() => addListItem('benefits', 'Nouveau bénéfice')} className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold">
                  <Plus className="w-3.5 h-3.5" /> Ajouter
                </button>
              </div>
              <div className="space-y-2">
                {sheetData.benefits?.map((b, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-1 p-2 border rounded bg-background text-sm"
                      value={b}
                      onChange={e => updateListItem('benefits', idx, e.target.value)}
                    />
                    <button onClick={() => removeListItem('benefits', idx)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bonus */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                  <Gift className="w-4 h-4 text-emerald-500" /> Bonus
                </h3>
                <button onClick={() => addListItem('bonus', 'Nouveau bonus')} className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold">
                  <Plus className="w-3.5 h-3.5" /> Ajouter
                </button>
              </div>
              <div className="space-y-2">
                {sheetData.bonus?.map((b, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-1 p-2 border rounded bg-background text-sm"
                      value={b}
                      onChange={e => updateListItem('bonus', idx, e.target.value)}
                    />
                    <button onClick={() => removeListItem('bonus', idx)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section: FAQ */}
          <div className="space-y-4 border-b pb-6">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <HelpCircle className="w-4 h-4" /> FAQ (Questions/Réponses)
              </h3>
              <button onClick={addFaq} className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold">
                <Plus className="w-3.5 h-3.5" /> Ajouter Q/R
              </button>
            </div>
            <div className="space-y-4">
              {sheetData.faq?.map((f, idx) => (
                <div key={idx} className="p-4 border rounded-xl bg-muted/30 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-muted-foreground">Q/R #{idx + 1}</span>
                    <button onClick={() => removeFaq(idx)} className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Supprimer
                    </button>
                  </div>
                  <div>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded bg-background font-medium text-sm"
                      placeholder="Question..."
                      value={f.question}
                      onChange={e => updateFaq(idx, 'question', e.target.value)}
                    />
                  </div>
                  <div>
                    <textarea 
                      className="w-full p-2 border rounded bg-background text-sm h-16 resize-none"
                      placeholder="Réponse..."
                      value={f.answer}
                      onChange={e => updateFaq(idx, 'answer', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: CTA */}
          <div className="space-y-4 border-b pb-6">
            <h3 className="text-md font-bold uppercase tracking-wider text-primary">Appel à l'action (Call to Action)</h3>
            <input 
              type="text" 
              className="w-full p-2.5 border rounded bg-background font-semibold"
              value={sheetData.cta}
              onChange={e => setSheetData({ ...sheetData, cta: e.target.value })}
            />
          </div>

          {/* Section: SEO */}
          <div className="space-y-4 pb-6">
            <h3 className="text-md font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Globe className="w-4 h-4" /> Optimisation Référencement (SEO)
            </h3>
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Meta Title</label>
              <input 
                type="text" 
                className="w-full p-2.5 border rounded bg-background text-sm font-medium"
                value={sheetData.seo?.metaTitle || ''}
                onChange={e => {
                  const newSeo = { ...sheetData.seo, metaTitle: e.target.value };
                  setSheetData({ ...sheetData, seo: newSeo });
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Meta Description</label>
              <textarea 
                className="w-full p-2.5 border rounded bg-background text-sm h-20 resize-none"
                value={sheetData.seo?.metaDescription || ''}
                onChange={e => {
                  const newSeo = { ...sheetData.seo, metaDescription: e.target.value };
                  setSheetData({ ...sheetData, seo: newSeo });
                }}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold uppercase text-muted-foreground">Mots-clés SEO</label>
                <button 
                  onClick={() => {
                    const newKeywords = [...(sheetData.seo?.keywords || [])];
                    newKeywords.push('nouveau');
                    setSheetData({ ...sheetData, seo: { ...sheetData.seo, keywords: newKeywords } });
                  }} 
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Ajouter
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sheetData.seo?.keywords?.map((kw, kIdx) => (
                  <div key={kIdx} className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-full text-xs font-medium">
                    <input 
                      type="text"
                      className="bg-transparent w-16 outline-none"
                      value={kw}
                      onChange={e => {
                        const newKw = [...sheetData.seo.keywords];
                        newKw[kIdx] = e.target.value;
                        setSheetData({ ...sheetData, seo: { ...sheetData.seo, keywords: newKw } });
                      }}
                    />
                    <button 
                      onClick={() => {
                        const newKw = sheetData.seo.keywords.filter((_, i) => i !== kIdx);
                        setSheetData({ ...sheetData, seo: { ...sheetData.seo, keywords: newKw } });
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Live Sales Page Preview */}
        <div className="w-1/2 bg-muted/5 overflow-y-auto p-8 max-w-none">
          <div className="bg-card shadow-2xl rounded-2xl border p-12 space-y-10 max-w-2xl mx-auto">
            {/* Header / Hero */}
            <div className="text-center border-b pb-8 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-primary px-3.5 py-1.5 bg-primary/10 rounded-full">
                Offre Spéciale Ebook
              </span>
              <h1 className="text-4xl font-serif font-extrabold text-slate-800 leading-tight pt-2">{sheetData.commercialName || "Titre de Vente"}</h1>
              <div className="w-16 h-1 bg-amber-500 mx-auto my-2 rounded-full"></div>
              <p className="text-xl text-amber-600 font-semibold italic max-w-md mx-auto leading-relaxed">"{sheetData.promise || "Votre phrase d'accroche..."}"</p>
            </div>

            {/* Sales Story */}
            <div className="space-y-6">
              <h3 className="text-xl font-serif font-bold text-slate-800 border-l-4 border-primary pl-3">À propos de cet Ebook</h3>
              
              <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line text-justify space-y-4">
                <p>{sheetData.longDescription?.introduction}</p>
              </div>
              
              {/* Problem block (Red style) */}
              <div className="p-6 bg-red-50/50 border border-red-100 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                  <span>⚠️ LE CONSTAT (LE PROBLÈME)</span>
                </div>
                <p className="text-red-900 text-sm leading-relaxed text-justify">{sheetData.longDescription?.problem}</p>
              </div>

              {/* Solution block (Green style) */}
              <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <span>✅ LA SOLUTION APPORTÉE</span>
                </div>
                <p className="text-emerald-900 text-sm leading-relaxed text-justify">{sheetData.longDescription?.solution}</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-800">Ce que vous allez concrètement apprendre :</p>
                <p className="text-slate-600 text-sm leading-relaxed text-justify whitespace-pre-line">{sheetData.longDescription?.whatTheyWillLearn}</p>
              </div>

              <div className="p-6 bg-amber-50/20 border border-amber-100 rounded-xl space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Pourquoi cet ebook est unique</p>
                <p className="text-slate-600 text-sm leading-relaxed text-justify italic">"{sheetData.longDescription?.whyDifferent}"</p>
              </div>

              <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line text-justify pt-2">
                <p>{sheetData.longDescription?.conclusion}</p>
              </div>
            </div>

            {/* Benefits & Bonus Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-8">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h3 className="text-md font-bold mb-4 text-slate-800 flex items-center gap-1.5">
                  <span>💎 Vos Bénéfices</span>
                </h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  {sheetData.benefits?.map((b, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="leading-tight">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-emerald-50/20 p-6 rounded-xl border border-emerald-100">
                <h3 className="text-md font-bold mb-4 text-slate-800 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>🎁 Bonus Offerts</span>
                </h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  {sheetData.bonus?.map((b, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-tight">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* FAQ Preview */}
            <div className="border-t pt-8 space-y-6">
              <h3 className="text-lg font-serif font-bold text-slate-800 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" /> Questions Fréquentes
              </h3>
              <div className="space-y-4">
                {sheetData.faq?.map((f, i) => (
                  <div key={i} className="p-4 border rounded-xl space-y-2 text-sm bg-slate-50/50">
                    <div className="font-bold text-slate-800 flex gap-1.5">
                      <span>❓</span>
                      <span>{f.question}</span>
                    </div>
                    <div className="text-slate-600 pl-6 leading-relaxed text-justify">{f.answer}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Final */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-2xl p-8 text-center space-y-4 shadow-sm">
              <p className="text-xs font-bold text-primary uppercase tracking-widest">Passez à l'action</p>
              <h3 className="text-2xl font-serif font-bold text-slate-800 leading-tight">👉 {sheetData.cta || "Cliquez ici pour commander..."}</h3>
            </div>

            {/* SEO metadata */}
            <div className="bg-muted/50 rounded-xl p-5 text-xs font-mono text-muted-foreground space-y-2 border">
              <div><strong className="text-slate-700">Meta Title :</strong> {sheetData.seo?.metaTitle}</div>
              <div><strong className="text-slate-700">Meta Description :</strong> {sheetData.seo?.metaDescription}</div>
              <div><strong className="text-slate-700">Keywords :</strong> {sheetData.seo?.keywords?.join(', ')}</div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
