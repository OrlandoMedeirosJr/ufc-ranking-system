FROM node:18-bullseye

WORKDIR /app

# Verificar comandos disponíveis e ambiente
RUN node --version && npm --version

# Copiar apenas os arquivos de dependência primeiro
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci

# Gerar o cliente Prisma
RUN npx prisma generate

# Copiar o resto dos arquivos
COPY . .

# Buildar a aplicação
RUN npm run build

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Expor a porta
EXPOSE 3000

# Healthcheck para verificar se a aplicação está respondendo
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
  CMD curl -f http://localhost:3000/health || exit 1

# Comando para iniciar a aplicação
CMD ["npm", "run", "start:prod"] 