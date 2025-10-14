// Arquivo: src/pages/PerfilPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function PerfilPage() {
  const [minhasReceitas, setMinhasReceitas] = useState([]);
  const [receitasFavoritas, setReceitasFavoritas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDadosDoPerfil() {
      try {
        // Usa Promise.all para buscar os dois conjuntos de dados em paralelo
        const [respostaMinhasReceitas, respostaFavoritas] = await Promise.all([
          api.get('/perfil/minhas-receitas'),
          api.get('/perfil/favoritos')
        ]);

        setMinhasReceitas(respostaMinhasReceitas.data);
        setReceitasFavoritas(respostaFavoritas.data);

      } catch (erro) {
        console.error("Erro ao carregar dados do perfil:", erro);
      } finally {
        setLoading(false);
      }
    }

    carregarDadosDoPerfil();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">A carregar perfil...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Meu Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Secção Minhas Receitas */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Minhas Receitas Publicadas</h2>
          {minhasReceitas.length > 0 ? (
            <ul className="space-y-4">
              {minhasReceitas.map(receita => (
                <li key={receita.id_receita} className="bg-white p-4 rounded-lg shadow-sm">
                  <Link to={`/receita/${receita.id_receita}`} className="font-bold text-lg text-green-600 hover:underline">
                    {receita.titulo}
                  </Link>
                  <p className="text-sm text-gray-500 line-clamp-2">{receita.descricao}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Você ainda não publicou nenhuma receita.</p>
          )}
        </div>

        {/* Secção Receitas Favoritas */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Minhas Receitas Favoritas</h2>
          {receitasFavoritas.length > 0 ? (
            <ul className="space-y-4">
              {receitasFavoritas.map(receita => (
                <li key={receita.id_receita} className="bg-white p-4 rounded-lg shadow-sm">
                   <Link to={`/receita/${receita.id_receita}`} className="font-bold text-lg text-green-600 hover:underline">
                    {receita.titulo}
                  </Link>
                  <p className="text-sm text-gray-500">por: {receita.nome_usuario}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Você ainda não favoritou nenhuma receita.</p>
          )}
        </div>
      </div>
    </div>
  );
}