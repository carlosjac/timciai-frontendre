# Static admin. The browser talks to the API on the same origin (Caddy),
# so the build leaves VITE_API_URL empty and the app calls /v1.

FROM node:22-bookworm-slim AS build

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

ARG VITE_TIMCI_REVISION=dev
ENV VITE_API_URL=
ENV VITE_TIMCI_REVISION=${VITE_TIMCI_REVISION}
ENV NODE_OPTIONS=--max-old-space-size=4096

RUN pnpm build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

LABEL org.opencontainers.image.source=https://github.com/carlosjac/timciai-frontendre

EXPOSE 80
