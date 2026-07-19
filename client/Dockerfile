FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

ARG VITE_API_BASE=/api
ARG VITE_SOCKET_URL=http://localhost:5173
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
