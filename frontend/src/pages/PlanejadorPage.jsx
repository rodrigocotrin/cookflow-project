// Arquivo: src/pages/PlanejadorPage.jsx
import { useState, useEffect, useMemo } from 'react';
import api, { resolverUrlImagem } from '../services/api';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

// --- CATEGORIZAÇÃO INTELIGENTE DE SUPERMERCADO ---
const getCategoriaIngrediente = (nome) => {
  const nomeLower = nome.toLowerCase();
  const categorias = {
    '🥦 Hortifrúti & Feira': ['batata', 'tomate', 'pimentão', 'brócolis', 'espinafre', 'alface', 'pepino', 'abobrinha', 'berinjela', 'cenoura', 'ervilha', 'vagem', 'aipo', 'repolho', 'couve', 'couve-flor', 'batata-doce', 'jiló', 'quiabo', 'agrião', 'rúcula', 'nabo', 'rabanete', 'beterraba', 'alho', 'cebola', 'limão', 'lima', 'laranja', 'maçã', 'banana', 'morango', 'mirtilo', 'framboesa', 'abacate', 'abacaxi', 'manga', 'uva', 'pêssego', 'pera', 'uva passa', 'damasco', 'ameixa', 'figo', 'salsinha', 'cebolinha', 'coentro', 'hortelã'],
    '🥩 Açougue & Peixaria': ['frango', 'carne', 'bife', 'porco', 'bacon', 'linguiça', 'presunto', 'peixe', 'salmão', 'atum', 'camarão', 'lombo', 'costeleta', 'tilápia', 'cordeiro', 'peru', 'sardinha', 'lula', 'polvo', 'mexilhão', 'salsicha', 'mortadela', 'salame', 'carne moída', 'filé'],
    '🧀 Laticínios & Frios': ['leite', 'ovo', 'queijo', 'manteiga', 'creme de leite', 'iogurte', 'requeijão', 'ricota', 'nata', 'gorgonzola', 'cheddar', 'mussarela', 'parmesão', 'provolone'],
    '🌾 Mercearia & Grãos': ['farinha', 'arroz', 'macarrão', 'pão', 'aveia', 'trigo', 'milho', 'quinoa', 'lasanha', 'cuscuz', 'feijão', 'lentilha', 'grão-de-bico', 'soja', 'açúcar', 'sal', 'azeite', 'óleo', 'vinagre', 'fermento'],
    '🌿 Temperos & Molhos': ['pimenta', 'orégano', 'manjericão', 'canela', 'açafrão', 'páprica', 'gengibre', 'alecrim', 'tomilho', 'louro', 'cominho', 'noz-moscada', 'cravo', 'curry', 'colorau', 'shoyu', 'molho de tomate', 'extrato de tomate', 'ketchup', 'mostarda', 'maionese'],
    '🍫 Confeitaria & Doces': ['chocolate', 'cacau', 'baunilha', 'mel', 'doce de leite', 'leite condensado', 'goiabada', 'gelatina', 'coco ralado', 'geleia'],
    '🥤 Bebidas & Caldos': ['caldo', 'vinho', 'cerveja', 'café', 'chá', 'suco', 'leite de coco']
  };

  for (const categoria in categorias) {
    if (categorias[categoria].some(termo => nomeLower.includes(termo))) {
      return categoria;
    }
  }
  return '📦 Outros Itens';
};

export default function PlanejadorPage() {
  const [receitasSelecionaveis, setReceitasSelecionaveis] = useState([]);
  const [receitasSelecionadas, setReceitasSelecionadas] = useState(new Set());
  const [listaDeCompras, setListaDeCompras] = useState([]);
  const [listaPorReceita, setListaPorReceita] = useState({});
  const [itensMarcados, setItensMarcados] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [filtroModo, setFiltroModo] = useState('categoria'); // 'categoria', 'consolidado', 'porReceita'
  const [detalhesVisiveis, setDetalhesVisiveis] = useState(null);

  const carregarReceitas = async () => {
    try {
      setLoading(true);
      const resposta = await api.get('/lista-de-compras/receitas');
      setReceitasSelecionaveis(resposta.data);

      // Auto-seleciona as receitas inicialmente para maior conveniência
      if (resposta.data && resposta.data.length > 0) {
        const todosIds = new Set(resposta.data.map(r => r.id_receita));
        setReceitasSelecionadas(todosIds);
        gerarListaAutomatica(todosIds);
      }
    } catch (err) {
      console.error('Erro ao carregar receitas:', err);
      toast.error('Não foi possível carregar as receitas do planejador.');
    } finally {
      setLoading(false);
    }
  };

  const gerarListaAutomatica = async (idsSet) => {
    if (!idsSet || idsSet.size === 0) {
      setListaDeCompras([]);
      setListaPorReceita({});
      return;
    }
    try {
      setGerando(true);
      const ids_receitas = Array.from(idsSet);
      const resposta = await api.post('/lista-de-compras', { ids_receitas });
      setListaDeCompras(resposta.data.consolidada || []);
      setListaPorReceita(resposta.data.porReceita || {});
    } catch (err) {
      console.error('Erro ao gerar lista:', err);
    } finally {
      setGerando(false);
    }
  };

  useEffect(() => {
    carregarReceitas();
  }, []);

  const handleSelecaoReceita = (id) => {
    const novasSelecoes = new Set(receitasSelecionadas);
    if (novasSelecoes.has(id)) {
      novasSelecoes.delete(id);
    } else {
      novasSelecoes.add(id);
    }
    setReceitasSelecionadas(novasSelecoes);
    gerarListaAutomatica(novasSelecoes);
  };

  const handleSelecionarTodas = () => {
    if (receitasSelecionadas.size === receitasSelecionaveis.length) {
      setReceitasSelecionadas(new Set());
      setListaDeCompras([]);
      setListaPorReceita({});
    } else {
      const todos = new Set(receitasSelecionaveis.map(r => r.id_receita));
      setReceitasSelecionadas(todos);
      gerarListaAutomatica(todos);
    }
  };

  const handleMarcarItem = (chaveItem) => {
    setItensMarcados(prev => {
      const novo = new Set(prev);
      if (novo.has(chaveItem)) {
        novo.delete(chaveItem);
      } else {
        novo.add(chaveItem);
      }
      return novo;
    });
  };

  const handleCompartilharWhatsApp = () => {
    if (listaDeCompras.length === 0) {
      toast.warning('Gere ou selecione ao menos uma receita para compartilhar.');
      return;
    }

    let mensagem = `🛒 *MINHA LISTA DE COMPRAS — COOKFLOW*\n\n`;

    if (filtroModo === 'categoria') {
      const agrupado = listaDeCompras.reduce((acc, item) => {
        const cat = getCategoriaIngrediente(item.nome);
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      }, {});

      Object.entries(agrupado).forEach(([cat, itens]) => {
        mensagem += `*${cat.toUpperCase()}*\n`;
        itens.forEach(item => {
          const marcado = itensMarcados.has(`${item.nome}_${item.unidade_medida}`);
          mensagem += `${marcado ? '✅' : '▫️'} ${item.nome}: ${item.quantidade_total} ${item.unidade_medida}\n`;
        });
        mensagem += '\n';
      });
    } else {
      listaDeCompras.forEach(item => {
        const marcado = itensMarcados.has(`${item.nome}_${item.unidade_medida}`);
        mensagem += `${marcado ? '✅' : '▫️'} ${item.nome}: ${item.quantidade_total} ${item.unidade_medida}\n`;
      });
    }

    mensagem += `\n✨ Criado com amor pelo CookFlow: ${window.location.origin}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const handleCopiarTexto = () => {
    if (listaDeCompras.length === 0) return;

    let texto = `LISTA DE COMPRAS — COOKFLOW\n\n`;
    listaDeCompras.forEach(item => {
      texto += `- ${item.nome}: ${item.quantidade_total} ${item.unidade_medida}\n`;
    });

    navigator.clipboard.writeText(texto)
      .then(() => toast.success('Lista copiada para a área de transferência!'))
      .catch(() => toast.error('Não foi possível copiar o texto.'));
  };

  // Cálculo de progresso de compras
  const totalItens = listaDeCompras.length;
  const totalMarcados = listaDeCompras.filter(item => itensMarcados.has(`${item.nome}_${item.unidade_medida}`)).length;
  const porcentagemConcluida = totalItens > 0 ? Math.round((totalMarcados / totalItens) * 100) : 0;

  // Lista agrupada por Categoria de Supermercado
  const listaPorCategoria = useMemo(() => {
    const agrupado = listaDeCompras.reduce((acc, item) => {
      const cat = getCategoriaIngrediente(item.nome);
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});

    return Object.entries(agrupado).sort(([a], [b]) => a.localeCompare(b));
  }, [listaDeCompras]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-6 animate-pulse">
        <div className="h-10 bg-zinc-200 rounded-2xl w-1/3 mx-auto"></div>
        <div className="h-40 bg-zinc-200 rounded-3xl"></div>
        <div className="h-64 bg-zinc-200 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 selection:bg-terracota-500 selection:text-white pb-16">
      <Helmet>
        <title>CookFlow — Carrinho Inteligente & Lista de Supermercado</title>
      </Helmet>

      {/* --- CABEÇALHO HERO --- */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-terracota-50 text-terracota-600 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase border border-terracota-200 shadow-sm">
          <span>🛒</span> Carrinho Inteligente CookFlow
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-verde-floresta font-heading tracking-tight">
          Planeje suas Compras de Supermercado
        </h1>
        <p className="text-sm sm:text-base text-cinza-ardosia max-w-xl mx-auto">
          Selecione as receitas que deseja preparar e o CookFlow soma e agrupa todos os ingredientes automaticamente!
        </p>
      </div>

      {/* --- PASSO 1: SELEÇÃO DE RECEITAS --- */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-card border border-white/80 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-verde-floresta font-heading flex items-center gap-2">
              <span>🍳</span> 1. Receitas no Cardápio
            </h2>
            <p className="text-xs text-cinza-ardosia">
              Clique para ativar ou desativar uma receita da soma
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-terracota-600 bg-terracota-50 px-3 py-1 rounded-full border border-terracota-200">
              {receitasSelecionadas.size} selecionada(s)
            </span>
            {receitasSelecionaveis.length > 0 && (
              <button
                type="button"
                onClick={handleSelecionarTodas}
                className="text-xs font-bold text-verde-floresta hover:text-terracota-500 underline"
              >
                {receitasSelecionadas.size === receitasSelecionaveis.length ? 'Desmarcar Todas' : 'Marcar Todas'}
              </button>
            )}
          </div>
        </div>

        {receitasSelecionaveis.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {receitasSelecionaveis.map((receita) => {
              const selecionada = receitasSelecionadas.has(receita.id_receita);
              const urlImg = resolverUrlImagem(receita.url_imagem);

              return (
                <div
                  key={receita.id_receita}
                  onClick={() => handleSelecaoReceita(receita.id_receita)}
                  className={`group relative rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden select-none border-2 ${
                    selecionada
                      ? 'border-terracota-500 shadow-card scale-[1.02] ring-4 ring-terracota-500/20'
                      : 'border-zinc-200 opacity-60 hover:opacity-100 hover:border-zinc-300'
                  }`}
                >
                  {/* Badge de Selecionado */}
                  <div className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    selecionada ? 'bg-terracota-500 text-white shadow-md' : 'bg-black/40 text-white/60'
                  }`}>
                    {selecionada ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-[10px]">+</span>
                    )}
                  </div>

                  <div className="h-28 w-full bg-zinc-100 overflow-hidden">
                    <img
                      src={urlImg}
                      alt={receita.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>

                  <div className="p-2.5 bg-white">
                    <p className="text-xs font-bold text-verde-floresta truncate leading-tight">
                      {receita.titulo}
                    </p>
                    <span className="text-[10px] text-cinza-ardosia">
                      {receita.tempo_preparo_minutos} min
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 px-4 bg-creme-100/70 rounded-2xl border border-dashed border-zinc-300 space-y-3">
            <div className="text-4xl">🧑‍🍳</div>
            <h3 className="font-bold text-verde-floresta text-base">Seu cardápio ainda está vazio</h3>
            <p className="text-xs text-cinza-ardosia max-w-sm mx-auto">
              Navegue pelas receitas na página inicial e clique em "Adicionar ao Carrinho" ou crie as suas próprias receitas!
            </p>
            <Link to="/" className="btn-primary inline-block py-2 px-5 text-xs">
              Explorar Receitas
            </Link>
          </div>
        )}
      </div>

      {/* --- PASSO 2: LISTA DE SUPERMERCADO AUTOMATIZADA --- */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-card border border-white/80 space-y-6">
        
        {/* Barra Superior da Lista */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
          <div>
            <h2 className="text-2xl font-bold text-verde-floresta font-heading flex items-center gap-2">
              <span>📋</span> 2. Lista de Supermercado
            </h2>
            <p className="text-xs text-cinza-ardosia mt-0.5">
              {totalItens} {totalItens === 1 ? 'ingrediente consolidado' : 'ingredientes consolidados'}
            </p>
          </div>

          {/* Ações Rápidas de Exportação */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCompartilharWhatsApp}
              disabled={totalItens === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-40"
              title="Compartilhar lista no WhatsApp"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleCopiarTexto}
              disabled={totalItens === 0}
              className="bg-white border border-zinc-300 hover:bg-zinc-100 text-verde-floresta font-bold text-xs py-2 px-3.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-40"
              title="Copiar lista de compras"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>Copiar</span>
            </button>
          </div>
        </div>

        {/* Barra de Progresso no Mercado */}
        {totalItens > 0 && (
          <div className="p-4 bg-creme-100/70 rounded-2xl space-y-2 border border-zinc-200/60">
            <div className="flex justify-between items-center text-xs font-bold text-verde-floresta">
              <span>Progresso das Compras:</span>
              <span>{totalMarcados} de {totalItens} itens no carrinho ({porcentagemConcluida}%)</span>
            </div>
            <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-terracota-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${porcentagemConcluida}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Abas de Modo de Visualização */}
        <div className="flex gap-2 p-1 bg-zinc-100 rounded-xl text-xs font-bold w-fit">
          <button
            onClick={() => setFiltroModo('categoria')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              filtroModo === 'categoria'
                ? 'bg-white text-terracota-600 shadow-sm'
                : 'text-cinza-ardosia hover:text-verde-floresta'
            }`}
          >
            Por Seção do Mercado 🏬
          </button>
          <button
            onClick={() => setFiltroModo('consolidado')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              filtroModo === 'consolidado'
                ? 'bg-white text-terracota-600 shadow-sm'
                : 'text-cinza-ardosia hover:text-verde-floresta'
            }`}
          >
            Todos os Itens 📝
          </button>
          <button
            onClick={() => setFiltroModo('porReceita')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              filtroModo === 'porReceita'
                ? 'bg-white text-terracota-600 shadow-sm'
                : 'text-cinza-ardosia hover:text-verde-floresta'
            }`}
          >
            Por Receita 🍽️
          </button>
        </div>

        {/* LISTAGEM DE ITENS */}
        {gerando ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-terracota-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-verde-floresta">Consolidando ingredientes...</p>
          </div>
        ) : totalItens === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-zinc-300 rounded-2xl">
            <p className="font-bold text-verde-floresta text-base">Selecione ao menos 1 receita acima</p>
            <p className="text-xs text-cinza-ardosia mt-1">
              Os ingredientes serão somados instantaneamente na sua lista de mercado.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* MODO 1: POR CATEGORIA */}
            {filtroModo === 'categoria' && (
              <div className="space-y-6">
                {listaPorCategoria.map(([categoria, itens]) => (
                  <div key={categoria} className="space-y-2.5">
                    <h3 className="text-sm font-extrabold text-verde-floresta uppercase tracking-wider pb-1 border-b border-zinc-200 flex items-center gap-2">
                      {categoria}
                      <span className="text-[11px] font-normal text-cinza-ardosia lowercase">({itens.length})</span>
                    </h3>

                    <ul className="space-y-2">
                      {itens.map(item => (
                        <LinhaIngrediente
                          key={`${item.nome}_${item.unidade_medida}`}
                          item={item}
                          marcado={itensMarcados.has(`${item.nome}_${item.unidade_medida}`)}
                          onMarcar={() => handleMarcarItem(`${item.nome}_${item.unidade_medida}`)}
                          expandido={detalhesVisiveis === `${item.nome}_${item.unidade_medida}`}
                          onToggleExpandir={() => setDetalhesVisiveis(detalhesVisiveis === `${item.nome}_${item.unidade_medida}` ? null : `${item.nome}_${item.unidade_medida}`)}
                        />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* MODO 2: CONSOLIDADO DIRETO */}
            {filtroModo === 'consolidado' && (
              <ul className="space-y-2">
                {listaDeCompras.map(item => (
                  <LinhaIngrediente
                    key={`${item.nome}_${item.unidade_medida}`}
                    item={item}
                    marcado={itensMarcados.has(`${item.nome}_${item.unidade_medida}`)}
                    onMarcar={() => handleMarcarItem(`${item.nome}_${item.unidade_medida}`)}
                    expandido={detalhesVisiveis === `${item.nome}_${item.unidade_medida}`}
                    onToggleExpandir={() => setDetalhesVisiveis(detalhesVisiveis === `${item.nome}_${item.unidade_medida}` ? null : `${item.nome}_${item.unidade_medida}`)}
                  />
                ))}
              </ul>
            )}

            {/* MODO 3: AGRUPADO POR RECEITA */}
            {filtroModo === 'porReceita' && (
              <div className="space-y-6">
                {Object.entries(listaPorReceita).map(([nomeReceita, ings]) => (
                  <div key={nomeReceita} className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-3">
                    <h3 className="font-bold text-verde-floresta text-base flex items-center gap-2 border-b border-zinc-100 pb-2">
                      <span>🍲</span> {nomeReceita}
                    </h3>
                    <ul className="space-y-1.5 pl-2">
                      {ings.map((ing, idx) => (
                        <li key={idx} className="flex justify-between text-xs text-verde-floresta py-1 border-b border-zinc-50 last:border-0">
                          <span className="font-medium">• {ing.nome}</span>
                          <span className="font-mono font-bold text-terracota-600">
                            {ing.quantidade} {ing.unidade_medida}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LinhaIngrediente({ item, marcado, onMarcar, expandido, onToggleExpandir }) {
  return (
    <li className={`p-3 rounded-2xl border transition-all ${
      marcado
        ? 'bg-emerald-50/70 border-emerald-200 opacity-70'
        : 'bg-white border-zinc-200/80 hover:border-terracota-500/40 shadow-sm'
    }`}>
      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-3 min-w-0 cursor-pointer flex-grow select-none">
          <input
            type="checkbox"
            checked={marcado}
            onChange={onMarcar}
            className="w-5 h-5 rounded-lg text-terracota-500 focus:ring-terracota-500 border-zinc-300 cursor-pointer"
          />
          <span className={`text-sm font-semibold truncate ${
            marcado ? 'line-through text-emerald-800' : 'text-verde-floresta'
          }`}>
            {item.nome}
          </span>
        </label>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-mono font-extrabold text-xs text-terracota-600 bg-terracota-50 px-2.5 py-1 rounded-lg">
            {item.quantidade_total} {item.unidade_medida}
          </span>

          {item.fontes && item.fontes.length > 1 && (
            <button
              type="button"
              onClick={onToggleExpandir}
              className="text-[11px] font-bold text-cinza-ardosia hover:text-verde-floresta p-1"
              title="Ver em quais receitas é usado"
            >
              {item.fontes.length} receitas ▼
            </button>
          )}
        </div>
      </div>

      {expandido && item.fontes && (
        <div className="mt-3 pt-2.5 border-t border-zinc-100 pl-8 space-y-1.5 animate-fade-in text-xs text-cinza-ardosia">
          <p className="font-bold text-verde-floresta text-[11px]">Distribuição por receita:</p>
          {item.fontes.map((f, i) => (
            <div key={i} className="flex justify-between">
              <span>• {f.receita}</span>
              <span className="font-mono font-semibold">{f.quantidade} {item.unidade_medida}</span>
            </div>
          ))}
        </div>
      )}
    </li>
  );
}