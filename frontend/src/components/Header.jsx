// src/components/Header.jsx
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-gray-800 text-white shadow-md">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-green-400">
          CookFlow
        </Link>

        {/* Links de Navegação */}
        <ul className="flex space-x-6">
          <li>
            <Link to="/" className="hover:text-green-300">Home</Link>
          </li>
          <li>
            <Link to="/login" className="hover:text-green-300">Login</Link>
          </li>
          <li>
            <Link to="/cadastro" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
              Cadastre-se
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}