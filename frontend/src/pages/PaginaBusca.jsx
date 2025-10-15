// Arquivo: src/pages/PaginaBusca.jsx
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

// --- COMPONENTES DE ÍCONES (REUTILIZADOS DA HOMEPAGE) ---
function IconeRelogio() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconeChef() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );
}

export default function PaginaBusca() {
  const [searchParams] = useSearchParams();
  const termoBusca = searchParams.get('q');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (termoBusca) {
      setLoading(true);
      async function buscarReceitas() {
        try {
          const resposta = await api.get(`/receitas?busca=${termoBusca}`);
          setResultados(resposta.data);
        } catch (erro) {
          console.error("Erro ao buscar receitas:", erro);
        } finally {
          setLoading(false);
        }
      }
      buscarReceitas();
    }
  }, [termoBusca]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8 text-verde-floresta">
        Resultados para: <span className="text-terracota-500">{termoBusca}</span>
      </h1>

      {loading ? (
        <p className="text-center text-cinza-ardosia">A procurar...</p>
      ) : resultados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* --- CÓDIGO COMPLETO DOS CARDS (ESTAVA EM FALTA) --- */}
          {resultados.map((receita) => (
            <Link to={`/receita/${receita.id_receita}`} key={receita.id_receita} className="group block bg-white rounded-lg shadow-md hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
              <div className="relative">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Imagem da Receita</span>
                </div>
                <div className="absolute top-2 right-2 bg-terracota-500 text-white text-xs font-semibold px-2 py-1 rounded-full uppercase">
                  {receita.nome_categoria}
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 group-hover:text-terracota-500 transition-colors duration-300 truncate">{receita.titulo}</h2>
                <p className="text-sm text-gray-500 mt-1">por {receita.nome_usuario}</p>
                <p className="text-gray-600 mt-3 h-12 overflow-hidden text-ellipsis">
                  {receita.descricao}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-600">
                  <div className="flex items-center">
                    <IconeRelogio />
                    <span>{receita.tempo_preparo_minutos} min</span>
                  </div>
                  <div className="flex items-center">
                    <IconeChef />
                    <span>{receita.dificuldade}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-cinza-ardosia text-lg py-10">Nenhuma receita encontrada para a sua busca.</p>
      )}
    </div>
  );
}