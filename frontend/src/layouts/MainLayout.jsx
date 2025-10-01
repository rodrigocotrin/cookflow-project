// src/layouts/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <Outlet /> {/* Nossas páginas (HomePage, LoginPage) serão renderizadas aqui */}
      </main>
    </div>
  );
}