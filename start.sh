#!/bin/bash

echo "🚀 Iniciando processo de deploy..."

# Verificando ambiente
echo "🔍 Verificando ambiente..."
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "PATH: $PATH"
pwd
ls -la

# Verificando scripts disponíveis
echo "🔍 Scripts disponíveis no package.json:"
cat package.json | grep -A 15 '"scripts"'

# Build
echo "🔨 Executando build..."
npm run build
BUILD_EXIT=$?
if [ $BUILD_EXIT -ne 0 ]; then
  echo "❌ Falha no build. Código de saída: $BUILD_EXIT"
  exit $BUILD_EXIT
fi

# Prisma Generate
echo "🔄 Gerando cliente Prisma..."
npx prisma generate
PRISMA_GEN_EXIT=$?
if [ $PRISMA_GEN_EXIT -ne 0 ]; then
  echo "❌ Falha ao gerar cliente Prisma. Código de saída: $PRISMA_GEN_EXIT"
  exit $PRISMA_GEN_EXIT
fi

# Prisma Migrate
echo "🔄 Executando migrações do banco de dados..."
npx prisma migrate deploy
PRISMA_MIGRATE_EXIT=$?
if [ $PRISMA_MIGRATE_EXIT -ne 0 ]; then
  echo "❌ Falha nas migrações. Código de saída: $PRISMA_MIGRATE_EXIT"
  exit $PRISMA_MIGRATE_EXIT
fi

# Verificando a estrutura de arquivos dist
echo "🔍 Verificando a estrutura de arquivos compilados:"
ls -la dist/

# Iniciar a aplicação
echo "🚀 Iniciando a aplicação..."
node dist/main.js 