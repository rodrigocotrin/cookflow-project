// src/context/AuthContexto.jsx
import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

// Cria o Contexto
export const AuthContexto = createContext({});

// Cria o Componente Provedor
export function AuthProvider({ children }) {
  const [utilizador, setUtilizador] = useState(null);

  // Efeito para carregar o utilizador do localStorage quando a app inicia
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token');
    const utilizadorGuardado = localStorage.getItem('utilizador');

    if (tokenGuardado && utilizadorGuardado) {
      api.defaults.headers.Authorization = `Bearer ${tokenGuardado}`;
      setUtilizador(JSON.parse(utilizadorGuardado));
    }
  }, []);

  async function login(email, senha) {
    try {
      const resposta = await api.post('/login', { email, senha });
      const { user, token } = resposta.data;

      // Guarda o token e os dados do utilizador no localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('utilizador', JSON.stringify(user));

      // Define o cabeçalho de autorização para todas as futuras requisições do axios
      api.defaults.headers.Authorization = `Bearer ${token}`;

      setUtilizador(user);
      return true; // Indica sucesso
    } catch (erro) {
      console.error("Erro no login:", erro);
      return false; // Indica falha
    }
  }

  function logout() {
    // Remove os dados do localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('utilizador');

    // Limpa o estado e o cabeçalho do axios
    setUtilizador(null);
    api.defaults.headers.Authorization = null;
  }

  return (
    <AuthContexto.Provider value={{ utilizador, assinado: !!utilizador, login, logout }}>
      {children}
    </AuthContexto.Provider>
  );
}