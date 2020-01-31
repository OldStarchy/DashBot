FROM node:10 AS builder
WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .

COPY src ./src

RUN ls

RUN yarn install && \
	yarn build


FROM arm32v7/node:10-alpine
WORKDIR /app

COPY --from=builder /app/dist .
COPY --from=builder /app/node_modules ./node_modules

CMD ["node", "main.js"]
