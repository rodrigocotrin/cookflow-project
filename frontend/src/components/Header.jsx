// Arquivo: src/components/Header.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContexto } from '../context/AuthContexto';
import BarraBusca from './BarraBusca';

export default function Header() {
  const { assinado, utilizador, logout } = useContext(AuthContexto);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    // A sombra foi aumentada para 'shadow-md'
    <header className="bg-creme w-full py-4 px-6 shadow-md border-b-2 border-gray-100">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold text-terracota-500">
          CookFlow
        </Link>

        <div className="flex-grow flex justify-center px-8">
          <BarraBusca />
        </div>

        <div className="flex items-center gap-4">
          {assinado ? (
            <>
              <Link to="/planejador" className="font-bold py-2 px-4 rounded-full border-2 border-terracota-500 text-terracota-500 hover:bg-terracota-500 hover:text-white transition-colors">
                Planejador
              </Link>
              <Link to="/criar-receita" className="bg-terracota-500 text-white font-bold py-2 px-4 rounded-full hover:bg-terracota-600 transition-colors">
                Criar Receita
              </Link>
              <div className="relative group">
                <Link to="/perfil" className="w-10 h-10 rounded-full bg-verde-floresta flex items-center justify-center text-white font-bold text-lg">
                  {utilizador.nome.charAt(0).toUpperCase()}
                </Link>
              </div>
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
      </div>
    </header>
  );
}