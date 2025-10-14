// Arquivo: src/Router.jsx (CÓDIGO COMPLETO)
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
import RotaProtegida from './componentes_uteis/RotaProtegida';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'cadastro', element: <RegisterPage /> },
      { path: 'receita/:id', element: <ReceitaDetalhePage /> },
      {
        path: '/',
        element: <RotaProtegida />,
        children: [
          { path: 'criar-receita', element: <CriarReceitaPage /> },
          { path: 'editar-receita/:id', element: <EditarReceitaPage /> }, 
          { path: 'perfil', element: <PerfilPage /> },
          { path: 'planejador', element: <PlanejadorPage /> },
        ],
      },
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}