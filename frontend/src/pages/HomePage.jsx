// src/pages/HomePage.jsx (VERSÃO COMPLETA E CORRIGIDA)
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function HomePage() {
  // --- ESTA PARTE ESTAVA EM FALTA ---
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarReceitas() {
      try {
        const resposta = await api.get('/receitas');
        setReceitas(resposta.data);
      } catch (erro) {
        console.error("Erro ao buscar receitas:", erro);
      } finally {
        setLoading(false);
      }
    }
    carregarReceitas();
  }, []);
  // ------------------------------------

  if (loading) {
    return <p className="text-center text-gray-500">A carregar receitas...</p>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Nossas Receitas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {receitas.map((receita) => (
          // O Link que adicionámos antes
          <Link to={`/receita/${receita.id_receita}`} key={receita.id_receita} className="block hover:shadow-xl transition-shadow duration-300">
            <div className="bg-white rounded-lg shadow-md p-6 h-full">
              <h2 className="text-2xl font-bold text-green-600">{receita.titulo}</h2>
              <p className="text-gray-600 mt-2">por: {receita.nome_usuario}</p>
              <p className="text-gray-800 mt-4 line-clamp-3">{receita.descricao}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">{receita.nome_categoria}</span>
                <span className="bg-yellow-200 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{receita.dificuldade}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}