#!/bin/bash

# Cores para mensagens
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Inicializando sistema UFC Ranking System${NC}"

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker não está rodando. Por favor, inicie o Docker e tente novamente.${NC}"
    exit 1
fi

# Iniciar o banco de dados PostgreSQL
echo -e "${YELLOW}📦 Iniciando banco de dados PostgreSQL...${NC}"
docker-compose up -d
echo -e "${GREEN}✅ Banco de dados PostgreSQL iniciado!${NC}"

# Executar migrações do Prisma
echo -e "${YELLOW}🔄 Aplicando migrações do Prisma...${NC}"
npx prisma migrate deploy
echo -e "${GREEN}✅ Migrações do Prisma aplicadas!${NC}"

# Iniciar backend (em segundo plano)
echo -e "${YELLOW}🚀 Iniciando backend (NestJS)...${NC}"
gnome-terminal -- npm run start:dev || xterm -e npm run start:dev || open -a Terminal.app npm run start:dev || npm run start:dev &
echo -e "${GREEN}✅ Backend iniciado na porta 3333!${NC}"

# Aguardar um pouco para o backend iniciar
sleep 3

# Iniciar frontend (em segundo plano)
echo -e "${YELLOW}🖥️ Iniciando frontend (Next.js)...${NC}"
cd ufc-ranking-front && (gnome-terminal -- npm run dev || xterm -e npm run dev || open -a Terminal.app npm run dev || npm run dev &)
echo -e "${GREEN}✅ Frontend iniciado na porta 3000!${NC}"

echo -e "${GREEN}"
echo "========================================================"
echo "🔥 Sistema UFC Ranking System inicializado com sucesso! 🔥"
echo "========================================================"
echo "📊 Frontend: http://localhost:3000"
echo "🔌 Backend: http://localhost:3333"
echo "🗄️ Banco de dados: PostgreSQL (rodando no Docker)"
echo -e "${NC}" 