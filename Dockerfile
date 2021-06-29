FROM node:14.15-alpine as base
WORKDIR /app
RUN apk add --no-cache git bash

FROM base as dev
CMD ["./entrypoint.sh", "--dev"]

FROM base as production
COPY package.json yarn.lock ./
RUN yarn install
COPY . ./
RUN yarn build
EXPOSE 80
CMD ["./entrypoint.sh"]
