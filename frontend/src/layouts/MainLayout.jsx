// Arquivo: src/layouts/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNavigation from '../components/BottomNavigation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-creme flex flex-col justify-between selection:bg-terracota-500 selection:text-white">
      <div className="flex-grow flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24 md:pb-12 animate-fade-in">
          <Outlet />
        </main>
      </div>
      
      <Footer />
      <BottomNavigation />

      {/* Container global de Notificações Toast */}
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="!rounded-2xl !shadow-card !font-sans"
      />
    </div>
  );
}