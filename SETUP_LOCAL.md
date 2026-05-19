# Setup Local - TCC Dashboard

## Guia Rápido para Apresentação

### 1. **Backend Setup** (Laravel + Sponte Integration)

```bash
cd backend

# Instalar dependências
composer install

# Copiar arquivo local de ambiente
cp .env.local .env

# Criar banco de dados SQLite
touch database/database.sqlite

# Rodar migrations
php artisan migrate:fresh --seed

# Iniciar servidor Laravel (porta 8000)
php artisan serve
```

**Usuários de Teste:**
- **Admin:** admin@dashboard.com / password
- **Professor:** professor@dashboard.com / password

### 2. **Frontend Setup** (React + Vite)

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar servidor dev (porta 5173)
npm run dev
```

### 3. **Acesso ao Sistema**

- **URL:** http://localhost:5173
- **Menu → Integração Sponte**

### 4. **Modo Demonstração (Padrão)**

Sem inserir credenciais:
- ✅ Mostra dados fictícios (3 turmas, 3 alunos, notas, frequência)
- ✅ Botões de sincronização simulam operações
- ✅ Logs aparecem normalmente

### 5. **Modo Real (Quando Cliente Inserir Credenciais)**

Para ativar modo real:
1. Clique em **"Integração Sponte"** no menu
2. **Desabilite** o checkbox "Modo Demonstração"
3. Insira o **CodigoCliente** do Sponte
4. Insira o **Token** de acesso
5. Clique **"Salvar Configuração"**
6. Clique **"Testar Conexão"** para validar
7. Clique **"Sincronizar Completa"** para buscar dados reais

Após inserir credenciais reais, o sistema automaticamente:
- 🔐 Criptografa o token com AES-256-GCM
- 🔄 Muda do modo demonstração para modo real
- 📊 Sincroniza dados reais do Sponte
- 📋 Registra todas as operações em logs

### 6. **Estrutura do Módulo Sponte**

**Backend (Laravel):**
- `app/Http/Controllers/SponteController.php` - 8 endpoints
- `app/Services/SponteClientService.php` - Comunicação SOAP
- `app/Services/SponteSyncService.php` - Sincronização
- `app/Utils/CryptoUtil.php` - Criptografia

**Frontend (React):**
- `src/pages/IntegracaoSponte.jsx` - Página principal
- `src/services/sponteApi.js` - Chamadas API
- `src/components/SponteStatusCard.jsx` - Status da integração
- `src/components/SponteSyncLogTable.jsx` - Histórico de logs

### 7. **Dados de Demonstração**

**Turmas (Demo):**
- TUR001 - Turma A (20 alunos)
- TUR002 - Turma B (18 alunos)
- TUR003 - Turma C (22 alunos)

**Alunos (Demo):**
- ALU001 - João Silva (Turma A)
- ALU002 - Maria Santos (Turma B)
- ALU003 - Pedro Oliveira (Turma C)

Cada aluno tem:
- 4 notas (Nota1-Nota4) em 4 períodos/disciplinas
- Frequência percentual (0-100%)

### 8. **Segurança Implementada**

✅ Tokens criptografados com AES-256-GCM
✅ Credenciais nunca expostas no frontend
✅ Validação de entrada em todos endpoints
✅ CORS configurado
✅ Middleware de autenticação (Sanctum JWT)
✅ Log de todas as operações

### 9. **Roteiro para TCC**

1. **Tela de Login** - Mostrar autenticação com 2 perfis
2. **Dashboard** - Resumo visual dos alunos
3. **Gerenciamento de Alunos** - CRUD e detalhes
4. **Frequência e Notas** - Lançamento e histórico
5. **Integração Sponte** ⭐ **← DESTAQUE PRINCIPAL**
   - Modo demonstração (sem credenciais)
   - Modo real (com credenciais)
   - Sincronização de dados
   - Logs detalhados

---

## Troubleshooting

**Erro de conexão ao iniciar Laravel?**
- Verifique se porta 8000 está livre
- Use `php artisan serve --port=8001` para mudar porta

**Erro ao rodar migrations?**
- Confirme que `database/database.sqlite` existe
- Delete e recrie: `rm database/database.sqlite && touch database/database.sqlite`

**Frontend não conecta ao backend?**
- Verifique se ambos servidores estão rodando
- Confirme URL da API em `frontend/src/services/api.js`
- Padrão: `http://localhost:8000/api`

---

**Pronto para apresentar! 🎉**
