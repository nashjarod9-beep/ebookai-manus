# EbookAI

Créez un ebook professionnel illustré par l'IA en moins de 5 minutes. 100% open source et gratuit.

## Stack Technique
- Frontend : React, Vite, Tailwind CSS, shadcn/ui, Framer Motion
- Backend : Node.js, Express, Prisma (SQLite/PostgreSQL)
- IA : Gemini 1.5 Flash (Texte), Pollinations.ai (Images)

## Prérequis
- Node.js 20+
- Clé API Google AI Studio (Gratuite)

## Installation & Démarrage local
1. Clonez le dépôt
2. Installez les dépendances :
   ```bash
   npm run install:all
   ```
3. Configurez les variables d'environnement dans `backend/.env` (ajoutez votre GOOGLE_API_KEY)
4. Initialisez la base de données :
   ```bash
   cd backend
   npx prisma db push
   ```
5. Lancez le projet :
   ```bash
   npm run dev
   ```

Le frontend sera accessible sur http://localhost:5173 et le backend sur http://localhost:5000.
