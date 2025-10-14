// Arquivo: src/context/AuthContexto.jsx
import { createContext, useState, useEffect } from 'react';
import api from '../services/api'; // Verifique se o caminho está correto

export const AuthContexto = createContext({});

export function AuthProvider({ children }) {
  const [utilizador, setUtilizador] = useState(null);
  const [loading, setLoading] = useState(true); // NOVO ESTADO

  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token');
    const utilizadorGuardado = localStorage.getItem('utilizador');

    if (tokenGuardado && utilizadorGuardado && utilizadorGuardado !== 'undefined') {
      try {
        const dadosUtilizador = JSON.parse(utilizadorGuardado);
        api.defaults.headers.Authorization = `Bearer ${tokenGuardado}`;
        setUtilizador(dadosUtilizador);
      } catch (error) {
        console.error("Dados do utilizador corrompidos no localStorage, limpando...", error);
        localStorage.removeItem('token');
        localStorage.removeItem('utilizador');
      }
    }
    setLoading(false); // ATUALIZAÇÃO: Define o loading como falso no final
  }, []);

  async function login(email, senha) {
    try {
      const resposta = await api.post('/login', { email, senha });
      const { usuario, token } = resposta.data;

      localStorage.setItem('token', token);
      localStorage.setItem('utilizador', JSON.stringify(usuario));
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUtilizador(usuario);
      return true;
    } catch (erro) {
      console.error("Erro no login:", erro);
      return false;
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('utilizador');
    setUtilizador(null);
    api.defaults.headers.Authorization = null;
  }

  return (
    <AuthContexto.Provider value={{ utilizador, assinado: !!utilizador, login, logout, loading }}> {/* ATUALIZAÇÃO: Adiciona 'loading' */}
      {children}
    </AuthContexto.Provider>
  );
}