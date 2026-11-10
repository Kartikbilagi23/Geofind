FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN DIRECT_URL="postgresql://user:password@localhost:5432/geofind?schema=public" npx prisma generate

EXPOSE 4002 4003

CMD ["npm", "start"]