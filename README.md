# 🏆 UFC Ranking System

Sistema completo para gerenciamento e visualização de rankings dos lutadores do UFC, com cálculo automático de pontuação baseado em resultados de lutas e diversos critérios personalizados.

## 🚀 Tecnologias

- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: Next.js App Router + Tailwind CSS + ShadCN UI
- **Infraestrutura**: Docker para bancos de dados e serviços

## 📋 Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- npm ou yarn

## 🔧 Instalação

### Opção 1: Usando Docker (recomendado)

O projeto pode ser executado inteiramente com Docker:

```bash
# Iniciar todos os serviços (banco de dados, backend e frontend)
docker-compose --env-file .env up -d

# Para parar todos os serviços
docker-compose down
```

### Opção 2: Script de inicialização automática

Execute o script para iniciar todo o sistema:

```bash
chmod +x inicializar.sh
./inicializar.sh
```

### Opção 3: Inicialização manual

1. **Inicie o banco de dados**:
   ```bash
   docker-compose up -d db
   ```

2. **Configure o backend**:
   ```bash
   npm install
   npx prisma migrate deploy
   npm run start:dev
   ```

3. **Configure o frontend**:
   ```bash
   cd ufc-ranking-front
   npm install
   npm run dev
   ```

## 🌐 Acesso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3333
- **Swagger/API Docs**: http://localhost:3333/api

## ⚙️ Variáveis de Ambiente

### Backend (.env)
```
DATABASE_URL="postgresql://postgres:123456@localhost:5432/ufcdb"
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:3333"
PORT=3333
```

### Frontend (ufc-ranking-front/.env)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3333
```

## 🔄 Fluxo de Funcionamento Básico

1. **Cadastro de Lutadores**: Adicione lutadores com suas informações básicas (nome, país, categoria, etc.)
2. **Criação de Eventos**: Crie eventos do UFC com data, local e outras informações
3. **Adição de Lutas**: Adicione lutas aos eventos, escolhendo os lutadores e categoria
4. **Resultados**: Após a realização do evento, registre os resultados de cada luta
5. **Finalização de Evento**: Ao finalizar um evento, o sistema recalcula automaticamente os rankings
6. **Visualização de Rankings**: Consulte os rankings por categoria ou o ranking peso-por-peso

O sistema calcula a pontuação dos lutadores baseado em:
- Vitórias e derrotas
- Método de vitória (nocaute, finalização, decisão)
- Round da finalização
- Lutas de título
- Bônus de performance e luta da noite
- Sequência de vitórias/derrotas

## 🗂️ Estrutura do Projeto

### Backend
- `/src`: Código fonte do backend
  - `/lutador`: Gerenciamento de lutadores
  - `/evento`: Gerenciamento de eventos
  - `/luta`: Gerenciamento de lutas
  - `/ranking`: Cálculo e gerenciamento de rankings
  - `/recorde`: Tracking de recordes do UFC
  - `/backup`: Sistema de backup de dados
  - `/prisma`: Conexão com o banco de dados
- `/prisma`: Definições de schema e migrações de banco de dados

### Frontend
- `/ufc-ranking-front`: Aplicação Next.js
  - `/src/app`: Páginas da aplicação (App Router)
  - `/src/components`: Componentes reutilizáveis
  - `/src/utils`: Funções utilitárias
  - `/src/config`: Configurações da aplicação

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## Executando com Docker

O projeto está configurado para ser executado com Docker. Para iniciar todos os serviços (backend, frontend e banco de dados):

```bash
# Construir e iniciar os containers
docker-compose up -d

# Verificar os logs
docker-compose logs -f
```

Para iniciar apenas o banco de dados:

```bash
docker-compose up -d db
```

### Variáveis de Ambiente

Copie os arquivos de exemplo para criar seus arquivos de configuração:

```bash
# Para o backend
cp .env.example .env

# Para o frontend
cp ufc-ranking-front/.env.example ufc-ranking-front/.env
```

Ajuste as variáveis conforme necessário, especialmente em ambientes de produção.

## Desenvolvimento Local
