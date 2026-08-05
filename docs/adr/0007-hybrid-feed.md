# ADR 0007 — Feed hybride

- **Statut** : accepté
- **Date** : 2026-08-05

## Décision

Le feed personnalise emploie une stratégie hybride :

- *fan-out on write* pour les auteurs ayant moins de 10 000 abonnés ;
- *fan-out on read* pour les auteurs populaires ;
- feed de découverte construit depuis les scores d'impact, filtré par intérêts.

## Conséquences

- Les lectures usuelles restent rapides.
- Une publication d'un compte très suivi n'écrit pas des millions de lignes.
- Le module `feed` est le seul à maintenir une projection de lecture CQRS.
