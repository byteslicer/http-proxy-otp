FROM node:8

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run generate

COPY config.js.docker config.js

EXPOSE 8080
CMD [ "sh", "-c", "node server/exportQrCode.js && npm start" ]
