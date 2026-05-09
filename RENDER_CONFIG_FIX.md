# 🔧 Como Corrigir o Build do Frontend no Render

## 📝 Problema
O Render está usando `yarn` como build command (configuração anterior), mas precisa usar os novos comandos.

## ✅ Solução - Atualizar Web Service no Render Dashboard

### Passo 1: Acesse o Render Dashboard
1. Vá para https://dashboard.render.com
2. Selecione seu projeto **tcc-dashboard-frontend**

### Passo 2: Edite as Configurações

#### **Build Command**
Mude de: `yarn`
Para: 
```bash
npm install --legacy-peer-deps && npm run build
```

#### **Start Command**
Mude de: `yarn start`
Para:
```bash
node server.js
```

### Passo 3: Environment Variables

Verifique se existem essas variáveis:

| Chave | Valor |
|-------|-------|
| `NODE_ENV` | `development` |
| `VITE_API_URL` | `https://tcc-dashboard-backend.onrender.com/api` |

Se não existem, adicione-as.

### Passo 4: Salve e Redeploy

1. Clique em "Save" (se houver mudanças)
2. Clique em "Manual Deploy" → "Trigger Deploy"
3. Aguarde o build completar

---

## 📋 Checklist

- [ ] Build Command atualizado para `npm install --legacy-peer-deps && npm run build`
- [ ] Start Command atualizado para `node server.js`
- [ ] `NODE_ENV` = `development`
- [ ] `VITE_API_URL` configurado
- [ ] Deploy acionado manualmente
- [ ] Aguardando resultado (deve aparecer "Live" ✅)

---

## 🎯 Resultado Esperado

Após fazer as mudanças, o build deve:
```
1. ✅ npm install --legacy-peer-deps
2. ✅ npm run build (com Vite)
3. ✅ node server.js (servidor rodando)
4. ✅ Frontend Live em https://tcc-dashboard-frontend.onrender.com
```

---

## ❌ Se ainda não funcionar

Se vir erro `vite: not found` novamente:

1. Verifique se `NODE_ENV` está como `development` (NÃO `production`)
2. Verifique se `--legacy-peer-deps` está no Build Command
3. Verifique se Start Command é `node server.js` (não `yarn start`)
4. Tente "Clear Build Cache" no Render Dashboard antes de redeploy

---

## 📚 Arquivos Atualizados

- ✅ `render.yaml` - Configuração na raiz (contém ambos: backend + frontend)
- ✅ `frontend/package.json` - Scripts atualizados
- ✅ `frontend/.npmrc` - Legacy peer deps
- ✅ `frontend/.env.production` - Variáveis de produção

Tudo pronto! Só precisa fazer a atualização manual no Render Dashboard.
