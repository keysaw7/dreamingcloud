# ADR 0001 — Monolithe modulaire

- **Statut** : accepté
- **Date** : 2026-08-05

## Décision

DreamingCloud est déployé initialement comme un monolithe NestJS modulaire. Chaque bounded context possède son dossier, ses tables, ses contrats publics et son module Nest.

Un module ne peut pas importer l'implémentation d'un autre module. Les interactions passent par des événements de domaine ou par l'interface étroite `<module>.public.ts`.

## Conséquences

- Déploiement, diagnostic et transactions restent simples au MVP.
- Les frontières internes permettent l'extraction ultérieure de `feed`, `ranking` ou `notifications`.
- Les règles de dépendances sont contrôlées en CI avec dependency-cruiser et ESLint.
