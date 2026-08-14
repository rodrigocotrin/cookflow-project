// Arquivo: src/pages/ReceitaDetalhePage.jsx
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { resolverUrlImagem } from '../services/api';
import { AuthContexto } from '../context/AuthContexto';
import ComentariosSecao from '../components/ComentariosSecao';
import AvaliacaoEstrelas from '../components/AvaliacaoEstrelas';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';

export default function ReceitaDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receita, setReceita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eFavorito, setEFavorito] = useState(false);
  const [adicionandoCarrinho, setAdicionandoCarrinho] = useState(false);
  const [ingredientesChecados, setIngredientesChecados] = useState({});
  const { assinado, utilizador } = useContext(AuthContexto);

  useEffect(() => {
    async function carregarDados() {
      try {
        const respostaReceita = await api.get(`/receitas/${id}`);
        setReceita(respostaReceita.data);

        if (assinado) {
          try {
            const respostaFavoritos = await api.get('/perfil/favoritos');
            if (respostaFavoritos.data && Array.isArray(respostaFavoritos.data)) {
              const favoritoEncontrado = respostaFavoritos.data.some(fav => fav.id_receita === parseInt(id, 10));
              setEFavorito(favoritoEncontrado);
            }
          } catch (favErr) {
            console.warn("Não foi possível verificar favoritos:", favErr);
          }
        }
      } catch (erro) {
        console.error("Erro ao buscar dados da receita:", erro);
        toast.error("Não foi possível carregar os detalhes da receita.");
        navigate('/');
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [id, assinado, navigate]);

  const handleFavoritar = async () => {
    if (!assinado) {
      toast.info("Faça login para salvar esta receita nos seus favoritos!");
      return;
    }

    try {
      if (eFavorito) {
        await api.delete(`/receitas/${id}/favoritar`);
        setEFavorito(false);
        toast.info("Receita removida dos favoritos.");
      } else {
        await api.post(`/receitas/${id}/favoritar`);
        setEFavorito(true);
        toast.success("Receita adicionada aos seus favoritos! ❤️");
      }
    } catch (erro) {
      console.error("Erro ao alternar favorito:", erro);
      toast.error("Não foi possível atualizar seus favoritos.");
    }
  };

  const handleAdicionarAoPlanejador = async () => {
    if (!assinado) {
      toast.info("Faça login para adicionar ingredientes ao seu carrinho inteligente!");
      return;
    }

    setAdicionandoCarrinho(true);
    try {
      await api.post('/planejador', { id_receita: parseInt(id, 10) });
      toast.success("Ingredientes adicionados com sucesso ao seu Carrinho Inteligente! 🛒");
    } catch (erro) {
      console.error("Erro ao adicionar ao planejador:", erro);
      toast.error(erro.response?.data?.mensagem || "Erro ao adicionar ao planejador.");
    } finally {
      setAdicionandoCarrinho(false);
    }
  };

  const handleCompartilharWhatsApp = () => {
    const texto = `😋 Olha só essa receita maravilhosa de *${receita.titulo}* que encontrei no CookFlow:\n\n${window.location.href}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  const handleDeletar = async () => {
    if (window.confirm("Tem certeza de que deseja excluir permanentemente esta receita?")) {
      try {
        await api.delete(`/receitas/${id}`);
        toast.success("Receita excluída com sucesso.");
        navigate('/');
      } catch (erro) {
        console.error("Erro ao deletar receita:", erro);
        toast.error("Erro ao excluir a receita.");
      }
    }
  };

  const toggleIngrediente = (index) => {
    setIngredientesChecados(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const atualizarStatsAvaliacao = ({ media_avaliacoes, total_avaliacoes }) => {
    setReceita(prev => ({
      ...prev,
      media_avaliacoes,
      total_avaliacoes
    }));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-6 animate-pulse">
        <div className="h-96 bg-zinc-200 rounded-3xl w-full"></div>
        <div className="h-10 bg-zinc-200 rounded-xl w-3/4"></div>
        <div className="h-6 bg-zinc-200 rounded-xl w-1/2"></div>
      </div>
    );
  }

  if (!receita) return null;

  const eDono = assinado && utilizador && utilizador.id_usuario === receita.id_usuario;
  const urlImagem = resolverUrlImagem(receita.url_imagem);

  // Divide as instruções em passos numerados se houver quebras de linha
  const passosModoPreparo = receita.instrucoes
    ? receita.instrucoes.split('\n').filter(p => p.trim().length > 0)
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 selection:bg-terracota-500 selection:text-white pb-12">
      <Helmet>
        <title>{receita.titulo} — Receita no CookFlow</title>
        <meta name="description" content={receita.descricao || `Aprenda a fazer ${receita.titulo} no CookFlow.`} />
      </Helmet>

      {/* --- HERO IMAGE & BADGES --- */}
      <div className="relative w-full h-80 sm:h-[440px] rounded-3xl overflow-hidden shadow-card group bg-zinc-900">
        <img
          src={urlImagem}
          alt={receita.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Gradiente escuro para contraste */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20"></div>

        {/* Categoria Topo Esquerdo */}
        <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-md text-verde-floresta font-bold text-xs sm:text-sm px-4 py-2 rounded-full shadow-lg">
          {receita.nome_categoria || 'Receita Especial'}
        </div>

        {/* Botões de Ação Topo Direito */}
        <div className="absolute top-5 right-5 flex items-center gap-2">
          {/* Botão WhatsApp */}
          <button
            onClick={handleCompartilharWhatsApp}
            title="Compartilhar no WhatsApp"
            className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
          </button>

          {/* Botão Favoritar */}
          <button
            onClick={handleFavoritar}
            title={eFavorito ? "Remover dos favoritos" : "Salvar nos favoritos"}
            className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 ${
              eFavorito
                ? 'bg-rose-600 text-white'
                : 'bg-white/90 text-zinc-700 hover:text-rose-600'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={eFavorito ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Informações no Rodapé da Foto */}
        <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-white/90">
            <span>Por Chef {receita.nome_usuario}</span>
            <span>•</span>
            <span>{new Date(receita.data_criacao).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-heading leading-tight tracking-tight drop-shadow-md">
            {receita.titulo}
          </h1>
        </div>
      </div>

      {/* --- CARTÃO PRINCIPAL COM RESUMO E AÇÕES --- */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-card border border-white/80 space-y-6">
        
        {/* Barra de Estatísticas & Ações de Dono */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-zinc-200/80">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm font-bold text-verde-floresta">
            {/* Avaliação */}
            <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-2 rounded-2xl border border-amber-200/80">
              <AvaliacaoEstrelas
                tamanho="w-5 h-5"
                valorInicial={receita.media_avaliacoes || 0}
              />
              <span className="text-amber-800 text-base font-extrabold">
                {receita.total_avaliacoes > 0 ? parseFloat(receita.media_avaliacoes).toFixed(1) : 'Novo'}
              </span>
              <a href="#comentarios" className="text-xs text-amber-700 underline font-medium">
                ({receita.total_avaliacoes} {receita.total_avaliacoes === 1 ? 'avaliação' : 'avaliações'})
              </a>
            </div>

            {/* Tempo */}
            <div className="flex items-center gap-1.5 bg-creme-200/70 px-3.5 py-2 rounded-2xl">
              <span className="text-lg">⏱️</span>
              <span>{receita.tempo_preparo_minutos} minutos</span>
            </div>

            {/* Dificuldade */}
            <div className="flex items-center gap-1.5 bg-creme-200/70 px-3.5 py-2 rounded-2xl">
              <span className="text-lg">👨‍🍳</span>
              <span>Dificuldade: {receita.dificuldade}</span>
            </div>
          </div>

          {/* Ações de Dono */}
          {eDono && (
            <div className="flex items-center gap-2">
              <Link
                to={`/receita/${id}/editar`}
                className="btn-secondary py-2 px-4 text-xs sm:text-sm flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
                </svg>
                <span>Editar</span>
              </Link>
              <button
                onClick={handleDeletar}
                className="py-2 px-4 text-xs sm:text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-colors flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Excluir</span>
              </button>
            </div>
          )}
        </div>

        {/* Descrição da Receita */}
        {receita.descricao && (
          <p className="text-base sm:text-lg text-cinza-ardosia leading-relaxed font-normal">
            {receita.descricao}
          </p>
        )}

        {/* BOTÃO EM DESTAQUE: CARRINHO INTELIGENTE */}
        <div className="bg-gradient-to-r from-terracota-50 to-amber-50 p-5 rounded-2xl border border-terracota-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-verde-floresta text-base font-heading flex items-center gap-2 justify-center sm:justify-start">
              <span>🛒</span> Planejar Lista de Supermercado
            </h3>
            <p className="text-xs text-cinza-ardosia">
              Adicione automaticamente todos os ingredientes consolidados ao seu Carrinho Inteligente.
            </p>
          </div>

          <button
            onClick={handleAdicionarAoPlanejador}
            disabled={adicionandoCarrinho}
            className="btn-primary py-3 px-6 text-sm flex items-center gap-2 whitespace-nowrap shadow-md shadow-terracota-500/20 disabled:opacity-60"
          >
            {adicionandoCarrinho ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Adicionando...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Adicionar ao Carrinho</span>
              </>
            )}
          </button>
        </div>

        {/* --- CONTEÚDO PRINCIPAL: INGREDIENTES & MODO DE PREPARO --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          
          {/* Coluna de Ingredientes (com checklist interativo "Modo Cozinheiro") */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h2 className="text-xl font-bold text-verde-floresta font-heading flex items-center gap-2">
                <span>🥕</span> Ingredientes
              </h2>
              <span className="text-xs font-semibold text-cinza-ardosia bg-creme-200 px-2.5 py-1 rounded-full">
                {receita.ingredientes?.length || 0} itens
              </span>
            </div>

            <p className="text-xs text-cinza-ardosia italic">
              Dica: Marque os ingredientes que você já separou na bancada!
            </p>

            <ul className="space-y-2.5">
              {receita.ingredientes && receita.ingredientes.map((ing, index) => {
                const checado = !!ingredientesChecados[index];
                return (
                  <li
                    key={index}
                    onClick={() => toggleIngrediente(index)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                      checado
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 line-through opacity-75'
                        : 'bg-white border-zinc-200/80 text-verde-floresta hover:border-terracota-400/50 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        checado ? 'bg-emerald-500 border-emerald-600 text-white' : 'border-zinc-300 bg-zinc-50'
                      }`}>
                        {checado && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-semibold truncate">
                        {ing.nome}
                      </span>
                    </div>

                    <span className="font-mono text-xs font-bold text-terracota-600 bg-terracota-50 px-2.5 py-1 rounded-lg flex-shrink-0">
                      {parseFloat(ing.quantidade)} {ing.unidade_medida}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Coluna de Modo de Preparo */}
          <div className="lg:col-span-7 space-y-4">
            <div className="border-b border-zinc-200 pb-3">
              <h2 className="text-xl font-bold text-verde-floresta font-heading flex items-center gap-2">
                <span>👩‍🍳</span> Modo de Preparo
              </h2>
            </div>

            <div className="space-y-4 pt-1">
              {passosModoPreparo.length > 0 ? (
                passosModoPreparo.map((passo, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-sm hover:border-terracota-500/30 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-terracota-600 to-terracota-500 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                      {idx + 1}
                    </div>
                    <p className="text-sm sm:text-base text-verde-floresta leading-relaxed pt-0.5">
                      {passo}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-cinza-ardosia italic whitespace-pre-line">
                  {receita.instrucoes}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* --- SEÇÃO DE AVALIAÇÕES E COMENTÁRIOS --- */}
        <div className="pt-8 border-t border-zinc-200">
          <ComentariosSecao
            idReceita={id}
            aoAtualizarStats={atualizarStatsAvaliacao}
          />
        </div>

      </div>
    </div>
  );
}