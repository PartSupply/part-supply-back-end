FROM node:14.15-alpine as base
WORKDIR /app
RUN apk add --no-cache git bash

FROM base as dev
RUN npm install bcrypt
CMD ["./entrypoint.sh", "--dev"]

FROM base as production
RUN apk add --no-cache curl
COPY package.json yarn.lock ./
RUN npm cache clean --force && rm -rf node_modules
RUN yarn install
RUN npm install bcrypt
COPY . ./
RUN yarn build
EXPOSE 80
CMD ["./entrypoint.sh"]
