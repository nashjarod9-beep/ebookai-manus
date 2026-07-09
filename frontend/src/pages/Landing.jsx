import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Download, LayoutTemplate, Layers } from 'lucide-react';

export default function Landing() {
  const features = [
    { icon: Sparkles, title: 'Génération IA', desc: 'Des textes complets et pertinents générés en quelques secondes.' },
    { icon: Layers, title: 'Illustrations Auto', desc: 'Des images de haute qualité générées pour chaque chapitre.' },
    { icon: Download, title: 'Export PDF & ZIP', desc: 'Téléchargez votre ebook en PDF ou en format interactif HTML5.' },
    { icon: LayoutTemplate, title: 'Mise en page', desc: 'Un design professionnel prêt à être publié.' },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-24 px-4 text-center bg-gradient-to-b from-background to-muted">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
        >
          Créez votre ebook avec <span className="text-primary">l'IA</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          Générez un ebook professionnel illustré en moins de 5 minutes. 100% facile et adapté au contexte africain.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-4"
        >
          <Link to="/register" className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg">
            Commencer gratuitement
          </Link>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-6xl mx-auto py-24 px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Tout ce dont vous avez besoin</h2>
          <p className="text-muted-foreground">Une plateforme complète pour passer de l'idée à la publication.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 border rounded-xl bg-card hover:border-primary/50 transition-colors"
            >
              <f.icon className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t py-12 text-center text-muted-foreground">
        <p>© 2026 EbookAI. 100% facile et adapté au contexte africain.</p>
      </footer>
    </div>
  );
}
