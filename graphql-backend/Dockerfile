FROM node:22.6.0-slim

RUN mkdir /app
WORKDIR /app

COPY . /app
RUN npm install
EXPOSE 4000

CMD [ "npm", "run", "start" ]
