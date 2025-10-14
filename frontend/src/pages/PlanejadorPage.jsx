// Arquivo: src/pages/PlanejadorPage.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

// --- COMPONENTES DE UI (ÍCONES E AVATAR) ---

function IconeChevron({ estaAberto }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${estaAberto ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function IconeLixeira() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
  );
}

function AvatarReceita({ titulo }) {
  const inicial = titulo ? titulo.charAt(0).toUpperCase() : '?';
  return (
    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm flex-shrink-0">
      {inicial}
    </div>
  );
}

export default function PlanejadorPage() {
  const [receitasSelecionaveis, setReceitasSelecionaveis] = useState([]);
  const [receitasSelecionadas, setReceitasSelecionadas] = useState(new Set());
  const [listaDeCompras, setListaDeCompras] = useState([]);
  const [itensMarcados, setItensMarcados] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [detalhesVisiveis, setDetalhesVisiveis] = useState(null);

  useEffect(() => {
    async function carregarReceitas() {
      try {
        const resposta = await api.get('/planejador/receitas');
        setReceitasSelecionaveis(resposta.data);
      } catch (err) {
        setErro('Não foi possível carregar as suas receitas.');
        console.error("Erro ao carregar receitas para o planejador:", err);
      } finally {
        setLoading(false);
      }
    }
    carregarReceitas();
  }, []);

  const handleSelecaoReceita = (id) => {
    const novasSelecoes = new Set(receitasSelecionadas);
    novasSelecoes.has(id) ? novasSelecoes.delete(id) : novasSelecoes.add(id);
    setReceitasSelecionadas(novasSelecoes);
  };

  const handleGerarLista = async () => {
    if (receitasSelecionadas.size === 0) {
      alert('Por favor, selecione pelo menos uma receita.');
      return;
    }
    try {
      const ids_receitas = Array.from(receitasSelecionadas);
      const resposta = await api.post('/lista-de-compras', { ids_receitas });
      setListaDeCompras(resposta.data);
      setItensMarcados(new Set());
      setDetalhesVisiveis(null);
    } catch (err) {
      setErro('Ocorreu um erro ao gerar a sua lista de compras.');
      console.error("Erro ao gerar lista de compras:", err);
    }
  };

  const handleMarcarItem = (chaveItem) => {
    const novosMarcados = new Set(itensMarcados);
    novosMarcados.has(chaveItem) ? novosMarcados.delete(chaveItem) : novosMarcados.add(chaveItem);
    setItensMarcados(novosMarcados);
  };

  const handleLimparMarcados = () => {
    const novaLista = listaDeCompras.filter(item => {
        const chaveItem = `${item.nome}_${item.unidade_medida}`;
        return !itensMarcados.has(chaveItem);
    });
    setListaDeCompras(novaLista);
    setItensMarcados(new Set());
  };

  const toggleDetalhes = (chaveItem) => {
    setDetalhesVisiveis(detalhesVisiveis === chaveItem ? null : chaveItem);
  };

  if (loading) return <p className="text-center text-gray-500">A carregar o planejador...</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold text-gray-800">Planejador de Compras</h1>
        <p className="text-xl text-gray-600 mt-2">Escolha as receitas e nós criamos a sua lista de compras otimizada.</p>
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Escolha as Receitas</h2>
        {erro && <p className="text-red-500 mb-4">{erro}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {receitasSelecionaveis.length > 0 ? (
            receitasSelecionaveis.map(receita => (
              <div key={receita.id_receita} onClick={() => handleSelecaoReceita(receita.id_receita)}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                  receitasSelecionadas.has(receita.id_receita) ? 'bg-green-50 border-green-500' : 'bg-gray-50 hover:bg-gray-100 border-transparent'
                }`}
              >
                <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 pointer-events-none"
                  checked={receitasSelecionadas.has(receita.id_receita)} readOnly />
                <span className="ml-3 font-medium text-gray-800">{receita.titulo}</span>
              </div>
            ))
          ) : (
             <p className="text-gray-500 p-4 col-span-full">Você precisa criar ou favoritar receitas para usar o planejador.</p>
          )}
        </div>
      </div>

      <div className="text-center mb-8">
        <button onClick={handleGerarLista} disabled={receitasSelecionadas.size === 0}
          className="bg-green-600 text-white py-4 px-10 rounded-lg font-bold text-xl hover:bg-green-700 disabled:bg-gray-400 transition-transform transform hover:scale-105 shadow-md disabled:cursor-not-allowed">
          Gerar Lista de Compras ({receitasSelecionadas.size})
        </button>
      </div>

      {listaDeCompras.length > 0 && (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-700">Sua Lista de Compras</h2>
            {itensMarcados.size > 0 && (
              <button onClick={handleLimparMarcados} className="flex items-center text-sm bg-red-100 text-red-700 py-2 px-4 rounded-md hover:bg-red-200 font-semibold transition-colors">
                <IconeLixeira /> Limpar {itensMarcados.size} {itensMarcados.size === 1 ? 'item' : 'itens'}
              </button>
            )}
          </div>
          <ul className="space-y-2">
            {listaDeCompras.map((item) => {
              const chaveItem = `${item.nome}_${item.unidade_medida}`;
              const estaMarcado = itensMarcados.has(chaveItem);
              const estaExpandido = detalhesVisiveis === chaveItem;

              return (
                <li key={chaveItem} className="border rounded-lg p-4 transition-colors duration-300 bg-gray-50 hover:bg-gray-100">
                  <div className="flex items-center">
                    <input type="checkbox" id={chaveItem} onChange={() => handleMarcarItem(chaveItem)} checked={estaMarcado}
                      className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"/>
                    <label htmlFor={chaveItem} className={`ml-4 flex-grow flex justify-between items-center cursor-pointer transition-colors ${estaMarcado ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      <span className="font-medium">{item.nome}</span>
                      <span className="font-bold text-lg">{item.quantidade_total} {item.unidade_medida}</span>
                    </label>
                    <button onClick={() => toggleDetalhes(chaveItem)} className="ml-4 p-1 rounded-full hover:bg-gray-200">
                      <IconeChevron estaAberto={estaExpandido} />
                    </button>
                  </div>
                  {estaExpandido && (
                    <div className="pl-10 mt-3 pt-3 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">Detalhes:</h4>
                      <div className="space-y-2">
                        {item.fontes.map((fonte, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <AvatarReceita titulo={fonte.receita} />
                            <span className="text-gray-600 flex-grow">{fonte.receita}:</span>
                            <span className="font-medium text-gray-800">{fonte.quantidade} {item.unidade_medida}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  );
}