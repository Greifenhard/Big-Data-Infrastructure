FROM node:slim
LABEL Maintaner="Michael"

ARG NODE_ENV=production
ENV NODE_ENV ${NODE_ENV}

WORKDIR /app

COPY . .

RUN npm i && npm cache clean --force

EXPOSE 5001

CMD ["npm","start"]

