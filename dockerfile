# syntax=docker/dockerfile:1

FROM node:slim
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY package*.json ./
COPY .env ./
COPY prisma ./prisma/

USER root
RUN npm install -g npm@9.1.2
RUN npm install
COPY --chown=node:node . .
EXPOSE 3000

CMD [ "node", "app.js" ]