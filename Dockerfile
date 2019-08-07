FROM alpine:latest

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk add --update nodejs npm

RUN npm install

COPY . .

CMD ["node", "server.js"]
