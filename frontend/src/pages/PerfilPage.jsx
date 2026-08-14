// Arquivo: src/pages/PerfilPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { resolverUrlImagem } from '../services/api';
import AvaliacaoEstrelas from '../components/AvaliacaoEstrelas';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContexto';

export default function PerfilPage() {
  const { usuario: usuarioLogado, logout } = useAuth();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('minhas'); // 'minhas', 'favoritas', 'avaliacoes'

  const carregarDadosDoPerfil = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/perfil/completo');
      setPerfil(data);
    } catch (erro) {
      console.error("Erro ao carregar dados do perfil:", erro);
      toast.error('Não foi possível carregar seu perfil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosDoPerfil();
  }, []);

  const handleExcluirReceita = async (id_receita, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm('Tem certeza que deseja excluir esta receita permanentemente?')) {
      return;
    }

    try {
      await api.delete(`/receitas/${id_receita}`);
      toast.success('Receita excluída com sucesso.');
      carregarDadosDoPerfil();
    } catch (err) {
      toast.error('Erro ao excluir receita.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-10 space-y-6 animate-pulse">
        <div className="h-44 bg-zinc-200 rounded-3xl"></div>
        <div className="h-10 bg-zinc-200 rounded-xl w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-28 bg-zinc-200 rounded-2xl"></div>
          <div className="h-28 bg-zinc-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 font-bold">Não foi possível carregar os dados do seu perfil.</p>
        <button onClick={carregarDadosDoPerfil} className="btn-primary mt-4 py-2 px-6 text-sm">
          Tentar Novamente
        </button>
      </div>
    );
  }

  const dataFormatada = new Date(perfil.usuario.data_criacao).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const inicial = perfil.usuario.nome ? perfil.usuario.nome.charAt(0).toUpperCase() : '?';

  return (
    <div className="max-w-5xl mx-auto space-y-8 selection:bg-terracota-500 selection:text-white pb-16">
      <Helmet>
        <title>Meu Perfil — CookFlow</title>
      </Helmet>

      {/* --- HERO DO PERFIL --- */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-card border border-white/80 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Info do Usuário */}
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-terracota-500 to-terracota-600 flex items-center justify-center text-white font-extrabold text-4xl shadow-lg shadow-terracota-500/30 flex-shrink-0 border-2 border-white">
            {inicial}
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-verde-floresta/10 text-verde-floresta px-2.5 py-0.5 rounded-full text-[11px] font-bold">
              <span>👨‍🍳</span> Chef CookFlow
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-verde-floresta font-heading">
              {perfil.usuario.nome}
            </h1>
            <p className="text-xs text-cinza-ardosia">
              {perfil.usuario.email} • Membro desde {dataFormatada}
            </p>
          </div>
        </div>

        {/* Métricas e Estatísticas */}
        <div className="flex items-center gap-3 sm:gap-4 bg-creme-100/70 p-3 sm:p-4 rounded-2xl border border-zinc-200/70">
          <div className="text-center px-2 sm:px-3">
            <p className="text-xl sm:text-2xl font-black text-verde-floresta leading-tight">
              {perfil.minhasReceitas.length}
            </p>
            <p className="text-[11px] font-bold text-cinza-ardosia uppercase tracking-wider">Criadas</p>
          </div>

          <div className="h-8 w-px bg-zinc-300"></div>

          <div className="text-center px-2 sm:px-3">
            <p className="text-xl sm:text-2xl font-black text-terracota-500 leading-tight">
              {perfil.receitasFavoritas.length}
            </p>
            <p className="text-[11px] font-bold text-cinza-ardosia uppercase tracking-wider">Favoritas</p>
          </div>

          <div className="h-8 w-px bg-zinc-300"></div>

          <div className="text-center px-2 sm:px-3">
            <p className="text-xl sm:text-2xl font-black text-verde-floresta leading-tight">
              {perfil.minhasAvaliacoes.length}
            </p>
            <p className="text-[11px] font-bold text-cinza-ardosia uppercase tracking-wider">Reviews</p>
          </div>
        </div>
      </div>

      {/* --- ABAS DE NAVEGAÇÃO --- */}
      <div className="flex border-b border-zinc-200 gap-4 sm:gap-8 overflow-x-auto pb-px">
        <button
          onClick={() => setAbaAtiva('minhas')}
          className={`pb-3 text-sm font-bold transition-all whitespace-nowrap border-b-2 flex items-center gap-2 ${
            abaAtiva === 'minhas'
              ? 'border-terracota-500 text-terracota-600'
              : 'border-transparent text-cinza-ardosia hover:text-verde-floresta'
          }`}
        >
          <span>🍳 Minhas Receitas</span>
          <span className="text-xs px-2 py-0.5 bg-zinc-100 rounded-full font-bold">
            {perfil.minhasReceitas.length}
          </span>
        </button>

        <button
          onClick={() => setAbaAtiva('favoritas')}
          className={`pb-3 text-sm font-bold transition-all whitespace-nowrap border-b-2 flex items-center gap-2 ${
            abaAtiva === 'favoritas'
              ? 'border-terracota-500 text-terracota-600'
              : 'border-transparent text-cinza-ardosia hover:text-verde-floresta'
          }`}
        >
          <span>❤️ Receitas Favoritas</span>
          <span className="text-xs px-2 py-0.5 bg-zinc-100 rounded-full font-bold">
            {perfil.receitasFavoritas.length}
          </span>
        </button>

        <button
          onClick={() => setAbaAtiva('avaliacoes')}
          className={`pb-3 text-sm font-bold transition-all whitespace-nowrap border-b-2 flex items-center gap-2 ${
            abaAtiva === 'avaliacoes'
              ? 'border-terracota-500 text-terracota-600'
              : 'border-transparent text-cinza-ardosia hover:text-verde-floresta'
          }`}
        >
          <span>⭐ Minhas Avaliações</span>
          <span className="text-xs px-2 py-0.5 bg-zinc-100 rounded-full font-bold">
            {perfil.minhasAvaliacoes.length}
          </span>
        </button>
      </div>

      {/* --- CONTEÚDO DAS ABAS --- */}
      <div>
        {/* ABA: MINHAS RECEITAS */}
        {abaAtiva === 'minhas' && (
          <div>
            {perfil.minhasReceitas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {perfil.minhasReceitas.map(receita => {
                  const urlImg = resolverUrlImagem(receita.url_imagem);
                  return (
                    <div
                      key={receita.id_receita}
                      className="glass-panel p-4 rounded-2xl border border-white/80 shadow-sm hover:shadow-card transition-all flex gap-4 items-center group"
                    >
                      <Link to={`/receita/${receita.id_receita}`} className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-100">
                        <img
                          src={urlImg}
                          alt={receita.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                      </Link>

                      <div className="flex-grow min-w-0 space-y-1">
                        <Link to={`/receita/${receita.id_receita}`}>
                          <h3 className="font-bold text-verde-floresta text-base truncate group-hover:text-terracota-500 transition-colors">
                            {receita.titulo}
                          </h3>
                        </Link>
                        <p className="text-xs text-cinza-ardosia line-clamp-1">
                          {receita.descricao || 'Sem descrição.'}
                        </p>
                        <p className="text-[11px] text-cinza-ardosia">
                          ⏱️ {receita.tempo_preparo_minutos} min • 🟢 {receita.dificuldade}
                        </p>

                        <div className="flex items-center gap-3 pt-1">
                          <Link
                            to={`/receitas/editar/${receita.id_receita}`}
                            className="text-xs font-bold text-verde-floresta hover:text-terracota-500 flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Editar</span>
                          </Link>

                          <button
                            type="button"
                            onClick={(e) => handleExcluirReceita(receita.id_receita, e)}
                            className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Excluir</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 px-4 glass-panel rounded-3xl border border-dashed border-zinc-300 space-y-3">
                <div className="text-4xl">👨‍🍳</div>
                <h3 className="font-bold text-verde-floresta text-base">Você ainda não publicou receitas</h3>
                <p className="text-xs text-cinza-ardosia max-w-sm mx-auto">
                  Compartilhe seus pratos e segredos culinários com toda a comunidade CookFlow.
                </p>
                <Link to="/receitas/criar" className="btn-primary inline-block py-2.5 px-6 text-xs">
                  + Criar Nova Receita
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ABA: RECEITAS FAVORITAS */}
        {abaAtiva === 'favoritas' && (
          <div>
            {perfil.receitasFavoritas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {perfil.receitasFavoritas.map(receita => {
                  const urlImg = resolverUrlImagem(receita.url_imagem);
                  return (
                    <Link
                      key={receita.id_receita}
                      to={`/receita/${receita.id_receita}`}
                      className="glass-panel p-4 rounded-2xl border border-white/80 shadow-sm hover:shadow-card transition-all flex gap-4 items-center group"
                    >
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-100">
                        <img
                          src={urlImg}
                          alt={receita.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                      </div>

                      <div className="flex-grow min-w-0 space-y-1">
                        <h3 className="font-bold text-verde-floresta text-base truncate group-hover:text-terracota-500 transition-colors">
                          {receita.titulo}
                        </h3>
                        <p className="text-xs text-cinza-ardosia line-clamp-1">
                          {receita.descricao || 'Sem descrição.'}
                        </p>
                        <p className="text-[11px] text-cinza-ardosia">
                          Por: <span className="font-semibold text-verde-floresta">{receita.nome_usuario || 'Chef'}</span>
                        </p>
                        <span className="text-[11px] font-bold text-terracota-500 flex items-center gap-1">
                          Ver receita completa →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 px-4 glass-panel rounded-3xl border border-dashed border-zinc-300 space-y-3">
                <div className="text-4xl">❤️</div>
                <h3 className="font-bold text-verde-floresta text-base">Nenhuma receita favoritada ainda</h3>
                <p className="text-xs text-cinza-ardosia max-w-sm mx-auto">
                  Explore o catálogo de receitas e clique no coração para guardar suas favoritas!
                </p>
                <Link to="/" className="btn-primary inline-block py-2.5 px-6 text-xs">
                  Explorar Receitas
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ABA: MINHAS AVALIAÇÕES */}
        {abaAtiva === 'avaliacoes' && (
          <div>
            {perfil.minhasAvaliacoes.length > 0 ? (
              <div className="space-y-4">
                {perfil.minhasAvaliacoes.map(avaliacao => {
                  const urlImg = resolverUrlImagem(avaliacao.url_imagem);
                  return (
                    <Link
                      key={avaliacao.id_comentario}
                      to={`/receita/${avaliacao.id_receita}#comentarios`}
                      className="glass-panel p-5 rounded-2xl border border-white/80 shadow-sm hover:shadow-card transition-all flex flex-col sm:flex-row items-start gap-4 group"
                    >
                      <div className="w-full sm:w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-100">
                        <img
                          src={urlImg}
                          alt={avaliacao.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                      </div>

                      <div className="flex-grow space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-verde-floresta text-base group-hover:text-terracota-500 transition-colors">
                            {avaliacao.titulo}
                          </h3>
                          <span className="text-[11px] text-cinza-ardosia">
                            {new Date(avaliacao.data_criacao).toLocaleDateString('pt-BR')}
                          </span>
                        </div>

                        <div>
                          <AvaliacaoEstrelas valorInicial={avaliacao.nota} apenasLeitura={true} tamanho="sm" />
                        </div>

                        <p className="text-xs text-cinza-ardosia italic bg-creme-100/60 p-3 rounded-xl">
                          "{avaliacao.conteudo}"
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 px-4 glass-panel rounded-3xl border border-dashed border-zinc-300 space-y-3">
                <div className="text-4xl">⭐</div>
                <h3 className="font-bold text-verde-floresta text-base">Você ainda não avaliou receitas</h3>
                <p className="text-xs text-cinza-ardosia max-w-sm mx-auto">
                  Deixe seu feedback e avaliações nas receitas que experimentar!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}