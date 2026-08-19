# Conventions UI DreamingCloud

Ces règles sont obligatoires pour le front `apps/web`. Elles sont complétées par
`scripts/check-ui-conventions.mjs` et Biome.

## Architecture

- Les routes restent dans `src/app`. Elles orchestrent les données et rendent les composants.
- Les primitives génériques vivent dans `src/components/ui`. Elles ne contiennent aucune logique
  métier.
- Les compositions réutilisables vivent dans `src/components`, et les composants métier dans
  `src/features/<domaine>`.
- Un Server Component est le défaut. La directive `'use client'` ne s'applique qu'à la plus petite
  feuille interactive possible.
- Un fichier exporte un composant nommé. Les noms de fichiers sont en kebab-case.
- Un composant de plus de 150 lignes doit être découpé. 200 lignes est la limite bloquante.

## Thème et styles

- `src/app/globals.css` est l'unique source du thème, en variables OKLCH sémantiques.
- Les composants utilisent exclusivement les utilitaires sémantiques (`bg-background`,
  `text-foreground`, `border-border`, `bg-primary`).
- Les couleurs arbitraires, les couleurs Tailwind de palette et les références directes à une
  variable CSS sont interdites dans les composants.
- Les variantes se définissent avec CVA. Les classes conditionnelles passent par `cn()`.
- La grille d'espacement est basée sur 4 px : `1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24`.
- Les niveaux de profondeur sont limités à deux. Une surface reçoit une bordure ou une ombre,
  jamais les deux.
- Les animations ne modifient que `opacity` et `transform`, avec 150, 200 ou 300 ms. Elles
  respectent `prefers-reduced-motion`.

## Typographie et contenu

- `next/font` charge la police globale. Aucune police distante n'est chargée avec une règle CSS.
- L'échelle de texte est fermée : `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, `3xl`.
- Une page contient un seul `h1` et respecte l'ordre hiérarchique des titres.
- Aucun texte visible n'est écrit en dur dans un composant : utiliser `next-intl`.

## Interactions et états

- Chaque vue de données traite explicitement les états `loading`, `empty`, `error` et `idle`.
- Les squelettes reproduisent la géométrie de leur contenu final.
- Une erreur de lecture ne devient jamais un état vide silencieux.
- `sonner` annonce les retours éphémères. Les erreurs de formulaire sont affichées inline avec
  `Alert`.
- Les actions destructrices emploient `AlertDialog`, jamais `window.confirm`.
- Les actions de follow, support et save sont optimistes et reviennent en arrière si la mutation
  échoue.
- Pour naviguer avec un bouton, utiliser `<Button asChild><Link /></Button>`. Ne jamais imbriquer
  un bouton dans un lien.

## Accessibilité et responsive

- Chaque route fournit un unique landmark `main`. Les navigations ont un `aria-label`.
- Toute action a un nom accessible, tout champ un label et les erreurs de champ sont référencées
  avec `aria-describedby`.
- Les contrastes atteignent AA : 4,5:1 pour le texte et 3:1 pour l'interface.
- Les cibles tactiles mesurent au minimum 44 px.
- Le développement est mobile-first. Les breakpoints autorisés sont `sm`, `md`, `lg` et `xl`.
- Toute modification visuelle se contrôle à 360, 768, 1024 et 1440 px, en thèmes clair et sombre.
- `AppShell` est le seul chrome : gutter, offset sidebar (`w-72` / `lg:ml-72`) et tab bar
  mobile. Les pages n'ajoutent pas de padding de page.
- Toute route s'enveloppe dans `PageShell` (`maxWidth` : `sm` → `max-w-md`, `md` → `max-w-2xl`,
  `lg` → `max-w-3xl`, `xl` → `max-w-6xl`, `full` exception) ou `AuthLayout` / `FeedLayout`.
- Deux colonnes : `FeedLayout` (aside empilé sous `xl`, grille à `xl`) ou `xl:grid-cols-*` local.
  Pas de troisième wrapper de page.
- Grille interne : `grid gap-4 md:grid-cols-2`. Actions : `flex flex-wrap gap-3`, cibles `min-h-11`.
- Enfant de flex : `min-w-0` et `truncate` ou `break-words`.
- Interdit : `max-w-*` ad hoc pour le layout, masquer un aside sans alternative.
