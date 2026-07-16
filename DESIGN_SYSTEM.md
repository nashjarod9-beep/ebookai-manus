# Système de Design Neno AI (Premium Dark Mode)

Ce document décrit le système de design mis en place pour la plateforme **Neno AI**. L'ensemble de la charte graphique et des composants UI respecte un univers premium sombre, moderne, inspiré du glassmorphism et animé de façon fluide.

---

## 1. Palette de Couleurs & Tokens (`tokens.ts`)

La palette utilise une structure sombre élégante (surface-0 à surface-2) complétée par des teintes de marque éclatantes.

| Token | Couleur | Code Hex | Usage |
| :--- | :--- | :--- | :--- |
| `brand-primary` | Bleu profond | `#1E3A8A` | Couleur de marque dominante, début de gradient. |
| `brand-accent` | Violet électrique | `#7C3AED` | Points d'interaction, accents, fin de gradient. |
| `brand-success` | Vert émeraude | `#10B981` | Validation, succès, indicateurs positifs. |
| `brand-error` | Rouge corail | `#F43F5E` | Alertes, erreurs, destructions. |
| `surface-0` | Fond application | `#0B0F19` | Couleur de fond principale de l'application. |
| `surface-1` | Fond de carte | `#151D30` | Contenants, cartes glassmorphismes de premier plan. |
| `surface-2` | Fond actif/hover | `#1F2942` | État actif, sélectionné, ou survolé des cartes. |

---

## 2. Typographie

Deux familles de polices de caractères sont associées pour refléter l'autorité de l'édition et la modernité logicielle :
1.  **Playfair Display (Serif)** : Utilisée pour les titres de marque, les titres d'ebooks, et les titres de fiches produit. Elle apporte un caractère traditionnel et haut de gamme.
2.  **Inter (Sans-serif)** : Utilisée pour l'ensemble de l'interface utilisateur (UI), les textes courants, les formulaires, et les boutons de navigation, garantissant une lisibilité optimale sur tous les écrans.

---

## 3. Composants UI Partagés

### A. Le composant Card (`src/components/ui/Card.jsx`)
Il s'agit d'un composant de conteneur adoptant les codes du **glassmorphism** :
*   **Bords arrondis** : `rounded-2xl`
*   **Effet de verre** : `backdrop-blur-md bg-white/5 border border-white/10`
*   **Micro-interactions (Survol)** :
    *   Légère élévation de l'échelle à `1.02`
    *   Apparition d'un halo lumineux interne (`bg-gradient-to-tr from-brand-primary/10 to-brand-accent/10`)
    *   Changement de bordure vers l'accent de marque.

### B. Le composant Button (`src/components/ui/Button.jsx`)
Deux variantes principales sont disponibles :
1.  **Primaire (`variant="primary"`)** : Dégradé du bleu profond vers le violet, doté d'une ombre douce de couleur de marque.
2.  **Secondaire (`variant="secondary"`)** : Bordure blanche transparente, avec arrière-plan sombre légèrement opaque.
*   **Micro-interactions** :
    *   *Survol* : Échelle `1.02` et éclaircissement léger.
    *   *Clic (Active)* : Échelle `0.97` pour un ressenti physique au clic.

---

## 4. Animations Préréglées (`motion.ts`)

Pour assurer la cohérence visuelle des animations, trois configurations réutilisables de **Framer Motion** sont définies :
1.  **`fadeInUp`** : Révèle les éléments en douceur du bas vers le haut (idéal pour les chargements de pages ou de sections).
2.  **`staggerChildren`** : Orchestre l'apparition successive et rythmée des éléments enfants les uns après les autres.
3.  **`scaleOnHover`** : Standardise la mise à l'échelle des éléments interactifs (cartes) au survol et au clic.

---

## 5. Breakpoints & Spécifications Responsive

Afin de garantir une interface parfaitement fluide de type **mobile-first**, les règles d'espacement et d'affichage suivantes doivent être appliquées :

| Breakpoint | Taille d'Écran | Configuration de Grille & Layout | Paddings & Marges Recommandés |
| :--- | :--- | :--- | :--- |
| **Mobile** (`sm`) | `< 640px` | Colonne simple (`flex-col`), boutons pleine largeur | `p-4`, `px-4 py-6` |
| **Tablette** (`md`) | `640px` à `1024px` | Grille à 2 colonnes (`md:grid-cols-2`) | `p-5`, `px-5 py-8` |
| **Desktop** (`lg` / `xl`) | `> 1024px` | Grille multi-colonnes (`lg:grid-cols-4` / `lg:grid-cols-5`) | `p-6`, `px-6 py-10` |

### Règles transverses :
*   **Bottom Tab Bar** : Sur les résolutions mobiles (`< 768px`), une barre d'onglets inférieure (`BottomTabBar`) remplace le menu de navigation pour un accès facilité aux pouces de l'utilisateur.
*   **Bouton de Création Flottant (FAB)** : Un bouton d'action principal flottant "➕ Créer" reste collé en bas à droite sur mobile pour encourager la création.
*   **Zéro Table** : Toute utilisation de tableau (`<table>`) est bannie sur mobile. Elle est systématiquement remplacée par des cartes (`Card`) empilées dotées de micro-détails.

