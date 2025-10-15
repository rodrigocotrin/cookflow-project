// Arquivo: src/pages/PlanejadorPage.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

// --- ÍCONES DE UI ---

function IconePrato() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.3,3H2.7C2.3,3,2,3.3,2,3.7v16.5C2,20.7,2.3,21,2.7,21h18.7c0.4,0,0.7-0.3,0.7-0.7V3.7C22,3.3,21.7,3,21.3,3z M21,19H3V5h18V19z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12,8c-2.2,0-4,1.8-4,4s1.8,4,4,4s4-1.8,4-4S14.2,8,12,8z M12,15c-1.7,0-3-1.3-3-3s1.3-3,3-3s3,1.3,3,3S13.7,15,12,15z" />
    </svg>
  );
}

function IconeLista() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-terracota-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}

function IconeCarrinho() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    );
}

function IconeCheck() {
    return (
        <div className="absolute top-2 right-2 w-5 h-5 bg-terracota-500 rounded-full flex items-center justify-center text-white z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
        </div>
    );
}

function IconeChevron({ estaAberto }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-cinza-ardosia transition-transform duration-300 ${estaAberto ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function AvatarReceita({ titulo }) {
  const inicial = titulo ? titulo.charAt(0).toUpperCase() : '?';
  return (
    <div className="w-8 h-8 rounded-full bg-terracota-500/20 flex items-center justify-center text-terracota-600 font-semibold text-sm flex-shrink-0">
      {inicial}
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---

export default function PlanejadorPage() {
  const [receitasSelecionaveis, setReceitasSelecionaveis] = useState([]);
  const [receitasSelecionadas, setReceitasSelecionadas] = useState(new Set());
  const [listaDeCompras, setListaDeCompras] = useState([]);
  const [itensMarcados, setItensMarcados] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [detalhesVisiveis, setDetalhesVisiveis] = useState(null);

  useEffect(() => {
    if (receitasSelecionadas.size === 0) {
      setListaDeCompras([]);
    }
  }, [receitasSelecionadas]);

  useEffect(() => {
    async function carregarReceitas() {
      try {
        // CORREÇÃO: A rota agora é a nova rota unificada.
        const resposta = await api.get('/lista-de-compras/receitas');
        setReceitasSelecionaveis(resposta.data);
      } catch (err) {
        setErro('Não foi possível carregar as suas receitas.');
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
      // A rota para gerar a lista continua a mesma.
      const resposta = await api.post('/lista-de-compras', { ids_receitas });
      setListaDeCompras(resposta.data);
      setItensMarcados(new Set());
      setDetalhesVisiveis(null);
    } catch (err) {
      setErro('Ocorreu um erro ao gerar a sua lista de compras.');
    }
  };
  
  const handleMarcarItem = (chaveItem) => {
    const novosMarcados = new Set(itensMarcados);
    novosMarcados.has(chaveItem) ? novosMarcados.delete(chaveItem) : novosMarcados.add(chaveItem);
    setItensMarcados(novosMarcados);
  };
  
  const toggleDetalhes = (chaveItem) => {
    setDetalhesVisiveis(detalhesVisiveis === chaveItem ? null : chaveItem);
  };

  if (loading) return <p className="text-center text-cinza-ardosia mt-10">Carregando planejador...</p>;

  return (
    <div className="bg-creme min-h-screen">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        
        <div className="text-center mb-10 flex flex-col items-center">
          <IconeLista />
          <h1 className="text-4xl md:text-5xl font-bold text-verde-floresta mt-4">Planejador de Compras</h1>
          <p className="text-lg text-cinza-ardosia mt-2 max-w-2xl">Escolha suas receitas e criamos uma lista inteligente para você.</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-md border border-black/5 mb-8">
          <h2 className="text-2xl font-semibold mb-1 text-verde-floresta">Passo 1: Escolha as Receitas</h2>
          <p className="text-cinza-ardosia mb-6">Selecionadas: <span className="font-bold text-terracota-500">{receitasSelecionadas.size}</span></p>
          
          {erro && <p className="text-red-500 mb-4">{erro}</p>}
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {receitasSelecionaveis.length > 0 ? (
              receitasSelecionaveis.map(receita => {
                const selecionada = receitasSelecionadas.has(receita.id_receita);
                return (
                  <div 
                    key={receita.id_receita} 
                    onClick={() => handleSelecaoReceita(receita.id_receita)}
                    className={`relative rounded-xl cursor-pointer transition-all duration-300 overflow-hidden group
                      ${selecionada ? 'ring-4 ring-terracota-500' : 'ring-2 ring-transparent hover:ring-terracota-500/50'}`}
                  >
                    {selecionada && <IconeCheck />}
                    
                    {receita.url_imagem ? (
                        <img src={receita.url_imagem} alt={receita.titulo} className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-110"/>
                    ) : (
                        <div className="h-32 w-full bg-zinc-200 flex items-center justify-center">
                            <IconePrato />
                        </div>
                    )}

                    <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black/80 to-transparent p-2 flex items-end">
                      <span className="text-white text-sm font-semibold">{receita.titulo}</span>
                    </div>
                  </div>
                );
              })
            ) : (
               <div className="text-cinza-ardosia p-4 col-span-full bg-zinc-100 rounded-lg text-center">
                  Você precisa criar ou favoritar receitas para usar o planejador.
              </div>
            )}
          </div>
        </div>

        <div className="text-center mb-10">
          <button 
            onClick={handleGerarLista} 
            disabled={receitasSelecionadas.size === 0}
            className="flex items-center justify-center w-full md:w-auto mx-auto bg-terracota-500 text-white py-3 px-8 rounded-xl font-bold text-lg hover:bg-terracota-600 disabled:bg-cinza-ardosia disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none">
            <IconeCarrinho />
            Gerar Lista de Compras
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-md border border-black/5">
          <h2 className="text-2xl md:text-3xl font-bold text-verde-floresta mb-6">Passo 2: Sua Lista</h2>
          
          {listaDeCompras.length > 0 ? (
            <ul className="space-y-1">
              {listaDeCompras.map((item) => {
                const chaveItem = `${item.nome}_${item.unidade_medida}`;
                const estaMarcado = itensMarcados.has(chaveItem);
                const estaExpandido = detalhesVisiveis === chaveItem;

                return (
                  <li key={chaveItem} className="border-b border-zinc-200 last:border-b-0 py-2">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id={chaveItem} 
                        onChange={() => handleMarcarItem(chaveItem)} 
                        checked={estaMarcado}
                        className="h-5 w-5 rounded border-zinc-300 text-terracota-500 focus:ring-terracota-500 cursor-pointer flex-shrink-0"
                      />
                      <div onClick={() => toggleDetalhes(chaveItem)} className="ml-4 flex-grow flex justify-between items-center cursor-pointer">
                        <span className={`font-medium text-verde-floresta transition-all ${estaMarcado ? 'line-through text-cinza-ardosia' : ''}`}>{item.nome}</span>
                        <div className="flex items-center">
                            <span className={`font-bold text-verde-floresta mr-4 transition-all ${estaMarcado ? 'text-cinza-ardosia' : ''}`}>{item.quantidade_total} {item.unidade_medida}</span>
                            <IconeChevron estaAberto={estaExpandido} />
                        </div>
                      </div>
                    </div>
                    <div className={`transition-all duration-500 ease-in-out grid ${estaExpandido ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <div className="pl-9 pt-4">
                            <div className="pt-3 border-t border-zinc-200">
                                <h4 className="text-sm font-semibold text-cinza-ardosia mb-2">Usado em:</h4>
                                <div className="space-y-2">
                                {item.fontes.map((fonte, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                    <AvatarReceita titulo={fonte.receita} />
                                    <span className="text-verde-floresta flex-grow">{fonte.receita}:</span>
                                    <span className="font-medium text-verde-floresta">{fonte.quantidade} {item.unidade_medida}</span>
                                    </div>
                                ))}
                                </div>
                            </div>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
              <div className="text-center py-10 px-6 border-2 border-dashed border-zinc-300 rounded-xl">
                  <h3 className="text-lg font-medium text-verde-floresta">Sua lista está vazia</h3>
                  <p className="mt-1 text-cinza-ardosia">Selecione as receitas e clique em "Gerar Lista" para começar.</p>
              </div>
          )}
        </div>

      </div>
    </div>
  );
}