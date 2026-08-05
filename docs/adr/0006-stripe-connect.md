# ADR 0006 — Stripe Connect pour les paiements

- **Statut** : accepté
- **Date** : 2026-08-05

## Décision

Les paiements marketplace passent par Stripe Connect Express et des destination charges. Stripe héberge le KYC ; DreamingCloud applique sa commission avec `application_fee_amount`.

Le webhook Stripe signé est la seule source de vérité d'un encaissement. Un ledger interne append-only, en partie double, est la source de vérité comptable métier.

## Conséquences

- Aucune donnée de carte ne traverse l'API.
- Les montants sont recalculés côté serveur et les webhooks sont idempotents.
- Stripe reste encapsulé par le port `PaymentProvider`.
