FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
# CRA류면 빌드타임 env는 REACT_APP_*만 반영됨. 필요 시 build 전에 echo해서 주입.
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
# 정적 서버 설치
RUN npm i -g serve
COPY --from=build /app/build ./build
EXPOSE 3000
# 0.0.0.0 바인드 + 3000
CMD ["serve", "-s", "build", "-l", "3000"]
