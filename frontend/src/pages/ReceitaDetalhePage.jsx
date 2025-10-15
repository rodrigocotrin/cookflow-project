// Arquivo: src/pages/ReceitaDetalhePage.jsx
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContexto } from '../context/AuthContexto';
import ComentariosSecao from '../components/ComentariosSecao';
import AvaliacaoEstrelas from '../components/AvaliacaoEstrelas'; // Importa o componente unificado

// --- ÍCONES PARA OS BOTÕES DE AÇÃO E INFORMAÇÕES ---
function IconeCaneta() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
  );
}

function IconeLixeira() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function IconeRelogio() {
  return (<span role="img" aria-label="tempo" className="mr-1">🕛</span>);
}
function IconeDificuldade() {
  return (<span role="img" aria-label="dificuldade" className="mr-1">🍽️</span>);
}


export default function ReceitaDetalhePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [receita, setReceita] = useState(null);
    const [loading, setLoading] = useState(true);
    const [eFavorito, setEFavorito] = useState(false);
    const { assinado, utilizador } = useContext(AuthContexto);

    useEffect(() => {
        async function carregarDados() {
            try {
                const promessas = [api.get(`/receitas/${id}`)];
                if (assinado) {
                    promessas.push(api.get('/perfil/favoritos'));
                }
                const [respostaReceita, respostaFavoritos] = await Promise.all(promessas);
                setReceita(respostaReceita.data);
                if (respostaFavoritos) {
                    const favoritos = respostaFavoritos.data;
                    const favoritoEncontrado = favoritos.some(fav => fav.id_receita === parseInt(id, 10));
                    setEFavorito(favoritoEncontrado);
                }
            } catch (erro) {
                console.error("Erro ao buscar dados da receita:", erro);
                navigate('/');
            } finally {
                setLoading(false);
            }
        }
        carregarDados();
    }, [id, assinado, navigate]);

    const handleFavoritar = async () => {
        try {
            await api.post(`/receitas/${id}/favoritar`);
            setEFavorito(true);
        } catch (erro) { console.error("Erro ao favoritar", erro); }
    };

    const handleDesfavoritar = async () => {
        try {
            await api.delete(`/receitas/${id}/favoritar`);
            setEFavorito(false);
        } catch (erro) { console.error("Erro ao desfavoritar", erro); }
    };

    const handleDeletar = async () => {
        if (window.confirm("Tem certeza de que deseja deletar esta receita?")) {
            try {
                await api.delete(`/receitas/${id}`);
                navigate('/');
            } catch (erro) {
                console.error("Erro ao deletar receita:", erro);
            }
        }
    };

    const getDificuldadeClass = (dificuldade) => {
        if (!dificuldade) return 'text-gray-600';
        switch (dificuldade) {
            case 'Fácil': return 'text-green-600';
            case 'Médio': return 'text-yellow-600';
            case 'Difícil': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    if (loading) return <p className="text-center text-cinza-ardosia py-10">Carregando receita...</p>;
    if (!receita) return <p className="text-center text-red-500 py-10">Receita não encontrada.</p>;

    const eDono = assinado && utilizador.id_usuario === receita.id_usuario;

    return (
        <div className="bg-creme min-h-screen py-10">
            <div className="max-w-3xl mx-auto">
                <div className="w-full h-80 rounded-2xl shadow-lg overflow-hidden mb-6">
                    <img
                        src={receita.url_imagem}
                        alt={receita.titulo}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-start border-b border-gray-200 pb-4 mb-4">
                        <div>
                            <span className="bg-terracota-100 text-terracota-800 text-sm font-semibold px-0.5 py-1 rounded-full mb-3 inline-block">
                                {receita.nome_categoria}
                            </span>
                            <h1 className="text-4xl font-bold text-verde-floresta">{receita.titulo}</h1>
                            <p className="text-md text-cinza-ardosia mt-1">por: {receita.nome_usuario}</p>
                        </div>
                        <div className="flex gap-3 flex-shrink-0 mt-2">
                            {eDono && (
                                <>
                                    <Link to={`/receita/${id}/editar`} className="flex items-center gap-2 bg-cinza-ardosia text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">
                                        <IconeCaneta /> Editar
                                    </Link>
                                    <button onClick={handleDeletar} className="flex items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                                        <IconeLixeira /> Deletar
                                    </button>
                                </>
                            )}
                            {assinado && !eDono && (
                                eFavorito ? (
                                    <button onClick={handleDesfavoritar} className="bg-yellow-500 text-white font-bold py-2 px-5 rounded-lg hover:bg-yellow-600 transition-colors">Remover Favorito</button>
                                ) : (
                                    <button onClick={handleFavoritar} className="bg-yellow-400 text-white font-bold py-2 px-5 rounded-lg hover:bg-yellow-500 transition-colors">Favoritar ☆</button>
                                )
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                        <div className="flex items-center gap-2">
                            {receita.total_avaliacoes > 0 ? (
                                <>
                                    <span className="font-bold text-xl text-verde-floresta">{parseFloat(receita.media_avaliacoes).toFixed(1)}</span>
                                    {/* USANDO O COMPONENTE CENTRALIZADO E CORRIGIDO */}
                                    <AvaliacaoEstrelas tamanho="w-6 h-6" valorInicial={receita.media_avaliacoes} />
                                    <span className="text-cinza-ardosia">({receita.total_avaliacoes} avaliações)</span>
                                </>
                            ) : (
                                <span className="text-cinza-ardosia italic">Ainda não há avaliações</span>
                            )}
                        </div>
                        <div className="flex items-center gap-6 text-lg">
                            <div className="flex items-center font-semibold">
                                <IconeRelogio />
                                <span>{receita.tempo_preparo_minutos} min</span>
                            </div>
                            <div className="flex items-center">
                                <IconeDificuldade />
                                <span className={`font-semibold ${getDificuldadeClass(receita.dificuldade)}`}>{receita.dificuldade}</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-cinza-ardosia text-lg mb-10">{receita.descricao}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="md:col-span-1">
                            <h2 className="text-2xl font-bold text-verde-floresta mb-4">Ingredientes</h2>
                            <ul className="space-y-3">
                                {receita.ingredientes.map((ing, index) => (
                                    <li key={index} className="flex items-baseline justify-between border-b border-gray-100 py-2">
                                        <span className="text-cinza-ardosia flex-grow mr-4">{ing.nome}</span>
                                        <span className="font-mono text-verde-floresta font-semibold whitespace-nowrap">{parseFloat(ing.quantidade)} {ing.unidade_medida}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="md:col-span-2">
                            <h2 className="text-2xl font-bold text-verde-floresta mb-4">Modo de Preparo</h2>
                            <div className="prose max-w-none text-cinza-ardosia text-lg whitespace-pre-line leading-relaxed">{receita.instrucoes}</div>
                        </div>
                    </div>

                    <hr className="my-10 border-t-2 border-gray-100" />
                    
                    <ComentariosSecao idReceita={id} />
                </div>
            </div>
        </div>
    );
}