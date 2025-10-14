// Arquivo: src/componentes_uteis/RotaProtegida.jsx
import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContexto } from '../context/AuthContexto'; // Verifique se o caminho para o seu contexto está correto

export default function RotaProtegida() {
  const { assinado, loading } = useContext(AuthContexto);

  // Se ainda estiver a verificar o estado de login, mostra uma mensagem de carregamento
  if (loading) {
    return <div>A carregar...</div>;
  }

  // Se não estiver assinado, redireciona para a página de login
  if (!assinado) {
    return <Navigate to="/login" replace />;
  }

  // Se estiver assinado, renderiza o conteúdo da rota filha (a página protegida)
  return <Outlet />;
}