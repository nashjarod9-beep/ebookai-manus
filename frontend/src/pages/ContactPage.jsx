import { useState } from 'react';
import { MapPin, MessageCircle, Clock, Mail, Phone, Send, CheckCircle } from 'lucide-react';

const contactInfos = [
  {
    icon: MapPin,
    label: 'Adresse',
    lines: ['Dakar, Sénégal'],
    color: 'text-violet-600 bg-violet-100',
  },
  {
    icon: Phone,
    label: 'WhatsApp',
    lines: ['+221 77 838 96 10', 'Réponse instantanée 24/7'],
    highlight: true,
    href: 'https://wa.me/221778389610',
    color: 'text-green-600 bg-green-100',
  },
  {
    icon: Mail,
    label: 'Email',
    lines: ['nashjarod9@gmail.com'],
    color: 'text-blue-600 bg-blue-100',
  },
  {
    icon: Clock,
    label: 'Horaires',
    lines: ['Lun - Ven : 8h00 - 18h00', 'Support : 24h/24, 7j/7'],
    color: 'text-amber-600 bg-amber-100',
  },
];

const responseTimes = [
  { type: 'Questions générales', time: '2h' },
  { type: 'Support technique', time: '30 min' },
  { type: 'Problèmes critiques', time: 'Immédiat' },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    // Simulate form send (you can wire to emailjs or a backend endpoint)
    await new Promise(r => setTimeout(r, 1500));
    setSent(true);
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Dark Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl" />
        </div>
        <div className="relative">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-violet-400 mb-3">Support & Assistance</span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 font-serif">Contactez-nous</h1>
          <p className="text-slate-300 max-w-xl mx-auto text-base leading-relaxed">
            Notre équipe est à votre disposition pour vous accompagner dans la création de vos ebooks 
            et répondre à toutes vos questions.
          </p>
        </div>
      </div>

      {/* Content Section - White */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Left: Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Parlons de votre ebook</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Que vous soyez débutant ou créateur confirmé, nous avons la solution adaptée à vos besoins.
              </p>
            </div>

            {/* Info Cards */}
            <div className="space-y-3">
              {contactInfos.map((info, i) => {
                const Icon = info.icon;
                const card = (
                  <div
                    key={i}
                    className={`border border-slate-100 rounded-xl p-4 flex items-start gap-3 ${info.highlight ? 'border-green-200 bg-green-50' : 'bg-white hover:bg-slate-50'} transition-colors`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${info.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{info.label}</p>
                      {info.lines.map((line, j) => (
                        <p key={j} className={`text-sm ${j > 0 ? 'text-green-600 font-semibold' : 'text-slate-500'}`}>{line}</p>
                      ))}
                    </div>
                  </div>
                );
                return info.href ? <a href={info.href} target="_blank" rel="noopener noreferrer" key={i}>{card}</a> : card;
              })}
            </div>

            {/* Response Time Guarantee */}
            <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
              <p className="font-bold text-amber-800 text-sm mb-2">⚡ Temps de réponse garanti</p>
              <ul className="space-y-1">
                {responseTimes.map((rt, i) => (
                  <li key={i} className="flex justify-between text-sm text-amber-700">
                    <span>• {rt.type}</span>
                    <span className="font-bold">{rt.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Form + Quick Contacts */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quick action buttons */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800">Écrivez-nous</h3>
              <a
                href="mailto:nashjarod9@gmail.com"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity"
              >
                <Mail className="w-4 h-4" />
                nashjarod9@gmail.com
              </a>
              <a
                href="https://wa.me/221778389610"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-green-500" />
                WhatsApp +221 77 838 96 10
              </a>
            </div>

            {/* Contact form */}
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
              {sent ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-7 h-7 text-green-600" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg">Message envoyé !</h4>
                  <p className="text-slate-500 text-sm">Nous vous répondrons dans les plus brefs délais.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-bold text-slate-800 mb-1">Formulaire de contact</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Votre nom</label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData(p => ({...p, name: e.target.value}))}
                        placeholder="Fatou Diallo"
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Email</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData(p => ({...p, email: e.target.value}))}
                        placeholder="fatou@exemple.com"
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Sujet</label>
                    <input
                      required
                      type="text"
                      value={formData.subject}
                      onChange={e => setFormData(p => ({...p, subject: e.target.value}))}
                      placeholder="Question sur mon abonnement..."
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={e => setFormData(p => ({...p, message: e.target.value}))}
                      placeholder="Décrivez votre demande en détail..."
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {sending ? (
                      <span className="animate-pulse">Envoi en cours...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Envoyer le message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
