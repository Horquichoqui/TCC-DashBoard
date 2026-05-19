# ✅ Laravel + React no Render - Configuração Correta

## 🎯 O que você tem agora (Correto!):

```
backend/          ← Laravel (PHP)
  ├── app/
  ├── routes/
  ├── database/migrations/
  └── composer.json

frontend/         ← React (Node.js)
  ├── src/
  ├── vite.config.js
  └── package.json
```

---

## 🔧 Para funcionar no Render, você precisa de:

### **1️⃣ Procfile** (OBRIGATÓRIO)
```
web: composer install --prefer-dist --no-dev && npm install --prefix frontend && npm run build --prefix frontend && cp -r frontend/dist/* backend/public/ && php artisan config:cache && php artisan route:cache && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=10000
```

**O que faz:**
- ✅ Instala dependências PHP (composer)
- ✅ Instala dependências Node.js (npm)
- ✅ Build do React → `dist/`
- ✅ Copia React build para Laravel `public/`
- ✅ Roda migrations
- ✅ Inicia servidor Laravel

### **2️⃣ runtime.txt** (RECOMENDADO)
```
php-8.2
nodejs-20
```

**O que faz:**
- ✅ Especifica versões do PHP e Node.js
- ✅ Render sabe usar ambos

### **3️⃣ .gitignore** (CRÍTICO)
```
backend/.env
backend/.env.production
backend/.env.local
backend/vendor/
backend/storage/
backend/bootstrap/cache/

frontend/node_modules/
frontend/dist/

.DS_Store
```

**O que faz:**
- ✅ Não commita credenciais
- ✅ Não commita dependências (npm/composer reinstalam no Render)

### **4️⃣ vite.config.js** (Frontend)
```javascript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
```

**O que faz:**
- ✅ Build output → `dist/`
- ✅ API proxy para Laravel

### **5️⃣ .htaccess** (Backend)
```
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

**O que faz:**
- ✅ Redireciona URLs para Laravel (SPA React Router)

### **6️⃣ Variáveis no Render Dashboard**

```
APP_NAME=Dashboard
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:... (gere com php artisan key:generate)

DB_CONNECTION=pgsql
DB_URL=postgresql://user:pass@ep-xxx.aws.neon.tech/db?sslmode=require&channel_binding=require

SPONTE_ENCRYPTION_KEY=sua-chave-secreta
SPONTE_USE_MOCK=true
```

---

## 📊 Fluxo de Deployment:

```
Git Push (main)
    ↓
Render detecta mudanças
    ↓
Render lê Procfile
    ↓
Composer install (PHP)
    ↓
NPM install (Node.js)
    ↓
React Build (vite)
    ↓
Copia dist/ → backend/public/
    ↓
Roda migrations
    ↓
Inicia Laravel Server (porta 10000)
    ↓
Sistema Online! ✅
```

---

## ✨ Resultado:

```
https://seu-app.onrender.com
├── Frontend React (dist/)
├── API REST (/api/*)
├── Banco NEON
└── Tudo em um serviço PHP!
```

---

## 🚀 Checklist Final:

- [ ] Procfile criado ✅
- [ ] runtime.txt criado ✅
- [ ] .gitignore configurado ✅
- [ ] vite.config.js correto ✅
- [ ] .htaccess em backend/public/ ✅
- [ ] Commits no git
- [ ] Deletar serviço antigo no Render
- [ ] Criar novo serviço (vai ler Procfile)
- [ ] Adicionar variáveis de ambiente
- [ ] Deploy!

---

## ⚠️ NÃO fazer:

❌ Não commitar `backend/vendor/`
❌ Não commitar `frontend/node_modules/`
❌ Não commitar `backend/.env` ou `backend/.env.production`
❌ Não usar `npm install` para backend (é composer!)
❌ Não usar `npm start` (é `php artisan serve`!)

---

## ✅ RESUMO RÁPIDO:

Para Laravel + React funcionar no Render:
1. **Procfile** (define build e start)
2. **runtime.txt** (especifica versões)
3. **.gitignore** (não commita sensível)
4. **vite.config.js** (build React)
5. **.htaccess** (SPA routing)
6. **Variáveis de Ambiente** (no Render)

**É isso! Simples assim! 🎉**
