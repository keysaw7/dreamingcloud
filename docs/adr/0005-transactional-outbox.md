# ADR 0005 — Outbox transactionnel

- **Statut** : accepté
- **Date** : 2026-08-05

## Décision

Une mutation métier et son Domain Event sont persistés dans la même transaction PostgreSQL. Un relais publie ensuite les événements vers BullMQ.

Les consommateurs appliquent une livraison *at-least-once* et enregistrent leurs événements traités sous une clé unique `(consumer, event_id)`.

## Conséquences

- Aucun événement n'est perdu entre la base et la file.
- Chaque handler doit être idempotent.
- BullMQ peut être remplacé par Kafka ou NATS derrière le port `EventPublisher`.
