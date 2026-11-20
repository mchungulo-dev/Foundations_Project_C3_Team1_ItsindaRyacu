# Build context = ./frontend
# In Dokploy: Build Type = Dockerfile, Build Path = /frontend
# VITE_API_URL is baked in at BUILD time -> set it as a Build Arg in Dokploy
# (Environment tab -> "Build-time Arguments"), e.g. VITE_API_URL=https://api.example.com
FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
