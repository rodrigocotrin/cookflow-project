// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import api from '../services/api'; // Importa nossa instância do axios

export default function HomePage() {
  // Cria um estado 'receitas' para armazenar a lista de receitas
  const [receitas, setReceitas] = useState([]);
  // Cria um estado 'loading' para sabermos quando os dados estão sendo carregados
  const [loading, setLoading] = useState(true);

  // useEffect é executado quando o componente é montado na tela
  useEffect(() => {
    // Função assíncrona para buscar os dados
    async function carregarReceitas() {
      try {
        // Faz a requisição GET para o endpoint '/receitas' da nossa API
        const resposta = await api.get('/receitas');
        // Atualiza o estado 'receitas' com os dados recebidos
        setReceitas(resposta.data);
      } catch (erro) {
        console.error("Erro ao buscar receitas:", erro);
      } finally {
        // Define o loading como falso, independentemente do resultado
        setLoading(false);
      }
    }

    carregarReceitas();
  }, []); // O array vazio [] garante que isso só rode uma vez

  // Se estiver carregando, exibe uma mensagem
  if (loading) {
    return <p className="text-center text-gray-500">Carregando receitas...</p>;
  }

  // Renderiza a lista de receitas
  return (
    <div>
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Nossas Receitas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {receitas.map((receita) => (
          <div key={receita.id_receita} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-green-600">{receita.titulo}</h2>
            <p className="text-gray-600 mt-2">por: {receita.nome_usuario}</p>
            <p className="text-gray-800 mt-4">{receita.descricao}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">{receita.nome_categoria}</span>
              <span className="bg-yellow-200 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{receita.dificuldade}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}