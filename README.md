# UFC Ranking System

Sistema para visualização e manutenção de rankings dos lutadores da UFC, com funcionalidades para categorizar lutadores por categoria de peso e criar rankings personalizados.

## 🚀 Tecnologias

- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: Next.js + Tailwind CSS
- **Infraestrutura**: Docker para bancos de dados

## 📋 Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- npm ou yarn

## 🔧 Instalação

### Opção 1: Script de inicialização automática

Execute o script para iniciar todo o sistema:

```bash
chmod +x inicializar.sh
./inicializar.sh
```

### Opção 2: Inicialização manual

1. **Inicie o banco de dados**:
   ```bash
   docker-compose up -d
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

## 🗂️ Estrutura do Projeto

### Backend
- `/src`: Código fonte do backend
  - `/lutador`: Gerenciamento de lutadores
  - `/evento`: Gerenciamento de eventos
  - `/ranking`: Gerenciamento de rankings
- `/prisma`: Definições de schema e migrações de banco de dados

### Frontend
- `/ufc-ranking-front`: Aplicação Next.js
  - `/pages`: Páginas da aplicação
  - `/components`: Componentes reutilizáveis
  - `/services`: Serviços para comunicação com API

## 📊 Principais funcionalidades

- Cadastro e visualização de lutadores
- Cadastro e visualização de eventos
- Gestão de rankings por categoria de peso
- Visualização de estatísticas e métricas dos lutadores

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request
