#!/bin/bash

echo "🚀 Iniciando processo de deploy..."

# Verificando ambiente
echo "🔍 Verificando ambiente..."
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"
echo "List files: $(ls -la)"

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
mkdir -p dist
ls -la dist/
DIST_FILES=$(find dist -type f | wc -l)
echo "Total de arquivos em dist/: $DIST_FILES"

if [ $DIST_FILES -eq 0 ]; then
  echo "⚠️ Pasta dist vazia após build. Executando build novamente com parâmetros diferentes..."
  npm run build -- --copy-files
  mkdir -p dist
  ls -la dist/
fi

# Procurar o arquivo main em diferentes locais
MAIN_FILE=""
if [ -f "dist/main.js" ]; then
  MAIN_FILE="dist/main.js"
  echo "✅ Encontrado arquivo main.js"
elif [ -f "dist/main" ]; then
  MAIN_FILE="dist/main"
  echo "✅ Encontrado arquivo main sem extensão"
elif [ -f "dist/src/main.js" ]; then
  MAIN_FILE="dist/src/main.js"
  echo "✅ Encontrado arquivo main.js em dist/src"
elif [ -f "dist/src/main" ]; then
  MAIN_FILE="dist/src/main"
  echo "✅ Encontrado arquivo main sem extensão em dist/src"
else
  echo "❌ Arquivo main não encontrado. Procurando em toda a estrutura do projeto:"
  find . -name "main*"
fi

# Iniciar a aplicação
if [ -n "$MAIN_FILE" ]; then
  echo "🚀 Iniciando a aplicação com: node $MAIN_FILE"
  node $MAIN_FILE
else
  echo "❌ Arquivo main não encontrado. Tentando iniciar com o script padrão npm start:prod"
  npm run start:prod
fi 