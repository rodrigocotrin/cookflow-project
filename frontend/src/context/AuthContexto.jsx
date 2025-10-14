// src/context/AuthContexto.jsx (VERSÃO COMPLETA E CORRIGIDA)
import { createContext, useState, useEffect } from 'react';
import api from '../services/api'; // Certifique-se de que o caminho para a api está correto (ex: ../servicos/api)

// 1. CRIA O CONTEXTO (ESTA LINHA ESTAVA EM FALTA)
export const AuthContexto = createContext({});

// 2. CRIA O PROVEDOR
export function AuthProvider({ children }) {
  const [utilizador, setUtilizador] = useState(null);

  // Efeito para carregar o utilizador do localStorage quando a app inicia (APENAS UM)
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
  }, []);

  async function login(email, senha) {
    try {
      const resposta = await api.post('/login', { email, senha });
      const { usuario, token } = resposta.data; // Corrigido de 'user' para 'usuario' para corresponder ao backend

      localStorage.setItem('token', token);
      localStorage.setItem('utilizador', JSON.stringify(usuario));

      api.defaults.headers.Authorization = `Bearer ${token}`;

      setUtilizador(usuario);
      console.log("CONTEXTO: Login bem-sucedido! Estado do utilizador atualizado para:", usuario);
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
    <AuthContexto.Provider value={{ utilizador, assinado: !!utilizador, login, logout }}>
      {children}
    </AuthContexto.Provider>
  );
}