FROM node:18

WORKDIR /app

# Instalar ferramentas de build necessárias
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm install

# Copiar o resto dos arquivos
COPY . .

# Gerar o cliente Prisma
RUN npx prisma generate

# Buildar a aplicação
RUN npm run build

# Comando para iniciar a aplicação
CMD ["node", "dist/main.js"] 