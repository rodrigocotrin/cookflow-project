// Arquivo: src/pages/PaginaBusca.jsx
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

// --- ÍCONES REUTILIZADOS DA HOMEPAGE ---
function IconeRelogio() {
  return (<span role="img" aria-label="tempo" className="mr-1">🕛</span>);
}

function IconeDificuldade() {
    return (<span role="img" aria-label="dificuldade" className="mr-1">🍽️</span>);
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
          // A chamada à API já está correta e busca pelo termo
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

  // Função para cores da dificuldade, reutilizada da Homepage
  const getDificuldadeClass = (dificuldade) => {
    switch (dificuldade) {
      case 'Fácil':
        return 'text-green-600';
      case 'Médio':
        return 'text-yellow-600';
      case 'Difícil':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-verde-floresta">
        Resultados para: <span className="text-terracota-500">{termoBusca}</span>
      </h1>

      {loading ? (
        <p className="text-center text-cinza-ardosia">A procurar...</p>
      ) : resultados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resultados.map((receita) => {
            const dificuldadeClasse = getDificuldadeClass(receita.dificuldade);

            return (
              // CARD ATUALIZADO - Agora idêntico ao da HomePage
              <Link to={`/receita/${receita.id_receita}`} key={receita.id_receita} className="group block bg-white rounded-lg shadow-md hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col">
                <div className="relative">
                  {/* LÓGICA DA IMAGEM CORRIGIDA */}
                  {receita.url_imagem ? (
                    <img src={receita.url_imagem} alt={receita.titulo} className="h-48 w-full object-cover" />
                  ) : (
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Sem Imagem</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-terracota-500 text-white text-xs font-semibold px-2 py-1 rounded-full uppercase">
                    {receita.nome_categoria}
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h2 className="text-2xl font-bold text-verde-floresta group-hover:text-terracota-500 transition-colors duration-300 truncate">{receita.titulo}</h2>
                  <p className="text-sm text-cinza-ardosia mt-1">por {receita.nome_usuario}</p>
                  <p className="text-gray-600 mt-3 h-12 overflow-hidden text-ellipsis flex-grow">
                    {receita.descricao}
                  </p>
                  
                  {/* RODAPÉ COMPLETO ADICIONADO */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-800 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {receita.total_avaliacoes > 0 ? (
                          <>
                            <span className="font-bold">{receita.media_avaliacoes}</span>
                            <span role="img" aria-label="estrela">⭐</span>
                            <span className="text-gray-500">({receita.total_avaliacoes})</span>
                          </>
                        ) : (
                          <span className="text-gray-500 italic">Novo!</span>
                        )}
                      </div>
                      <div className="flex items-center">
                          <IconeRelogio />
                          <span className="font-semibold">{receita.tempo_preparo_minutos}min</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                        <IconeDificuldade />
                        <span className={`font-semibold ${dificuldadeClasse}`}>
                            {receita.dificuldade}
                        </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <p className="text-center text-cinza-ardosia text-lg py-10">Nenhuma receita encontrada para a sua busca.</p>
      )}
    </div>
  );
}