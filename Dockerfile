FROM node:14 AS builder
WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.prod.json .
COPY tsconfig.json .

COPY scripts ./scripts
COPY src ./src

RUN ls

RUN yarn install --production && \
	yarn build:prod


FROM arm32v7/node:14-alpine
WORKDIR /app

COPY --from=builder /app/dist .
COPY --from=builder /app/node_modules ./node_modules

CMD ["node", "main.js"]
