// src/Router.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import MainLayout from './layouts/MainLayout'; // Importa nosso novo Layout
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const router = createBrowserRouter([
  {
    // A rota pai agora é o nosso layout
    path: '/',
    element: <MainLayout />,
    // As páginas se tornam "filhas" do layout
    children: [
      {
        index: true, // Isso torna a HomePage o componente padrão para a rota '/'
        element: <HomePage />,
      },
      {
        path: 'login', // O caminho é relativo à rota pai: '/login'
        element: <LoginPage />,
      },
      {
        path: 'cadastro', // O caminho é relativo: '/cadastro'
        element: <RegisterPage />,
      },
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}