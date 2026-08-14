// Arquivo: src/pages/HomePage.jsx
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api, { resolverUrlImagem } from '../services/api';
import AvaliacaoEstrelas from '../components/AvaliacaoEstrelas';
import { AuthContexto } from '../context/AuthContexto';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';

const CATEGORIAS_POPULARES = [
  { id: '', nome: 'Todas', icone: '🍽️' },
  { id: 'Massas', nome: 'Massas', icone: '🍝' },
  { id: 'Sobremesas', nome: 'Sobremesas', icone: '🍰' },
  { id: 'Carnes', nome: 'Carnes', icone: '🥩' },
  { id: 'Lanches', nome: 'Lanches', icone: '🍔' },
  { id: 'Vegetariano', nome: 'Vegetariano', icone: '🥗' },
  { id: 'Bebidas', nome: 'Bebidas', icone: '🍹' },
  { id: 'Peixes e Frutos do Mar', nome: 'Peixes & Frutos do Mar', icone: '🐟' },
];

export default function HomePage() {
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [dificuldadeSelecionada, setDificuldadeSelecionada] = useState('');
  const [ordenacao, setOrdenacao] = useState('recentes');
  const { assinado } = useContext(AuthContexto);
  const [adicionandoId, setAdicionandoId] = useState(null);

  const carregarReceitas = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoriaSelecionada) params.categoria = categoriaSelecionada;
      if (dificuldadeSelecionada) params.dificuldade = dificuldadeSelecionada;
      if (ordenacao) params.ordenar = ordenacao;

      const resposta = await api.get('/receitas', { params });
      setReceitas(resposta.data);
    } catch (erro) {
      console.error("Erro ao buscar receitas:", erro);
      toast.error("Não foi possível carregar as receitas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarReceitas();
  }, [categoriaSelecionada, dificuldadeSelecionada, ordenacao]);

  const handleAdicionarAoPlanejador = async (e, idReceita, titulo) => {
    e.preventDefault();
    e.stopPropagation();

    if (!assinado) {
      toast.info("Faça login para adicionar ingredientes ao seu carrinho inteligente!");
      return;
    }

    setAdicionandoId(idReceita);
    try {
      await api.post('/planejador', { id_receita: idReceita });
      toast.success(`Ingredientes de "${titulo}" adicionados ao carrinho!`);
    } catch (erro) {
      console.error("Erro ao adicionar ao planejador:", erro);
      toast.error(erro.response?.data?.mensagem || "Erro ao adicionar receita ao planejador.");
    } finally {
      setAdicionandoId(null);
    }
  };

  const getDificuldadeBadge = (dificuldade) => {
    switch (dificuldade) {
      case 'Fácil':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">Fácil</span>;
      case 'Médio':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full">Médio</span>;
      case 'Difícil':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-2.5 py-0.5 rounded-full">Difícil</span>;
      default:
        return <span className="bg-zinc-100 text-zinc-700 text-xs font-semibold px-2 py-0.5 rounded-full">{dificuldade}</span>;
    }
  };

  return (
    <div className="space-y-10 selection:bg-terracota-500 selection:text-white">
      <Helmet>
        <title>CookFlow — O SaaS Culinário com Carrinho Inteligente</title>
      </Helmet>

      {/* --- HERO BANNER SAAS PREMIUM --- */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-terracota-600 via-terracota-500 to-amber-600 text-white p-8 sm:p-12 lg:p-16 shadow-glow-terracota">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-black/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm">
            <span className="animate-pulse">✨</span> O TudoGostoso dos seus sonhos
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading leading-tight tracking-tight">
            Cozinhe com paixão, compre com inteligência.
          </h1>

          <p className="text-sm sm:text-lg text-white/90 font-medium leading-relaxed">
            Descubra milhares de receitas artesanais e converta todos os ingredientes na sua <strong className="text-white underline decoration-white/40 underline-offset-4">lista de supermercado automatizada</strong> com apenas 1 clique.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/buscar"
              className="bg-white text-terracota-600 font-bold px-6 py-3.5 rounded-2xl shadow-card hover:bg-creme-50 transition-transform active:scale-95 text-sm sm:text-base flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-terracota-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Explorar Receitas</span>
            </Link>

            <Link
              to="/planejador"
              className="bg-black/20 hover:bg-black/30 backdrop-blur-md text-white font-bold px-6 py-3.5 rounded-2xl border border-white/30 transition-colors text-sm sm:text-base flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Ver Carrinho Inteligente</span>
            </Link>
          </div>
        </div>
      </section>

      {/* --- CARROSSEL DE CATEGORIAS (Pills com rolagem horizontal suave) --- */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold text-verde-floresta font-heading">
            Categorias em Destaque
          </h2>
          {categoriaSelecionada && (
            <button
              onClick={() => setCategoriaSelecionada('')}
              className="text-xs font-bold text-terracota-500 hover:text-terracota-600 underline"
            >
              Limpar Categoria
            </button>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIAS_POPULARES.map((cat) => {
            const ativa = categoriaSelecionada === cat.id;
            return (
              <button
                key={cat.id || 'todas'}
                onClick={() => setCategoriaSelecionada(cat.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${
                  ativa
                    ? 'bg-verde-floresta text-white shadow-card scale-105'
                    : 'bg-white/80 backdrop-blur-sm text-cinza-ardosia border border-zinc-200/80 hover:border-terracota-500/40 hover:bg-white hover:text-verde-floresta'
                }`}
              >
                <span className="text-lg">{cat.icone}</span>
                <span>{cat.nome}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* --- BARRA DE FILTROS E ORDENAÇÃO --- */}
      <section className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-zinc-200/70 shadow-sm">
        {/* Filtro por Dificuldade */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-cinza-ardosia">
            Dificuldade:
          </span>
          {['', 'Fácil', 'Médio', 'Difícil'].map((dif) => {
            const ativa = dificuldadeSelecionada === dif;
            return (
              <button
                key={dif || 'todas-dif'}
                onClick={() => setDificuldadeSelecionada(dif)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  ativa
                    ? 'bg-terracota-500 text-white shadow-sm'
                    : 'bg-zinc-100 text-cinza-ardosia hover:bg-zinc-200 hover:text-verde-floresta'
                }`}
              >
                {dif || 'Todas'}
              </button>
            );
          })}
        </div>

        {/* Ordenação */}
        <div className="flex items-center gap-2">
          <label htmlFor="ordenar" className="text-xs font-bold uppercase tracking-wider text-cinza-ardosia">
            Ordenar por:
          </label>
          <select
            id="ordenar"
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="bg-creme-100 border border-zinc-300 text-verde-floresta text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-terracota-500/40 cursor-pointer"
          >
            <option value="recentes">Mais Recentes</option>
            <option value="mais_avaliadas">Melhores Avaliadas ⭐</option>
            <option value="mais_rapidas">Mais Rápidas ⏱️</option>
          </select>
        </div>
      </section>

      {/* --- GRID DE RECEITAS COM CARDS MODERNOS --- */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-zinc-200 shadow-sm animate-pulse flex flex-col">
                <div className="h-52 bg-zinc-200 w-full"></div>
                <div className="p-6 space-y-3 flex-1">
                  <div className="h-5 bg-zinc-200 rounded w-3/4"></div>
                  <div className="h-4 bg-zinc-200 rounded w-1/2"></div>
                  <div className="h-12 bg-zinc-200 rounded w-full mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : receitas.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white/70 backdrop-blur-sm rounded-3xl border border-dashed border-zinc-300 space-y-4">
            <div className="text-5xl">🍲</div>
            <h3 className="text-2xl font-bold text-verde-floresta font-heading">
              Nenhuma receita encontrada
            </h3>
            <p className="text-sm text-cinza-ardosia max-w-md mx-auto">
              Não encontramos nenhuma receita com os filtros selecionados. Experimente limpar os filtros ou crie a sua própria receita!
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setCategoriaSelecionada('');
                  setDificuldadeSelecionada('');
                }}
                className="px-5 py-2.5 bg-zinc-200 text-verde-floresta font-bold text-sm rounded-xl hover:bg-zinc-300"
              >
                Limpar Filtros
              </button>
              <Link
                to="/criar-receita"
                className="btn-primary px-5 py-2.5 text-sm"
              >
                Criar Receita
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {receitas.map((receita) => {
              const urlImagem = resolverUrlImagem(receita.url_imagem);
              const estaAdicionando = adicionandoId === receita.id_receita;

              return (
                <div
                  key={receita.id_receita}
                  className="group bg-white rounded-3xl shadow-card hover:shadow-card-hover border border-zinc-200/70 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Foto da Receita com Tag de Categoria e Ação Rápida */}
                  <Link to={`/receita/${receita.id_receita}`} className="relative h-56 w-full overflow-hidden block bg-zinc-100">
                    <img
                      src={urlImagem}
                      alt={receita.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80';
                      }}
                    />

                    {/* Tag Categoria */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-verde-floresta text-xs font-extrabold px-3 py-1.5 rounded-full shadow-sm">
                      {receita.nome_categoria || 'Receita'}
                    </div>

                    {/* Botão de Carrinho Inteligente Flutuante */}
                    <button
                      onClick={(e) => handleAdicionarAoPlanejador(e, receita.id_receita, receita.titulo)}
                      disabled={estaAdicionando}
                      title="Adicionar ingredientes ao Carrinho Inteligente"
                      className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-terracota-500 hover:bg-terracota-500 hover:text-white flex items-center justify-center shadow-md transition-all active:scale-90"
                    >
                      {estaAdicionando ? (
                        <div className="w-4 h-4 border-2 border-terracota-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      )}
                    </button>
                  </Link>

                  {/* Detalhes do Card */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Chef & Data */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-terracota-500 text-white font-bold text-[10px] flex items-center justify-center">
                          {receita.nome_usuario ? receita.nome_usuario.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <span className="text-xs font-semibold text-cinza-ardosia">
                          Chef {receita.nome_usuario || 'Anônimo'}
                        </span>
                      </div>

                      {/* Título */}
                      <Link to={`/receita/${receita.id_receita}`}>
                        <h3 className="text-xl font-bold text-verde-floresta group-hover:text-terracota-600 transition-colors line-clamp-1 font-heading">
                          {receita.titulo}
                        </h3>
                      </Link>

                      {/* Descrição curta */}
                      <p className="text-xs text-cinza-ardosia mt-2 line-clamp-2 leading-relaxed">
                        {receita.descricao || 'Uma deliciosa receita preparada com ingredientes selecionados.'}
                      </p>
                    </div>

                    {/* Metadados e Avaliação */}
                    <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-2 text-xs">
                      {/* Avaliações */}
                      <div className="flex items-center gap-1.5">
                        <AvaliacaoEstrelas
                          tamanho="w-4 h-4"
                          valorInicial={receita.media_avaliacoes || 0}
                        />
                        <span className="font-bold text-verde-floresta">
                          {receita.total_avaliacoes > 0 ? parseFloat(receita.media_avaliacoes).toFixed(1) : 'Novo'}
                        </span>
                        {receita.total_avaliacoes > 0 && (
                          <span className="text-cinza-ardosia text-[11px]">({receita.total_avaliacoes})</span>
                        )}
                      </div>

                      {/* Tempo & Dificuldade */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 font-semibold text-verde-floresta">
                          <span>⏱️</span>
                          <span>{receita.tempo_preparo_minutos} min</span>
                        </div>
                        {getDificuldadeBadge(receita.dificuldade)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
