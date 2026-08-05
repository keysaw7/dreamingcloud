# ADR 0002 — Clean Architecture pragmatique

- **Statut** : accepté
- **Date** : 2026-08-05

## Décision

Chaque module suit quatre zones : `domain`, `application`, `infrastructure` et `presentation`.

`domain` contient les invariants métier, value objects, événements et ports en TypeScript pur. `application` exécute les cas d'usage. `infrastructure` implémente les ports. `presentation` expose HTTP, jobs et consommateurs d'événements.

La direction des dépendances est :

```text
presentation → application → domain ← infrastructure
```

## Conséquences

- Le domaine est testable sans framework ni base de données.
- NestJS, Drizzle et Stripe sont remplaçables aux frontières.
- Les abstractions génériques sans besoin métier démontré sont interdites.
