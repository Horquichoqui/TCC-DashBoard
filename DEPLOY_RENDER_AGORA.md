# 🚀 DEPLOY RENDER - GUIA RÁPIDO

## 1️⃣ Criar Serviço no Render

**URL:** https://dashboard.render.com

1. Clique **"New"** → **"Web Service"**
2. Conecte seu GitHub (selecione `Horquichoqui/TCC-DashBoard`)
3. Selecione branch: **`main`**
4. Configure:
   - **Name:** `tcc-dashboard-backend`
   - **Environment:** `Docker` (Render vai usar render.yaml)
   - **Plan:** Free (gratuito)

---

## 2️⃣ Adicionar Variáveis de Ambiente

No Render Dashboard → Environment:

```
APP_NAME=Dashboard
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:BWskfY9YT036Qrio94ikbH83MZbC7nAiAKxgbd0vZ+g=
APP_URL=https://tcc-dashboard-backend.onrender.com
DB_CONNECTION=pgsql
DB_URL=postgresql://neondb_owner:npg_VvXhG1akp7Zd@ep-proud-heart-acvmtl8f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
LOG_CHANNEL=stack
SPONTE_ENCRYPTION_KEY=dashboard-tcc-integrador-chave-segura
SPONTE_USE_MOCK=true
```

**Copie e cole exatamente isso ☝️**

---

## 3️⃣ Deploy

Clique **"Deploy"** e pronto!

---

## 4️⃣ Monitorar Deployment

Render vai:
1. ✅ Clonar repositório
2. ✅ Instalar `composer` (backend)
3. ✅ Instalar `npm` (frontend)
4. ✅ Build React → gera `dist/`
5. ✅ Copia `dist/` para `backend/public/`
6. ✅ Roda `php artisan migrate --force`
7. ✅ Inicia servidor Laravel

**Tempo estimado:** 5-10 minutos

Veja os logs em tempo real no Render Dashboard.

---

## 5️⃣ Testar Sistema Online

Quando deployment terminar:

### Login
```
URL: https://tcc-dashboard-backend.onrender.com
Email: admin@dashboard.com
Senha: password
```

### Testar Integração Sponte
Menu → Integração Sponte → Sincronizar Completa

Deve aparecer:
- ✅ 3 turmas fictícias
- ✅ 3 alunos
- ✅ Notas e frequência
- ✅ Logs de sincronização

---

## ⚠️ Se der erro:

### "Cannot find DB_URL"
- Verifique variáveis de ambiente no Render
- Confirme que DB_URL foi adicionada

### "Migration failed"
- Clique em "Redeploy" 
- Se persistir, NEON pode estar indisponível

### "Cannot find module"
- Erro de build Node.js
- Clique "Redeploy"

### "404 no frontend"
- Espere 5 min
- Limpe cache do navegador (Ctrl+Shift+Del)
- Recarregue

---

## ✅ Pronto!

Sistema online para defesa do TCC! 🎉

**URL:** https://tcc-dashboard-backend.onrender.com
- Frontend ✅
- API REST ✅
- Banco NEON ✅
- Integração Sponte ✅
