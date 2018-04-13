FROM node:8-alpine

ENV NODE_ENV=production

ADD . /app
WORKDIR /app

RUN npm i

CMD ["npm", "start"]
