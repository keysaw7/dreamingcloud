# ADR 0003 — API REST versionnée

- **Statut** : accepté
- **Date** : 2026-08-05

## Décision

L'API publique utilise REST sous `/api/v1`, des ressources au pluriel et OpenAPI 3.1. Les collections utilisent une pagination par curseur. Les erreurs suivent RFC 9457 Problem Details.

GraphQL n'est pas adopté dans le cœur applicatif.

## Conséquences

- Les réponses lisibles sont cacheables par HTTP et CDN.
- Les clients web et mobile consomment le même contrat stable.
- Les évolutions de `v1` sont additives ; les dépréciations restent disponibles au moins six mois.
