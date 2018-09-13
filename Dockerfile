FROM node:10

ENV NODE_ENV=production

ADD . /app
WORKDIR /app

RUN npm ci

CMD ["npm", "start"]
