# ADR 0004 — PostgreSQL et Drizzle ORM

- **Statut** : accepté
- **Date** : 2026-08-05

## Décision

PostgreSQL est la source de vérité transactionnelle. Drizzle ORM et drizzle-kit fournissent les schémas TypeScript et migrations SQL.

Les requêtes critiques (feed, recherche, classement) peuvent employer le SQL typé de Drizzle. Les migrations sont versionnées et revues comme du code.

## Conséquences

- Les garanties relationnelles, transactions et index PostgreSQL restent accessibles sans contournement ORM.
- Les tables restent propriétaires de leur module et sont ré-exportées uniquement pour l'outillage de migration.
- Le serveur applicatif ne dépend pas d'une couche de génération de client.
