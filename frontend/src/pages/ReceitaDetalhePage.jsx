// Arquivo: src/pages/ReceitaDetalhePage.jsx
import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { AuthContexto } from '../context/AuthContexto';

export default function ReceitaDetalhePage() {
  const { id } = useParams();
  const [receita, setReceita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eFavorito, setEFavorito] = useState(false);
  const { assinado } = useContext(AuthContexto);

  useEffect(() => {
    async function carregarDados() {
      try {
        // Busca os detalhes da receita e, se o utilizador estiver logado, os seus favoritos
        const promessas = [api.get(`/receitas/${id}`)];
        if (assinado) {
          promessas.push(api.get('/perfil/favoritos'));
        }

        const [respostaReceita, respostaFavoritos] = await Promise.all(promessas);

        setReceita(respostaReceita.data);

        // Verifica se a receita atual está na lista de favoritos do utilizador
        if (respostaFavoritos) {
          const favoritos = respostaFavoritos.data;
          const favoritoEncontrado = favoritos.some(fav => fav.id_receita === parseInt(id, 10));
          setEFavorito(favoritoEncontrado);
        }

      } catch (erro) {
        console.error("Erro ao buscar dados da receita:", erro);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [id, assinado]);

  const handleFavoritar = async () => {
    try {
      await api.post(`/receitas/${id}/favoritar`);
      setEFavorito(true);
    } catch (erro) {
      console.error("Erro ao favoritar", erro);
    }
  };

  const handleDesfavoritar = async () => {
    try {
      await api.delete(`/receitas/${id}/favoritar`);
      setEFavorito(false);
    } catch (erro) {
      console.error("Erro ao desfavoritar", erro);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500 mt-8">A carregar detalhes da receita...</p>;
  }

  if (!receita) {
    return <p className="text-center text-red-500 mt-8">Receita não encontrada.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <div className="border-b pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">{receita.titulo}</h1>
            <p className="text-gray-600 mt-2">por: {receita.nome_usuario}</p>
          </div>
          {/* Botão de Favoritar Dinâmico */}
          {assinado && (
            <div>
              {eFavorito ? (
                <button onClick={handleDesfavoritar} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600">
                  Remover Favorito
                </button>
              ) : (
                <button onClick={handleFavoritar} className="bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600">
                  Favoritar
                </button>
              )}
            </div>
          )}
        </div>
        {/* Outras informações da receita */}
        <div className="flex items-center space-x-4 mt-4 text-gray-500">
          <span>Categoria: <span className="font-semibold text-green-600">{receita.nome_categoria}</span></span>
          <span>Dificuldade: <span className="font-semibold text-yellow-600">{receita.dificuldade}</span></span>
          <span>Tempo: <span className="font-semibold">{receita.tempo_preparo_minutos} min</span></span>
        </div>
        <p className="mt-4 text-gray-700">{receita.descricao}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ingredientes</h2>
          <ul className="space-y-2">
            {receita.ingredientes.map((ing, index) => (
              <li key={index} className="flex justify-between border-b py-1">
                <span>{ing.nome}</span>
                <span className="font-mono text-gray-600">{ing.quantidade} {ing.unidade_medida}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Modo de Preparo</h2>
          <div className="prose max-w-none text-gray-700 whitespace-pre-line">
            {receita.instrucoes}
          </div>
        </div>
      </div>
    </div>
  );
}