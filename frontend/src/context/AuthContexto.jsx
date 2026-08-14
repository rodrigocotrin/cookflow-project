// Arquivo: src/context/AuthContexto.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

export const AuthContexto = createContext({});

export function AuthProvider({ children }) {
  const [utilizador, setUtilizador] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token');
    const utilizadorGuardado = localStorage.getItem('utilizador');

    if (tokenGuardado && utilizadorGuardado && utilizadorGuardado !== 'undefined') {
      try {
        const dadosUtilizador = JSON.parse(utilizadorGuardado);
        api.defaults.headers.Authorization = `Bearer ${tokenGuardado}`;
        setUtilizador(dadosUtilizador);
      } catch (error) {
        console.error("Dados do usuário corrompidos no localStorage, limpando...", error);
        localStorage.removeItem('token');
        localStorage.removeItem('utilizador');
      }
    }
    setLoading(false);
  }, []);

  async function login(email, senha) {
    try {
      const resposta = await api.post('/login', { email, senha });
      const { usuario, token } = resposta.data;

      localStorage.setItem('token', token);
      localStorage.setItem('utilizador', JSON.stringify(usuario));
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUtilizador(usuario);
      return { sucesso: true };
    } catch (erro) {
      console.error("Erro no login:", erro);
      const mensagem = erro.response?.data?.mensagem || 'E-mail ou senha inválidos. Tente novamente.';
      return { sucesso: false, mensagem };
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('utilizador');
    setUtilizador(null);
    delete api.defaults.headers.Authorization;
  }

  function atualizarUtilizador(novosDados) {
    setUtilizador(prev => {
      const atualizado = { ...prev, ...novosDados };
      localStorage.setItem('utilizador', JSON.stringify(atualizado));
      return atualizado;
    });
  }

  return (
    <AuthContexto.Provider value={{ 
      utilizador,
      usuario: utilizador,
      assinado: !!utilizador, 
      login, 
      logout, 
      loading,
      atualizarUtilizador 
    }}>
      {children}
    </AuthContexto.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContexto);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}