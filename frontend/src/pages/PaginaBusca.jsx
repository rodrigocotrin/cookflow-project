// Arquivo: src/pages/PaginaBusca.jsx
import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api, { resolverUrlImagem } from '../services/api';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';

export default function PaginaBusca() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const termoBusca = searchParams.get('q') || '';
  const [termoInput, setTermoInput] = useState(termoBusca);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroDificuldade, setFiltroDificuldade] = useState('todos');

  useEffect(() => {
    setTermoInput(termoBusca);
    if (termoBusca) {
      setLoading(true);
      async function buscarReceitas() {
        try {
          const resposta = await api.get(`/receitas?busca=${encodeURIComponent(termoBusca)}`);
          setResultados(resposta.data || []);
        } catch (erro) {
          console.error("Erro ao buscar receitas:", erro);
          toast.error("Erro ao carregar resultados da busca.");
        } finally {
          setLoading(false);
        }
      }
      buscarReceitas();
    } else {
      setResultados([]);
      setLoading(false);
    }
  }, [termoBusca]);

  const handleBuscar = (e) => {
    e.preventDefault();
    if (termoInput.trim()) {
      setSearchParams({ q: termoInput.trim() });
    }
  };

  const handleAdicionarAoCarrinho = async (e, id_receita, titulo) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await api.post('/lista-de-compras', { ids_receitas: [id_receita] });
      toast.success(`"${titulo}" adicionada ao seu Carrinho Inteligente! 🛒`);
    } catch (err) {
      toast.info(`"${titulo}" selecionada no Planejador!`);
    }
  };

  const receitasFiltradas = resultados.filter(r => {
    if (filtroDificuldade === 'todos') return true;
    return r.dificuldade === filtroDificuldade;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 selection:bg-terracota-500 selection:text-white pb-16">
      <Helmet>
        <title>{termoBusca ? `Busca por "${termoBusca}" — CookFlow` : 'Buscar Receitas — CookFlow'}</title>
      </Helmet>

      {/* --- BARRA DE BUSCA EM DESTAQUE --- */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-card border border-white/80 space-y-4 text-center">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-verde-floresta font-heading">
          Explorar o Acervo Culinário
        </h1>
        <p className="text-xs sm:text-sm text-cinza-ardosia max-w-md mx-auto">
          Encontre receitas incríveis por ingrediente, prato ou categoria.
        </p>

        <form onSubmit={handleBuscar} className="max-w-xl mx-auto flex gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Buscar receita ou ingrediente..."
              value={termoInput}
              onChange={(e) => setTermoInput(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-300 rounded-2xl text-verde-floresta text-sm font-medium focus:ring-2 focus:ring-terracota-500/50 shadow-sm"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cinza-ardosia absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button type="submit" className="btn-primary py-3 px-6 text-sm font-bold shadow-md shadow-terracota-500/20">
            Buscar
          </button>
        </form>

        {termoBusca && (
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-cinza-ardosia border-t border-zinc-200">
            <span>
              Resultados para: <strong className="text-terracota-600">"{termoBusca}"</strong> ({receitasFiltradas.length})
            </span>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold">Dificuldade:</span>
              <button
                onClick={() => setFiltroDificuldade('todos')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${filtroDificuldade === 'todos' ? 'bg-terracota-500 text-white' : 'bg-white border border-zinc-200 text-cinza-ardosia'}`}
              >
                Todas
              </button>
              <button
                onClick={() => setFiltroDificuldade('Fácil')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${filtroDificuldade === 'Fácil' ? 'bg-terracota-500 text-white' : 'bg-white border border-zinc-200 text-cinza-ardosia'}`}
              >
                Fácil
              </button>
              <button
                onClick={() => setFiltroDificuldade('Médio')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${filtroDificuldade === 'Médio' ? 'bg-terracota-500 text-white' : 'bg-white border border-zinc-200 text-cinza-ardosia'}`}
              >
                Médio
              </button>
              <button
                onClick={() => setFiltroDificuldade('Difícil')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${filtroDificuldade === 'Difícil' ? 'bg-terracota-500 text-white' : 'bg-white border border-zinc-200 text-cinza-ardosia'}`}
              >
                Difícil
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- GRID DE RESULTADOS --- */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-80 bg-zinc-200 rounded-3xl"></div>
          ))}
        </div>
      ) : receitasFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {receitasFiltradas.map(receita => {
            const urlImg = resolverUrlImagem(receita.url_imagem);
            const mediaNota = Number(receita.media_avaliacoes || 0).toFixed(1);

            return (
              <div
                key={receita.id_receita}
                className="group glass-card rounded-3xl overflow-hidden border border-white/80 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-zinc-100">
                    <img
                      src={urlImg}
                      alt={receita.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="badge-category text-[11px] shadow-sm">
                        {receita.nome_categoria || 'Receita'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleAdicionarAoCarrinho(e, receita.id_receita, receita.titulo)}
                      className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-terracota-600 hover:bg-terracota-500 hover:text-white p-2.5 rounded-xl shadow-md transition-all active:scale-95"
                      title="Adicionar ao Carrinho Inteligente"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-cinza-ardosia">
                      <span className="font-semibold">por {receita.nome_usuario || 'Chef'}</span>
                      <span className="flex items-center gap-1 font-bold text-amber-500">
                        ★ {mediaNota > 0 ? mediaNota : 'Novo'}
                      </span>
                    </div>

                    <Link to={`/receita/${receita.id_receita}`}>
                      <h3 className="text-lg font-bold text-verde-floresta font-heading group-hover:text-terracota-500 transition-colors line-clamp-1">
                        {receita.titulo}
                      </h3>
                    </Link>

                    <p className="text-xs text-cinza-ardosia line-clamp-2 leading-relaxed">
                      {receita.descricao || 'Uma receita deliciosa e fácil de fazer com o CookFlow.'}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-zinc-100 flex items-center justify-between text-xs text-cinza-ardosia mt-2">
                  <span className="flex items-center gap-1 font-semibold">
                    ⏱️ {receita.tempo_preparo_minutos} min
                  </span>
                  <span className="font-semibold">
                    🟢 {receita.dificuldade}
                  </span>
                  <Link
                    to={`/receita/${receita.id_receita}`}
                    className="font-bold text-terracota-500 hover:text-terracota-600"
                  >
                    Ver receita →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 glass-panel rounded-3xl border border-dashed border-zinc-300 space-y-4">
          <div className="text-5xl">🔍</div>
          <h2 className="text-xl font-bold text-verde-floresta font-heading">
            Nenhuma receita encontrada
          </h2>
          <p className="text-xs text-cinza-ardosia max-w-sm mx-auto">
            Não encontramos resultados para "{termoBusca}". Tente palavras mais genéricas como "bolo", "massa", ou "frango".
          </p>
          <Link to="/" className="btn-primary inline-block py-2.5 px-6 text-xs">
            Ver Todas as Receitas
          </Link>
        </div>
      )}
    </div>
  );
}