FROM arm32v7/node:10-alpine
WORKDIR /home/node/app

COPY node_modules/ ./node_modules
COPY dist/ .

CMD ["node", "main.js"]
