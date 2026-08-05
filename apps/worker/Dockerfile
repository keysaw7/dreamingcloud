FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/worker/package.json apps/worker/
COPY packages ./packages
RUN pnpm install --frozen-lockfile --filter @dreamingcloud/api... --filter @dreamingcloud/worker...

FROM deps AS build
COPY apps/api apps/api
COPY apps/worker apps/worker
COPY packages packages
RUN pnpm --filter @dreamingcloud/api build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /app /app
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD node -e "process.exit(0)"
CMD ["pnpm", "--filter", "@dreamingcloud/api", "exec", "node", "dist/worker-main.js"]
