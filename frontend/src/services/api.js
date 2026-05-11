// Configuração do Axios para chamadas à API
// Em desenvolvimento: usa VITE_API_URL=http://localhost:3000/api
// Em produção no Render: usa /api (mesma origem, sem CORS)
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Interceptor: adiciona o token JWT em todas as requisições autenticadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: redireciona para login se o token expirar (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
