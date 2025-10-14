// src/pages/ReceitaDetalhePage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api'; // Verifique se o caminho está correto

export default function ReceitaDetalhePage() {
  // O hook useParams() pega os parâmetros dinâmicos da URL (no nosso caso, o :id)
  const { id } = useParams();
  const [receita, setReceita] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarReceita() {
      try {
        // Faz a requisição para o endpoint de detalhe da receita no backend
        const resposta = await api.get(`/receitas/${id}`);
        setReceita(resposta.data);
      } catch (erro) {
        console.error("Erro ao buscar detalhes da receita:", erro);
      } finally {
        setLoading(false);
      }
    }

    carregarReceita();
  }, [id]); // O efeito depende do 'id', se o id mudar, ele busca novamente

  if (loading) {
    return <p className="text-center text-gray-500 mt-8">A carregar detalhes da receita...</p>;
  }

  if (!receita) {
    return <p className="text-center text-red-500 mt-8">Receita não encontrada.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
      {/* Cabeçalho da Receita */}
      <div className="border-b pb-4 mb-6">
        <h1 className="text-4xl font-bold text-gray-800">{receita.titulo}</h1>
        <p className="text-gray-600 mt-2">por: {receita.nome_usuario}</p>
        <div className="flex items-center space-x-4 mt-4 text-gray-500">
          <span>Categoria: <span className="font-semibold text-green-600">{receita.nome_categoria}</span></span>
          <span>Dificuldade: <span className="font-semibold text-yellow-600">{receita.dificuldade}</span></span>
          <span>Tempo: <span className="font-semibold">{receita.tempo_preparo_minutos} min</span></span>
        </div>
        <p className="mt-4 text-gray-700">{receita.descricao}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Lista de Ingredientes */}
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

        {/* Modo de Preparo */}
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