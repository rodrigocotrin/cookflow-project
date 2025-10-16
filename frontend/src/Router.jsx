// src/Router.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ReceitaDetalhePage from './pages/ReceitaDetalhePage';
import CriarReceitaPage from './pages/CriarReceitaPage';
import PerfilPage from './pages/PerfilPage';
import PlanejadorPage from './pages/PlanejadorPage';
import EditarReceitaPage from './pages/EditarReceitaPage';
import PaginaBusca from './pages/PaginaBusca';
import RotaProtegida from './componentes_uteis/RotaProtegida';

const router = createBrowserRouter([
  // Layout Principal para a maioria das páginas
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'receita/:id', element: <ReceitaDetalhePage /> },
      { path: 'buscar', element: <PaginaBusca /> },
      {
        element: <RotaProtegida />,
        children: [
          { path: 'criar-receita', element: <CriarReceitaPage /> },
          { path: 'receita/:id/editar', element: <EditarReceitaPage /> },
          { path: 'perfil', element: <PerfilPage /> },
          { path: 'planejador', element: <PlanejadorPage /> },
        ],
      },
    ],
  },
  // --- ROTAS DE TELA CHEIA (SEM LAYOUT PRINCIPAL) ---
  {
    path: 'login', // Rota de Login agora fora do MainLayout
    element: <LoginPage />,
  },
  {
    path: 'cadastro', // Rota de Cadastro também fora para consistência
    element: <RegisterPage />,
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}