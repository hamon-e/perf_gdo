# syntax=docker/dockerfile:1.7
FROM node:22 AS build

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
WORKDIR /app

RUN corepack enable

# Keep dependency installation in its own layer and persist pnpm's content-
# addressed store between BuildKit builds. Source changes no longer invalidate it.
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=frontend-pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store

COPY . .

ARG VITE_API_BASE_URL=http://localhost:8000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN pnpm run build
FROM nginx:latest
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
ARG APP_VERSION=dev
RUN printf '{"frontend": "%s"}\n' "$APP_VERSION" > /usr/share/nginx/html/version.json
