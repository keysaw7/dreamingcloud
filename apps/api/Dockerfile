FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY apps/api/package.json apps/api/
COPY packages ./packages
RUN pnpm install --frozen-lockfile --filter @dreamingcloud/api... --filter dreamingcloud

FROM deps AS build
COPY apps/api apps/api
COPY packages packages
RUN pnpm exec turbo run build --filter=@dreamingcloud/api

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /app /app
EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=5s --retries=5 CMD node -e "const p=process.env.PORT||3001; fetch('http://127.0.0.1:'+p+'/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["sh", "-c", "node apps/api/scripts/migrate-sql.mjs && exec node apps/api/dist/main.js"]
