## BUILD STAGE ##
# Uses NPM to build the react app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . /
RUN npm run build


## PRODUCTION STAGE ##
# Uses Nginx image to serve the files on port 80
FROM nginx:1.27-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/web.conf
EXPOSE 80