# Critères de sortie MVP France/UE

## Parcours utilisateur

1. Inscription e-mail + vérification
2. Création et publication d’une aspiration avec besoin
3. Découverte / soutien / commentaire
4. Proposition de contribution non monétaire
5. Acceptation → conversation privée → confirmation bilatérale

## Technique

- Migrations SQL appliquées (`0000` + `0001`)
- Outbox transactionnelle + worker consommateurs (ranking, notifications, media)
- Export / suppression de compte (`/me/export`, `DELETE /me`)
- Pages légales FR (`/legal/privacy`, `/legal/terms`)
- Tests unitaires des agrégats critiques + CI avec Postgres/Valkey

## Hors périmètre

- Paiements Stripe / wallets / escrow
- Messagerie directe hors contribution
- Application mobile native
