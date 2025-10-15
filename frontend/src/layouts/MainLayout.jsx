// Arquivo: src/layouts/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-creme">
      <Header />
      <main className="container mx-auto px-6 py-12"> {/* Aumentámos o padding vertical (py-12) */}
        <Outlet />
      </main>
    </div>
  );
}