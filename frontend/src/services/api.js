// Arquivo: frontend/src/services/api.js (VERSÃO CORRIGIDA E FINAL)
import axios from 'axios';

// Recupera o token do localStorage de forma segura
const getAuthToken = () => {
    try {
        const dadosUtilizador = localStorage.getItem('cookflow.usuario');
        if (dadosUtilizador) {
            const { token } = JSON.parse(dadosUtilizador);
            return token;
        }
    } catch (error) {
        console.error("Erro ao parsear dados do utilizador do localStorage:", error);
    }
    return null;
};

// Cria a instância do Axios.
// A URL base da API é lida da variável de ambiente VITE_API_URL.
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

// Interceptor para adicionar o token de autenticação a cada requisição
api.interceptors.request.use(config => {
    const token = getAuthToken();
    if (token) {
        // Adiciona o cabeçalho de autorização padrão para JWT
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    // Passa o erro de requisição para frente
    return Promise.reject(error);
});

export default api;