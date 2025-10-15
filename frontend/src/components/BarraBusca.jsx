// Arquivo: src/components/BarraBusca.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function IconeBusca() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

export default function BarraBusca() {
  const [termoBusca, setTermoBusca] = useState('');
  const navigate = useNavigate();

  const handleBusca = (e) => {
    e.preventDefault();
    if (termoBusca.trim()) {
      navigate(`/buscar?q=${termoBusca.trim()}`);
      setTermoBusca('');
    }
  };

  return (
    <form onSubmit={handleBusca} className="w-full max-w-xl">
      <div className="flex items-center rounded-full overflow-hidden border-2 border-gray-200 focus-within:border-terracota-500 transition-colors shadow-sm">
        <input
          type="search"
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          placeholder="Procure uma receita, um ingrediente, um tipo de prato ..."
          className="flex-grow py-3 pl-5 pr-5 bg-white text-gray-700 focus:outline-none text-sm"
        />
        <button
          type="submit"
          className="bg-terracota-500 text-white font-bold py-3 px-6 flex items-center justify-center hover:bg-terracota-600 transition-colors"
        >
          <IconeBusca />
          <span className="ml-2 hidden sm:inline">Procurar</span>
        </button>
      </div>
    </form>
  );
}
