# BUILD
FROM node:20-alpine AS build
WORKDIR /app

ARG REACT_APP_API_BASE_URL
ARG PUBLIC_URL=/                 # CRA면 PUBLIC_URL, Vite면 base:'/'로 별도 설정
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
ENV PUBLIC_URL=$PUBLIC_URL

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# PACKAGE (런타임용 아님, 파일 운반용)
FROM nginx:1.27-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx/web.conf /etc/nginx/conf.d/default.conf
EXPOSE 80