FROM node:latest AS build

WORKDIR /usr/src/app

COPY . .

RUN npm install

RUN npm run build

FROM nginx:alpine

WORKDIR /usr/src/app

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80
