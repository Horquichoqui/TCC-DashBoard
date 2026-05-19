#!/bin/bash

set -e

echo "🚀 Setup Automático - TCC Dashboard com Integração Sponte"
echo "=========================================================="
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend Setup
echo -e "${BLUE}📦 Configurando Backend (Laravel)...${NC}"

cd backend

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}→ Criando arquivo .env local...${NC}"
    cp .env.local .env
fi

echo -e "${YELLOW}→ Instalando dependências Composer...${NC}"
if ! command -v composer &> /dev/null; then
    echo -e "${YELLOW}  Composer não encontrado. Use: composer install${NC}"
else
    composer install --prefer-dist --no-progress --no-interaction 2>/dev/null || echo "  ℹ️  Pulando composer install"
fi

echo -e "${YELLOW}→ Criando banco de dados SQLite...${NC}"
mkdir -p database
touch database/database.sqlite

echo -e "${YELLOW}→ Rodando migrations...${NC}"
php artisan migrate:fresh --seed --force --env=local 2>/dev/null || echo "  ℹ️  Migrations já rodadas"

cd ..

# Frontend Setup
echo ""
echo -e "${BLUE}⚛️  Configurando Frontend (React)...${NC}"

cd frontend

echo -e "${YELLOW}→ Instalando dependências npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não encontrado. Instale Node.js primeiro${NC}"
    exit 1
fi

npm install --silent 2>/dev/null || true

cd ..

# Summary
echo ""
echo -e "${GREEN}✅ Setup concluído com sucesso!${NC}"
echo ""
echo -e "${BLUE}📋 Próximos passos:${NC}"
echo ""
echo "1️⃣  Terminal 1 - Iniciar Backend:"
echo -e "   ${YELLOW}cd backend && php artisan serve${NC}"
echo ""
echo "2️⃣  Terminal 2 - Iniciar Frontend:"
echo -e "   ${YELLOW}cd frontend && npm run dev${NC}"
echo ""
echo "3️⃣  Acesse: http://localhost:5173"
echo ""
echo -e "${BLUE}🔐 Usuários de Teste:${NC}"
echo "   Admin: admin@dashboard.com / password"
echo "   Professor: professor@dashboard.com / password"
echo ""
echo -e "${BLUE}🔌 Integração Sponte:${NC}"
echo "   Menu → Integração Sponte"
echo "   Modo Demonstração ativa por padrão"
echo "   Insira credenciais Sponte para modo real"
echo ""
echo -e "${GREEN}Leia SETUP_LOCAL.md para mais detalhes${NC}"
echo ""
