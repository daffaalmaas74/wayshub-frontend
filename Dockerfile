FROM node:14-alpine

WORKDIR /app

COPY . .

RUN npm install

RUN npm install -g pm2

EXPOSE 3000

CMD ["pm2-runtime", "start", "ecosystem.config.js"]
