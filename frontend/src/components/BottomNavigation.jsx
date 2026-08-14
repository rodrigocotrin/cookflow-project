// Arquivo: frontend/src/components/BottomNavigation.jsx
import { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContexto } from '../context/AuthContexto';

export default function BottomNavigation() {
  const { assinado } = useContext(AuthContexto);
  const location = useLocation();

  // Não renderizar a barra inferior em páginas de login e cadastro
  if (location.pathname === '/login' || location.pathname === '/cadastro' || location.pathname === '/recuperar-senha') {
    return null;
  }

  const linkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center flex-1 py-2 px-1 text-xs font-semibold transition-all duration-200 ${
      isActive
        ? 'text-terracota-500 font-bold scale-105'
        : 'text-cinza-ardosia hover:text-verde-floresta'
    }`;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-creme-50/95 backdrop-blur-lg border-t border-terracota-500/15 shadow-[0_-4px_20px_rgba(47,79,79,0.06)] safe-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-2">
        {/* 1. Início */}
        <NavLink to="/" end className={linkClass}>
          {({ isActive }) => (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Início</span>
            </>
          )}
        </NavLink>

        {/* 2. Buscar */}
        <NavLink to="/buscar" className={linkClass}>
          {({ isActive }) => (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Buscar</span>
            </>
          )}
        </NavLink>

        {/* 3. Criar Receita (Destaque Central) */}
        <NavLink to="/criar-receita" className="flex flex-col items-center justify-center -mt-5 flex-1 group">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-terracota-600 to-terracota-500 text-white flex items-center justify-center shadow-lg shadow-terracota-500/40 group-hover:scale-110 group-active:scale-95 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-[11px] font-bold text-terracota-600 mt-1">Criar</span>
        </NavLink>

        {/* 4. Carrinho Inteligente / Planejador */}
        <NavLink to="/planejador" className={linkClass}>
          {({ isActive }) => (
            <>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span>Compras</span>
            </>
          )}
        </NavLink>

        {/* 5. Perfil / Login */}
        <NavLink to={assinado ? "/perfil" : "/login"} className={linkClass}>
          {({ isActive }) => (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{assinado ? 'Perfil' : 'Entrar'}</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
