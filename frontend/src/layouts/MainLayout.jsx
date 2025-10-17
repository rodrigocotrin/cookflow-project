// Arquivo: src/layouts/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer'; // 1. Importe o Footer

export default function MainLayout() {
  return (
    // Usamos flex-col e justify-between para "empurrar" o rodapé para o fim da página
    <div className="min-h-screen bg-creme flex flex-col justify-between">
      <div>
        <Header />
        <main className="container mx-auto px-6 py-12">
          <Outlet />
        </main>
      </div>
      <Footer /> {/* 2. Adicione o Footer aqui */}
    </div>
  );
}