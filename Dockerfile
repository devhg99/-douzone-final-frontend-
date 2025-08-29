## BUILD STAGE ##
# Uses NPM to build the react app
FROM node:20-alpine AS build
WORKDIR /app

# 빌드타임 변수 (예: API base URL)
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build


## RUNTIME (NGINX) ##
FROM nginx:1.27-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx/web.conf /etc/nginx/conf.d/default.conf
EXPOSE 80