// Arquivo: src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

// Ícone de Estrela
function IconeEstrela() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-400">
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
    </svg>
  );
}

// Ícone de Relógio
function IconeRelogio() {
  return (
      // O emoji 🕛 já é visualmente claro, mas um SVG garante consistência
      <span role="img" aria-label="tempo" className="mr-1">🕛</span>
  );
}

// Ícone de Chapéu de Chef (ou Prato, como em 🍽️)
function IconeDificuldade() {
    return (
        <span role="img" aria-label="dificuldade" className="mr-1">🍽️</span>
    );
}

export default function HomePage() {
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarReceitas() {
      try {
        const resposta = await api.get('/receitas');
        setReceitas(resposta.data);
      } catch (erro) {
        console.error("Erro ao buscar receitas:", erro);
      } finally {
        setLoading(false);
      }
    }
    carregarReceitas();
  }, []);

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

  if (loading) {
    return <p className="text-center text-gray-500 py-10">A carregar receitas...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-verde-floresta">Descubra Novas Receitas</h1>
        <p className="text-xl text-cinza-ardosia mt-2">Inspire-se e faça as suas próximas refeições.</p>
      </div>

      {receitas.length === 0 && !loading ? (
        <p className="text-center text-cinza-ardosia">Nenhuma receita encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {receitas.map((receita) => {
            const dificuldadeClasse = getDificuldadeClass(receita.dificuldade);

            return (
              // LINK CORRIGIDO para a versão singular "receita"
              <Link to={`/receita/${receita.id_receita}`} key={receita.id_receita} className="group block bg-white rounded-lg shadow-md hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col">
                <div className="relative">
                  <img src={receita.url_imagem} alt={receita.titulo} className="h-48 w-full object-cover" />
                  <div className="absolute top-2 right-2 bg-terracota-500 text-white text-xs font-semibold px-2 py-1 rounded-full uppercase">
                    {receita.nome_categoria}
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h2 className="text-2xl font-bold text-verde-floresta group-hover:text-terracota-500 transition-colors duration-300 truncate">{receita.titulo}</h2>
                  <p className="text-sm text-cinza-ardosia mt-1">por: {receita.nome_usuario}</p>
                  <p className="text-gray-600 mt-3 h-12 overflow-hidden text-ellipsis flex-grow">
                    {receita.descricao}
                  </p>
                  
                  {/* LAYOUT DO RODAPÉ ATUALIZADO */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-800 flex-wrap gap-2">
                    
                    {/* Agrupamento de Avaliação e Tempo */}
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
                    
                    {/* Dificuldade (agora à direita) */}
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
      )}
    </div>
  );
}