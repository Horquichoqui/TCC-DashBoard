const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Proxy para Laravel API
app.use(
  '/api',
  createProxyMiddleware({
    target: process.env.LARAVEL_URL || 'http://localhost:8000',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '/api',
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(500).json({ error: 'API unavailable' });
    },
  })
);

// SPA fallback - redireciona para index.html para React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Dashboard rodando em http://0.0.0.0:${PORT}`);
  console.log(`📱 Frontend: Servindo arquivos estáticos`);
  console.log(`🔌 API: Proxy para ${process.env.LARAVEL_URL || 'http://localhost:8000'}`);
});
