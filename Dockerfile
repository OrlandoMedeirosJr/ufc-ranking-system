FROM node:16 AS builder

WORKDIR /app

# Configurar npm para mostrar mais logs
RUN npm config set loglevel verbose

# Instalar ferramentas de build necessárias
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Copiar apenas os arquivos de dependência
COPY package.json package-lock.json* ./

# Instalar apenas as dependências de produção
RUN npm install --only=production --legacy-peer-deps

# Instalar devDependencies separadamente
RUN npm install --only=development --legacy-peer-deps

# Copiar o código fonte
COPY . .

# Gerar o cliente Prisma
RUN npx prisma generate

# Buildar a aplicação
RUN npm run build

# Segunda etapa: imagem limpa apenas com os arquivos necessários
FROM node:16-slim

WORKDIR /app

# Copiar apenas os arquivos necessários da etapa de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Expor a porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "dist/main.js"] 