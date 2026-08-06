# DreamingCloud

Plateforme mondiale d’aspirations et de contributions. Le cœur du produit n’est pas un flux de publications : c’est un moteur d’appariement entre des rêves humains et des capacités d’aide.

## Stack

- Monorepo pnpm + Turborepo
- API NestJS 11 (Fastify) + Clean Architecture / DDD léger
- PostgreSQL 17 + Drizzle ORM
- Valkey / Redis + BullMQ (outbox transactionnelle)
- Next.js 16 + Tailwind v4 + design tokens partagés
- MinIO (S3-compatible) pour les médias en local

## Prérequis

- Node.js 22+
- pnpm 11+
- Docker Desktop (ou Docker Engine + Compose)

## Démarrage local

```bash
# 1. Dépendances
pnpm install

# 2. Infrastructure locale
docker compose -f infra/docker/docker-compose.yml up -d

# 3. Variables d'environnement
cp .env.example .env
# Les commandes API / migrations / worker chargent automatiquement ce fichier.

# 4. Migrations
pnpm db:migrate

# 5. Données de démonstration (optionnel)
pnpm db:seed

# 6. Applications
pnpm dev
```

- Web : [http://localhost:3000](http://localhost:3000)
- API : [http://localhost:3001/api/v1/health](http://localhost:3001/api/v1/health)
- MinIO console : [http://localhost:9001](http://localhost:9001)

### Comptes de démo

Mot de passe commun : `DemoPass123!`

| E-mail | Rôle | Usage |
| --- | --- | --- |
| `admin@demo.local` | admin | Modération (`/admin/reports`) |
| `lea@demo.local` | user | Porteuse d’aspirations |
| `noah@demo.local` | user | Contributeur / messagerie |

## Scripts utiles

| Commande | Description |
| --- | --- |
| `pnpm dev` | API + web + worker en parallèle |
| `pnpm verify` | Rejoue le pipeline CI local (migrate + lint + build + typecheck + test) |
| `pnpm lint` | Biome + garde-fous d’architecture |
| `pnpm typecheck` | Vérification TypeScript |
| `pnpm test` | Tests unitaires et d’intégration |
| `pnpm db:migrate` | Applique `apps/api/drizzle/*.sql` et vérifie les tables MVP |
| `pnpm db:seed` | Charge les comptes et contenus de démo |
| `pnpm --filter @dreamingcloud/web test:e2e` | Parcours Playwright (API + web déjà démarrés) |

Si `pnpm dev` échoue parce qu’un Next.js est déjà actif sur `apps/web`, arrêtez le PID indiqué (`kill <pid>`) puis relancez. Ne lancez pas deux `next dev` sur le même dossier.

## Architecture

Voir `docs/adr/` et `docs/domain/`. Chaque module métier suit `domain / application / infrastructure / presentation` et n’expose à l’extérieur que `<module>.public.ts`.

## Périmètre MVP France/UE

Inscription sécurisée, aspirations publiables, social + feed, contributions non monétaires et messagerie privée liée à une contribution. Les paiements Stripe et le mobile natif sont hors scope de cette itération.

## Déploiement (production)

Dockerfiles fournis :

- `apps/api/Dockerfile`
- `apps/worker/Dockerfile`
- `apps/web/Dockerfile`

Variables obligatoires en production (refus au boot sinon) : `JWT_PRIVATE_KEY_PEM`, `JWT_PUBLIC_KEY_PEM`, `COOKIE_SECRET`, `CSRF_SECRET`, `COOKIE_SECURE=true`, secrets S3 non-defaults. Le worker doit tourner à côté de l’API pour consommer l’outbox (ranking, notifications, feed, médias).
