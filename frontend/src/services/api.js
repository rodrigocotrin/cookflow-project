import axios from 'axios';

// Recupera o token do localStorage
const getAuthToken = () => {
    const dadosUtilizador = localStorage.getItem('cookflow.usuario');
    if (dadosUtilizador) {
        const { token } = JSON.parse(dadosUtilizador);
        return token;
    }
    return null;
};

const api = axios.create({
  // Em produção, usa a URL da Vercel. Localmente, usa a URL local.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

// Interceptor para adicionar o token de autenticação a cada requisição
api.interceptors.request.use(config => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;