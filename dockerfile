FROM --platform=linux/amd64 node:20-slim

RUN apt-get update && apt-get install -y curl

# install openssl
RUN apt-get install -y openssl


WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --force

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]