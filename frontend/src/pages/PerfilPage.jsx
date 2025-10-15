// Arquivo: src/pages/PerfilPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import AvaliacaoEstrelas from '../components/AvaliacaoEstrelas'; // Certifique-se que o caminho está correto

// --- ÍCONES PARA A UI ---
function IconeCalendario() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-cinza-ardosia" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
}
function IconeLivro() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 p-1 text-terracota-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
}
function IconeCoracao() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 p-1 text-terracota-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 21l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>;
}
function IconeComentario() {
    return <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 p-1 text-terracota-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
}

// --- COMPONENTES INTERNOS ---
function AvatarUsuario({ nome }) {
  const inicial = nome ? nome.charAt(0).toUpperCase() : '?';
  return (
    <div className="w-24 h-24 rounded-full bg-terracota-500/20 flex items-center justify-center text-terracota-600 font-bold text-5xl flex-shrink-0 border-4 border-white shadow-md">
      {inicial}
    </div>
  );
}

function CartaoReceita({ receita, autor }) {
  const imagemPadrao = "https://i.imgur.com/MuWdBYb.png";
  return (
    <Link to={`/receita/${receita.id_receita}`} className="bg-white p-4 rounded-xl shadow-sm border border-black/5 hover:shadow-lg hover:border-terracota-500/30 transition-all duration-300 flex items-center gap-4">
      <img src={receita.url_imagem || imagemPadrao} alt={receita.titulo} className="w-24 h-24 object-cover rounded-lg flex-shrink-0 bg-zinc-100" />
      <div className="flex-grow">
        <h3 className="font-bold text-lg text-verde-floresta group-hover:underline">{receita.titulo}</h3>
        {receita.descricao && <p className="text-sm text-cinza-ardosia line-clamp-2 mt-1">{receita.descricao}</p>}
        {autor && <p className="text-sm text-cinza-ardosia mt-2">por: <span className="font-semibold">{autor}</span></p>}
      </div>
    </Link>
  );
}

function CartaoAvaliacao({ avaliacao }) {
    const imagemPadrao = "https://i.imgur.com/MuWdBYb.png";
    return (
        <Link 
            to={`/receita/${avaliacao.id_receita}#comentarios`} 
            className="group bg-white p-4 rounded-xl shadow-sm border border-black/5 hover:shadow-lg hover:border-terracota-500/30 transition-all duration-300 flex flex-col sm:flex-row items-start gap-4"
        >
            <img src={avaliacao.url_imagem || imagemPadrao} alt={avaliacao.titulo} className="w-full sm:w-32 h-32 object-cover rounded-lg flex-shrink-0 bg-zinc-100" />
            <div className="flex-grow">
                <h3 className="font-bold text-lg text-verde-floresta">{avaliacao.titulo}</h3>
                <div className="my-2">
                    <AvaliacaoEstrelas valorInicial={avaliacao.nota} />
                </div>
                <p className="text-cinza-ardosia italic">"{avaliacao.conteudo}"</p>
                <p className="text-sm text-zinc-400 mt-2 text-right">
                    {new Date(avaliacao.data_criacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
            </div>
        </Link>
    );
}


export default function PerfilPage() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('minhas');

  useEffect(() => {
    async function carregarDadosDoPerfil() {
      try {
        const { data } = await api.get('/perfil/completo');
        setPerfil(data);
      } catch (erro) {
        console.error("Erro ao carregar dados do perfil:", erro);
      } finally {
        setLoading(false);
      }
    }
    carregarDadosDoPerfil();
  }, []);

  if (loading) {
    return <p className="text-center text-cinza-ardosia mt-10">A carregar perfil...</p>;
  }
  if (!perfil) {
    return <p className="text-center text-red-500 mt-10">Não foi possível carregar o perfil.</p>;
  }
  
  const dataFormatada = new Date(perfil.usuario.data_criacao).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-creme min-h-screen">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        {/* CARTÃO DE PERFIL --- SEÇÃO ALTERADA --- */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center gap-8 mb-10 border border-black/5">
          <AvatarUsuario nome={perfil.usuario.nome} />
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-4xl font-bold text-verde-floresta">{perfil.usuario.nome}</h1>
            <div className="flex items-center justify-center md:justify-start text-md text-cinza-ardosia mt-2">
              <IconeCalendario />
              <span>Membro desde {dataFormatada}</span>
            </div>
          </div>
          
          {/* --- NOVO LAYOUT PARA AS ESTATÍSTICAS --- */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 mt-4 md:mt-0">
            <div className="flex items-center gap-3">
              <IconeLivro />
              <div>
                <p className="text-2xl font-bold text-verde-floresta leading-tight">{perfil.minhasReceitas.length}</p>
                <p className="text-sm text-cinza-ardosia">Receitas</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <IconeCoracao />
              <div>
                <p className="text-2xl font-bold text-verde-floresta leading-tight">{perfil.receitasFavoritas.length}</p>
                <p className="text-sm text-cinza-ardosia">Favoritos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <IconeComentario />
              <div>
                <p className="text-2xl font-bold text-verde-floresta leading-tight">{perfil.minhasAvaliacoes.length}</p>
                <p className="text-sm text-cinza-ardosia">Avaliações</p>
              </div>
            </div>
          </div>
        </div>

        {/* ABAS DE NAVEGAÇÃO */}
        <div className="mb-8">
          <div className="border-b border-zinc-300">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button onClick={() => setAbaAtiva('minhas')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors ${abaAtiva === 'minhas' ? 'border-terracota-500 text-terracota-600' : 'border-transparent text-cinza-ardosia hover:text-verde-floresta hover:border-zinc-400'}`}>
                Minhas Receitas
              </button>
              <button onClick={() => setAbaAtiva('favoritas')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors ${abaAtiva === 'favoritas' ? 'border-terracota-500 text-terracota-600' : 'border-transparent text-cinza-ardosia hover:text-verde-floresta hover:border-zinc-400'}`}>
                Receitas Favoritas
              </button>
              <button onClick={() => setAbaAtiva('avaliacoes')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors ${abaAtiva === 'avaliacoes' ? 'border-terracota-500 text-terracota-600' : 'border-transparent text-cinza-ardosia hover:text-verde-floresta hover:border-zinc-400'}`}>
                Minhas Avaliações
              </button>
            </nav>
          </div>
        </div>

        {/* CONTEÚDO DAS ABAS */}
        <div>
          {abaAtiva === 'minhas' && (
            <div className="space-y-4">
              {perfil.minhasReceitas.length > 0 ? (
                perfil.minhasReceitas.map(receita => <CartaoReceita key={receita.id_receita} receita={receita} />)
              ) : (
                <p className="text-cinza-ardosia text-center py-10">Você ainda não publicou nenhuma receita.</p>
              )}
            </div>
          )}
          {abaAtiva === 'favoritas' && (
            <div className="space-y-4">
              {perfil.receitasFavoritas.length > 0 ? (
                perfil.receitasFavoritas.map(receita => <CartaoReceita key={receita.id_receita} receita={receita} autor={receita.nome_usuario} />)
              ) : (
                <p className="text-cinza-ardosia text-center py-10">Você ainda não favoritou nenhuma receita.</p>
              )}
            </div>
          )}
          {abaAtiva === 'avaliacoes' && (
            <div className="space-y-4">
              {perfil.minhasAvaliacoes.length > 0 ? (
                perfil.minhasAvaliacoes.map(avaliacao => <CartaoAvaliacao key={avaliacao.id_comentario} avaliacao={avaliacao} />)
              ) : (
                <p className="text-cinza-ardosia text-center py-10">Você ainda não fez nenhuma avaliação.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}