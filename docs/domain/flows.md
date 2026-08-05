# Flux métier de référence

## Contribution

```mermaid
stateDiagram-v2
    [*] --> Proposed
    Proposed --> InDiscussion: demande de précisions
    InDiscussion --> Accepted
    Proposed --> Accepted
    Proposed --> Declined
    InDiscussion --> Declined
    Accepted --> InProgress
    InProgress --> Completed: confirmation bilatérale
    InProgress --> Disputed
    Disputed --> Completed
    Disputed --> Cancelled
    Accepted --> Cancelled
    Completed --> [*]
    Declined --> [*]
    Cancelled --> [*]
```

La fin exige la déclaration du contributeur et la confirmation du porteur. Cette double confirmation alimente la réputation et prépare un éventuel escrow.

## Don financier

```mermaid
sequenceDiagram
    participant Donateur
    participant API
    participant Payments
    participant Stripe
    participant Ledger
    participant Ranking

    Donateur->>API: POST /api/v1/payment-intents (Idempotency-Key)
    API->>Payments: CreateDonationIntent
    Payments->>Payments: recalcul du montant côté serveur
    Payments->>Stripe: PaymentIntent destination charge
    Stripe-->>Donateur: confirmation via Stripe Elements
    Stripe->>API: webhook signé payment_intent.succeeded
    API->>Payments: vérification + idempotence
    Payments->>Ledger: écritures double entrée
    Payments->>Ranking: payments.payment.succeeded.v1
```

## Feed

Le module `feed` maintient une projection de lecture. Les petits comptes sont distribués à l'écriture ; les comptes populaires sont fusionnés à la lecture. Le feed de découverte interroge les scores d'impact et les intérêts de l'utilisateur.
