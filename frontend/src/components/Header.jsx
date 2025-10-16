// Arquivo: src/components/Header.jsx
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContexto } from '../context/AuthContexto';
import BarraBusca from './BarraBusca';

// --- Ícones para a UI ---
function IconeMenuHamburguer() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    );
}

function IconeFechar() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}

// Ícone da lupa que será usado no botão de busca mobile
function IconeLupa() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    );
}

export default function Header() {
  const { assinado, utilizador, logout } = useContext(AuthContexto);
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  // NOVO: Estado para controlar a busca dentro do menu mobile
  const [termoBusca, setTermoBusca] = useState('');

  const handleLogout = () => {
    logout();
    setMenuAberto(false);
    navigate('/login');
  };

  const fecharMenu = () => {
    setMenuAberto(false);
    setTermoBusca(''); // Limpa a busca ao fechar o menu
  }

  // NOVO: Handler para a busca no menu mobile
  const handleBuscaMobile = (e) => {
    e.preventDefault();
    if (termoBusca.trim()) {
      // Navega para a página de busca com o termo como query param
      navigate(`/buscar?q=${termoBusca.trim()}`);
      fecharMenu();
    }
  };

  return (
    <header className="bg-creme w-full py-4 px-6 shadow-md border-b-2 border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold text-terracota-500" onClick={fecharMenu}>
          CookFlow
        </Link>

        {/* Barra de busca para Desktop */}
        <div className="hidden md:flex flex-grow justify-center px-8">
          <BarraBusca />
        </div>

        {/* Navegação Desktop */}
        <div className="hidden md:flex items-center gap-4">
          {assinado ? (
            <>
              <Link to="/planejador" className="font-bold py-2 px-4 rounded-full border-2 border-terracota-500 text-terracota-500 hover:bg-terracota-500 hover:text-white transition-colors">
                Planejador
              </Link>
              <Link to="/criar-receita" className="bg-terracota-500 text-white font-bold py-2 px-4 rounded-full hover:bg-terracota-600 transition-colors">
                Criar Receita
              </Link>
              <Link to="/perfil" className="w-10 h-10 rounded-full bg-verde-floresta flex items-center justify-center text-white font-bold text-lg">
                {utilizador.nome.charAt(0).toUpperCase()}
              </Link>
              <button onClick={handleLogout} title="Sair" className="text-cinza-ardosia hover:text-terracota-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-semibold text-verde-floresta hover:text-terracota-500 transition-colors">
                Login
              </Link>
              <Link to="/cadastro" className="bg-terracota-500 text-white font-bold py-2 px-4 rounded-full hover:bg-terracota-600 transition-colors">
                Cadastre-se
              </Link>
            </>
          )}
        </div>

        {/* Botão Hambúrguer para Mobile */}
        <div className="md:hidden">
            <button onClick={() => setMenuAberto(!menuAberto)} className="text-verde-floresta">
                {menuAberto ? <IconeFechar /> : <IconeMenuHamburguer />}
            </button>
        </div>
      </div>

      {/* --- MENU MOBILE COM BUSCA OTIMIZADA --- */}
      <div className={`md:hidden absolute top-full right-0 h-screen w-full max-w-sm bg-creme shadow-xl transform transition-transform duration-300 ease-in-out ${menuAberto ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 flex flex-col gap-y-8">
            {/* --- NOVA BARRA DE BUSCA MOBILE --- */}
            <form onSubmit={handleBuscaMobile} className="relative flex w-full">
              <input
                  type="text"
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  placeholder="Procure uma receita..."
                  className="w-full pl-4 pr-12 py-3 text-verde-floresta bg-white border border-zinc-300 rounded-full focus:outline-none focus:ring-2 focus:ring-terracota-500"
              />
              <button
                  type="submit"
                  aria-label="Procurar"
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full text-white bg-terracota-500 rounded-r-full hover:bg-terracota-600 transition-colors"
              >
                  <IconeLupa />
              </button>
            </form>
            
            <div className="border-t border-zinc-200"></div>

            {assinado ? (
                <nav className="flex flex-col gap-y-6">
                    <Link to="/perfil" onClick={fecharMenu} className="text-2xl font-semibold text-verde-floresta hover:text-terracota-500 transition-colors">
                        Meu Perfil
                    </Link>
                    <Link to="/planejador" onClick={fecharMenu} className="text-2xl font-semibold text-terracota-500 hover:text-terracota-600 transition-colors">
                        Planejador
                    </Link>
                    <Link to="/criar-receita" onClick={fecharMenu} className="text-2xl font-semibold text-verde-floresta hover:text-terracota-500 transition-colors">
                        Criar Receita
                    </Link>
                    <button onClick={handleLogout} className="text-2xl font-semibold text-cinza-ardosia hover:text-terracota-500 transition-colors text-left">
                        Sair
                    </button>
                </nav>
            ) : (
                <nav className="flex flex-col gap-y-6">
                    <Link to="/login" onClick={fecharMenu} className="text-2xl font-semibold text-verde-floresta hover:text-terracota-500 transition-colors">
                        Login
                    </Link>
                    <Link to="/cadastro" onClick={fecharMenu} className="text-2xl font-semibold text-terracota-500 hover:text-terracota-600 transition-colors">
                        Cadastre-se
                    </Link>
                </nav>
            )}
        </div>
      </div>
    </header>
  );
}