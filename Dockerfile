FROM node:18-bullseye

WORKDIR /app

# Verificar comandos disponíveis
RUN node --version && npm --version

# Copiar arquivos do projeto
COPY . .

# Instalar dependências
RUN npm install

# Gerar o cliente Prisma
RUN npx prisma generate

# Buildar a aplicação
RUN npm run build

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Expor a porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "dist/main.js"] 