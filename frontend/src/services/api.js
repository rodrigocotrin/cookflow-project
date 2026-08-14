// Arquivo: frontend/src/services/api.js
import axios from 'axios';

// Determina a URL base da API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Recupera o token do localStorage de forma segura (suporta ambas as convenções)
export const getAuthToken = () => {
    try {
        const tokenDireto = localStorage.getItem('token');
        if (tokenDireto) return tokenDireto;

        const dadosUtilizador = localStorage.getItem('cookflow.usuario') || localStorage.getItem('utilizador');
        if (dadosUtilizador) {
            const parsed = JSON.parse(dadosUtilizador);
            if (typeof parsed === 'object' && parsed.token) {
                return parsed.token;
            }
        }
    } catch (error) {
        console.error("Erro ao recuperar token do localStorage:", error);
    }
    return null;
};

// Helper universal para resolver URLs de imagens (locais do upload ou remotas)
export const resolverUrlImagem = (url) => {
    if (!url) {
        return 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80';
    }
    if (url.startsWith('/uploads/')) {
        return `${API_BASE_URL}${url}`;
    }
    return url;
};

// Cria a instância do Axios
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
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

// Interceptor de resposta para tratar token expirado/inválido
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // Se a requisição retornou 401 e não é a tela de login
            const isAuthRoute = window.location.pathname.includes('/login') || window.location.pathname.includes('/cadastro');
            if (!isAuthRoute && localStorage.getItem('token')) {
                console.warn('Sessão expirada. Limpando credenciais...');
                localStorage.removeItem('token');
                localStorage.removeItem('utilizador');
                localStorage.removeItem('cookflow.usuario');
            }
        }
        return Promise.reject(error);
    }
);

export default api;