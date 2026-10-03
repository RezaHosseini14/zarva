FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/backend/package.json apps/backend/
COPY packages/shared/package.json packages/shared/
RUN npm install --workspace=@zarva/backend --workspace=@zarva/shared --include-workspace-root=false || npm install

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build -w @zarva/shared && npm run db:generate -w @zarva/backend && npm run build -w @zarva/backend

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/backend/dist ./dist
COPY --from=build /app/apps/backend/package.json ./
COPY --from=build /app/apps/backend/prisma ./prisma
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/shared ./packages/shared
EXPOSE 4100
CMD ["node", "dist/main.js"]
