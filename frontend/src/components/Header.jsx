// src/components/Header.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContexto } from '../context/AuthContexto'; // Verifique se este caminho está correto para si

export default function Header() {
  const { assinado, utilizador, logout } = useContext(AuthContexto);
  const navigate = useNavigate();

  // --- NOSSO ESPIÃO DE DEPURAÇÃO ---
  console.log("Valores do Contexto no Header:", {
    assinado: assinado,
    utilizador: utilizador,
  });
  // ------------------------------------

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-gray-800 text-white shadow-md">
      {/* ... o resto do seu código JSX continua aqui, sem alterações ... */}
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
              <li className="font-medium">
                Olá, {utilizador?.nome?.split(' ')[0]}! {/* Adicionado '?' para segurança */}
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