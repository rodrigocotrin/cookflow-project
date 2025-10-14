// Arquivo: src/components/Header.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContexto } from '../context/AuthContexto';

export default function Header() {
  const { assinado, utilizador, logout } = useContext(AuthContexto);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-gray-800 text-white shadow-md">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-green-400">
          CookFlow
        </Link>

        <ul className="flex items-center space-x-6">
          <li>
            <Link to="/" className="hover:text-green-300">Home</Link>
          </li>

          {assinado ? (
            <>
              <li>
                <Link to="/planejador" className="hover:text-green-300 font-medium">Planejador</Link>
              </li>
              <li>
                <Link to="/criar-receita" className="hover:text-green-300 font-medium">Criar Receita</Link>
              </li>
              <li>
                <Link to="/perfil" className="hover:text-green-300 font-medium">Meu Perfil</Link> 
              </li>
              <li className="font-medium text-gray-300">
                Olá, {utilizador.nome.split(' ')[0]}!
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                >
                  Sair
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="hover:text-green-300">Login</Link>
              </li>
              <li>
                <Link to="/cadastro" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                  Cadastre-se
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}