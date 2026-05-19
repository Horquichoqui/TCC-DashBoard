# 🚀 Guia de Deployment no Render

## ✅ Checklist Pré-Deployment

Antes de fazer deploy, execute localmente:

### 1. **Teste o Backend com NEON**

```bash
cd backend

# Copiar .env para ambiente de produção local
cp .env .env.test

# Editar .env.test para apontar para NEON (já está no .env atual)
# Verificar se DB_URL está correto

# Rodar migrations contra NEON
php artisan migrate --env=test

# Verificar logs
php artisan migrate:status
```

### 2. **Teste o Frontend Build**

```bash
cd frontend

# Build de produção
npm run build

# Verificar se dist/ foi gerado
ls -la dist/
```

### 3. **Teste o Sistema Completo Localmente**

```bash
# Terminal 1 - Backend
cd backend
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2 - Frontend (desenvolvimento)
cd frontend
npm run dev
```

Acesse: http://localhost:5173

---

## 🔧 Ambiente no Render

### Variáveis Obrigatórias

Configure estas no Render Dashboard → Enviroment Variables:

```
APP_NAME=Dashboard
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:BWskfY9YT036Qrio94ikbH83MZbC7nAiAKxgbd0vZ+g=
APP_URL=https://your-app-name.onrender.com

DB_CONNECTION=pgsql
DB_URL=postgresql://user:password@ep-xxx.aws.neon.tech/neondb?sslmode=require&channel_binding=require

LOG_CHANNEL=stack
SPONTE_ENCRYPTION_KEY="dashboard-tcc-integrador-chave-segura"
SPONTE_USE_MOCK=true
```

### ⚠️ APP_KEY Crítico!
Se não tiver um, gere um localmente:
```bash
php artisan key:generate
# Copie a saída para APP_KEY no Render
```

---

## 📋 Processo de Deployment

### Opção 1: Automático (Recomendado)

1. Faça push para `main`
2. Render detecta `render.yaml`
3. Build automático começa
4. Sistema online em 5-10 minutos

**Logs do Render:**
```
✓ Building application
✓ Fetching dependencies (composer install)
✓ Building frontend (npm run build)
✓ Running migrations
✓ Starting service
```

### Opção 2: Manual (Para Testes)

1. Acesse https://dashboard.render.com
2. Crie um novo serviço Web
3. Conecte ao seu repositório GitHub
4. Selecione branch `main`
5. Configure as variáveis de ambiente
6. Deploy

---

## 🧪 Testar Após Deploy

### 1. **Verificar Status**
```
GET https://your-app-name.onrender.com/api/me
```
Deve retornar erro 401 (não autenticado) - isso é bom!

### 2. **Fazer Login**
```
POST https://your-app-name.onrender.com/api/login
{
  "email": "admin@dashboard.com",
  "password": "password"
}
```

### 3. **Acessar Frontend**
```
https://your-app-name.onrender.com
```
Deve carregar a aplicação React

### 4. **Testar Integração Sponte**
```
Menu → Integração Sponte → Sincronizar Completa
```
Deve criar dados fictícios (modo demo)

---

## 🔐 Segurança em Produção

### ✅ O que está configurado:

- [x] `APP_DEBUG=false` (não expõe erros sensíveis)
- [x] `APP_ENV=production` (modo de produção)
- [x] HTTPS automático (Render fornece)
- [x] Tokens criptografados (AES-256-GCM)
- [x] CORS configurado
- [x] JWT (Sanctum) para autenticação
- [x] Migrations automáticas

### ⚠️ Alterar em Produção:

```env
# Depois do primeiro deploy, gere uma nova chave
SPONTE_ENCRYPTION_KEY="gere-uma-chave-aleatoria-com-32-caracteres"

# Exemplo seguro:
SPONTE_ENCRYPTION_KEY="aB7xK9mN2pQrS5tUvWxYz1CdEfGhIjKl"
```

---

## 📊 Estrutura no Render

```
Render Service
├── Build: composer + npm
│   ├── composer install
│   ├── npm install --prefix frontend
│   └── npm run build --prefix frontend
│
├── Migrations: php artisan migrate --force
│
└── Start: php artisan serve --host=0.0.0.0 --port=10000
    ├── Serve frontend estático (dist/)
    ├── Serve API REST (/api/*)
    └── Conecta ao NEON PostgreSQL
```

---

## 🚨 Troubleshooting

### ❌ "Migration failed"
```
Causa: DB_URL incorreta ou NEON offline
Solução: 
1. Verificar string de conexão NEON
2. Testar conexão localmente
3. Verificar credenciais
```

### ❌ "Cannot find module"
```
Causa: npm install falhou
Solução:
1. Verificar node_modules locally
2. Rodar npm install novamente
3. Verificar package.json
```

### ❌ "Cannot connect to database"
```
Causa: NEON inacessível do Render
Solução:
1. Verificar firewall NEON
2. Testar ping para ep-xxx.aws.neon.tech
3. Confirmar credenciais
```

### ❌ "Frontend não carrega (erro 404)"
```
Causa: dist/ não foi copiado para public/
Solução:
1. Verificar build log
2. Rodar `cp -r frontend/dist/* backend/public/`
3. Verificar .htaccess
```

---

## 📈 Monitorar em Produção

### Logs do Render
```
Dashboard → Logs → ver output
```

### Erros da Aplicação
```
Arquivo: backend/storage/logs/laravel.log
Acesso: SSH no Render
```

### Tráfego
```
Dashboard → Metrics → CPU, Memória, Requisições
```

---

## 🔄 Atualizar em Produção

1. Faça mudanças localmente
2. Teste em desenvolvimento
3. Commit e push para `main`
4. Render detecta automaticamente
5. Novo build inicia
6. Sistema atualizado

**Sem downtime!** (geralmente 2-3 min)

---

## ✨ Resultado Final

✅ **Sistema online para testes**
- Frontend em: https://your-app-name.onrender.com
- API em: https://your-app-name.onrender.com/api/
- Banco: NEON PostgreSQL
- Integração Sponte: Modo demo ativo

✅ **Pronto para defesa do TCC**
- Dados reais do NEON
- Sistema escalável
- Logs auditáveis
- Segurança em produção

---

## 📞 Próximos Passos

1. [ ] Gerar novo APP_KEY localmente
2. [ ] Testar migrations contra NEON
3. [ ] Build frontend localmente
4. [ ] Push para `main`
5. [ ] Criar serviço no Render
6. [ ] Configurar variáveis de ambiente
7. [ ] Deploy
8. [ ] Testar login e Sponte
9. [ ] Pronto para apresentar! 🎉
