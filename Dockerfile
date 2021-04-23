FROM node:lts-alpine3.10

RUN mkdir /server

WORKDIR /server

COPY ./ ./

RUN npm install

EXPOSE 3000

CMD npm start