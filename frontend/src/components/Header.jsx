// Arquivo: src/components/Header.jsx
import { useState, useContext } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { AuthContexto } from '../context/AuthContexto';
import BarraBusca from './BarraBusca';

export default function Header() {
  const { assinado, utilizador, logout } = useContext(AuthContexto);
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');

  const handleLogout = () => {
    logout();
    setMenuAberto(false);
    navigate('/login');
  };

  const fecharMenu = () => {
    setMenuAberto(false);
    setTermoBusca('');
  };

  const handleBuscaMobile = (e) => {
    e.preventDefault();
    if (termoBusca.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(termoBusca.trim())}`);
      fecharMenu();
    }
  };

  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 ${
      isActive
        ? 'bg-terracota-500 text-white shadow-md shadow-terracota-500/25'
        : 'text-verde-floresta hover:text-terracota-600 hover:bg-terracota-50/60'
    }`;

  const inicial = utilizador?.nome ? utilizador.nome.charAt(0).toUpperCase() : 'U';

  return (
    <header className="glass-header sticky top-0 z-40 border-b border-terracota-500/10 transition-all">
      <div className="container mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center gap-4">
        
        {/* Logo CookFlow */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0" onClick={fecharMenu}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-terracota-600 to-terracota-500 flex items-center justify-center text-white shadow-md shadow-terracota-500/30 group-hover:scale-105 transition-transform duration-200">
            <span className="text-xl">🍳</span>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-verde-floresta font-heading tracking-tight group-hover:text-terracota-600 transition-colors">
              Cook<span className="text-terracota-500">Flow</span>
            </span>
            <span className="hidden sm:block text-[10px] font-semibold text-cinza-ardosia tracking-widest uppercase -mt-1">
              Receitas & Mercado
            </span>
          </div>
        </Link>

        {/* Barra de busca para Desktop */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <BarraBusca />
        </div>

        {/* Navegação Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {assinado ? (
            <>
              <NavLink to="/planejador" className={navLinkClass}>
                <div className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Carrinho Inteligente</span>
                </div>
              </NavLink>

              <NavLink to="/criar-receita" className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Criar Receita</span>
              </NavLink>

              <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
                <Link
                  to="/perfil"
                  title="Meu Perfil"
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-verde-floresta to-verde-floresta/80 text-white font-bold flex items-center justify-center text-sm shadow-sm hover:ring-2 hover:ring-terracota-500 transition-all"
                >
                  {inicial}
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sair da Conta"
                  className="p-2 text-cinza-ardosia hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="font-bold text-verde-floresta hover:text-terracota-500 px-4 py-2 text-sm transition-colors"
              >
                Entrar
              </Link>
              <Link
                to="/cadastro"
                className="btn-primary py-2 px-5 text-sm"
              >
                Cadastre-se Grátis
              </Link>
            </div>
          )}
        </div>

        {/* Botão Mobile para Abrir Busca ou Menu */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/buscar"
            className="p-2 text-verde-floresta bg-white/80 rounded-xl border border-zinc-200/80 shadow-sm"
            title="Buscar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="p-2 text-verde-floresta bg-white/80 rounded-xl border border-zinc-200/80 shadow-sm"
            aria-label="Abrir Menu"
          >
            {menuAberto ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* --- MENU MOBILE DRAWER MODERNO --- */}
      {menuAberto && (
        <div className="md:hidden fixed inset-0 top-[65px] bg-black/40 backdrop-blur-sm z-50 animate-fade-in" onClick={fecharMenu}>
          <div
            className="absolute top-0 right-0 w-4/5 max-w-sm h-full bg-creme-50 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Barra de busca mobile */}
              <form onSubmit={handleBuscaMobile} className="relative flex w-full">
                <input
                  type="text"
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  placeholder="Procure receitas ou ingredientes..."
                  className="w-full pl-4 pr-11 py-3 text-verde-floresta bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracota-500/50 shadow-sm"
                />
                <button
                  type="submit"
                  aria-label="Procurar"
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-11 h-full text-terracota-500 hover:text-terracota-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>

              {assinado ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-zinc-200/70 mb-4">
                    <div className="w-12 h-12 rounded-full bg-terracota-500 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                      {inicial}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-verde-floresta truncate text-sm">
                        {utilizador?.nome || 'Usuário'}
                      </p>
                      <p className="text-xs text-cinza-ardosia truncate">
                        {utilizador?.email || ''}
                      </p>
                    </div>
                  </div>

                  <nav className="flex flex-col gap-1 text-sm font-semibold">
                    <Link
                      to="/"
                      onClick={fecharMenu}
                      className="p-3 rounded-xl hover:bg-terracota-50 text-verde-floresta flex items-center gap-3 transition-colors"
                    >
                      <span>🏠</span> Início
                    </Link>
                    <Link
                      to="/planejador"
                      onClick={fecharMenu}
                      className="p-3 rounded-xl hover:bg-terracota-50 text-verde-floresta flex items-center gap-3 transition-colors"
                    >
                      <span>🛒</span> Carrinho Inteligente
                    </Link>
                    <Link
                      to="/criar-receita"
                      onClick={fecharMenu}
                      className="p-3 rounded-xl hover:bg-terracota-50 text-verde-floresta flex items-center gap-3 transition-colors"
                    >
                      <span>✨</span> Criar Nova Receita
                    </Link>
                    <Link
                      to="/perfil"
                      onClick={fecharMenu}
                      className="p-3 rounded-xl hover:bg-terracota-50 text-verde-floresta flex items-center gap-3 transition-colors"
                    >
                      <span>👤</span> Meu Perfil & Favoritos
                    </Link>
                  </nav>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <p className="text-xs text-cinza-ardosia">
                    Entre ou cadastre-se para salvar receitas e montar listas de compras automáticas.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/login"
                      onClick={fecharMenu}
                      className="w-full text-center py-3 rounded-xl border border-terracota-500 text-terracota-600 font-bold text-sm bg-white"
                    >
                      Fazer Login
                    </Link>
                    <Link
                      to="/cadastro"
                      onClick={fecharMenu}
                      className="btn-primary w-full text-center py-3 text-sm"
                    >
                      Cadastre-se Grátis
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {assinado && (
              <div className="pt-6 border-t border-zinc-200">
                <button
                  onClick={handleLogout}
                  className="w-full py-3 px-4 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sair da Conta</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}