FROM node:18-alpine

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar o resto dos arquivos
COPY . .

# Gerar o cliente Prisma
RUN npx prisma generate

# Buildar a aplicação
RUN npm run build

# Comando para iniciar a aplicação
CMD ["node", "dist/main.js"] 