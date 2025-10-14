// Arquivo: src/Router.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ReceitaDetalhePage from './pages/ReceitaDetalhePage';
import CriarReceitaPage from './pages/CriarReceitaPage';
import RotaProtegida from './componentes_uteis/RotaProtegida';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      // Rotas Públicas
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'cadastro',
        element: <RegisterPage />,
      },
      {
        path: 'receita/:id',
        element: <ReceitaDetalhePage />,
      },
      // Estrutura para Rotas Protegidas
      {
        path: '/',
        element: <RotaProtegida />,
        children: [
          {
            path: 'criar-receita',
            element: <CriarReceitaPage />,
          },
        ],
      },
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}