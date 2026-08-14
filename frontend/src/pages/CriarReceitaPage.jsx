// Arquivo: src/pages/CriarReceitaPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CreatableSelect from 'react-select/creatable';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';

function useAutoResizeTextarea(value) {
  const ref = useRef(null);
  useEffect(() => {
    const textarea = ref.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(textarea.scrollHeight, 100)}px`;
    }
  }, [value]);
  return ref;
}

const opcoesUnidades = [
  { value: 'g', label: 'g (gramas)' },
  { value: 'kg', label: 'kg (quilos)' },
  { value: 'ml', label: 'ml (mililitros)' },
  { value: 'l', label: 'L (litros)' },
  { value: 'unidade(s)', label: 'unidade(s)' },
  { value: 'xícara(s)', label: 'xícara(s)' },
  { value: 'colher(es) de sopa', label: 'colher(es) de sopa' },
  { value: 'colher(es) de chá', label: 'colher(es) de chá' },
  { value: 'dente(s)', label: 'dente(s)' },
  { value: 'pitada(s)', label: 'pitada(s)' },
  { value: 'fatia(s)', label: 'fatia(s)' },
  { value: 'a gosto', label: 'a gosto' },
];

export default function CriarReceitaPage() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [url_imagem, setUrlImagem] = useState('');
  const [id_categoria, setIdCategoria] = useState(1);
  const [categorias, setCategorias] = useState([]);
  const [tempo_preparo_minutos, setTempoPreparo] = useState('');
  const [dificuldade, setDificuldade] = useState('Fácil');
  const [instrucoes, setInstrucoes] = useState('');
  const [ingredientes, setIngredientes] = useState([
    { nome: '', quantidade: '', unidade_medida: 'unidade(s)' },
    { nome: '', quantidade: '', unidade_medida: 'g' }
  ]);
  const [opcoesIngredientes, setOpcoesIngredientes] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const navigate = useNavigate();

  const descricaoRef = useAutoResizeTextarea(descricao);
  const instrucoesRef = useAutoResizeTextarea(instrucoes);

  useEffect(() => {
    async function carregarDadosIniciais() {
      try {
        const [resIngredientes, resCategorias] = await Promise.allSettled([
          api.get('/ingredientes'),
          api.get('/categorias')
        ]);

        if (resIngredientes.status === 'fulfilled') {
          const formatadas = resIngredientes.value.data.map(item => ({
            value: item.nome,
            label: item.nome
          }));
          setOpcoesIngredientes(formatadas);
        }

        if (resCategorias.status === 'fulfilled' && resCategorias.value.data.length > 0) {
          setCategorias(resCategorias.value.data);
          setIdCategoria(resCategorias.value.data[0].id_categoria);
        } else {
          setCategorias([
            { id_categoria: 1, nome: 'Massas' },
            { id_categoria: 2, nome: 'Sobremesas' },
            { id_categoria: 3, nome: 'Carnes' },
            { id_categoria: 4, nome: 'Lanches' },
            { id_categoria: 5, nome: 'Vegetariano' },
            { id_categoria: 6, nome: 'Bebidas' }
          ]);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do formulário:", err);
      }
    }
    carregarDadosIniciais();
  }, []);

  const handleIngredienteChange = (index, nomeCampo, valor) => {
    const novosIngredientes = [...ingredientes];
    novosIngredientes[index][nomeCampo] = valor;
    setIngredientes(novosIngredientes);
  };

  const adicionarIngrediente = () => {
    setIngredientes([...ingredientes, { nome: '', quantidade: '', unidade_medida: 'unidade(s)' }]);
  };

  const removerIngrediente = (index) => {
    if (ingredientes.length <= 1) {
      toast.warning('A receita precisa ter ao menos um ingrediente.');
      return;
    }
    const novosIngredientes = [...ingredientes];
    novosIngredientes.splice(index, 1);
    setIngredientes(novosIngredientes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titulo.trim()) {
      toast.warning('Informe o título da sua receita.');
      return;
    }

    if (!url_imagem.trim()) {
      toast.warning('Por favor, adicione uma foto para a sua receita.');
      return;
    }

    const ingredientesValidos = ingredientes.filter(ing => ing.nome && ing.nome.trim() && ing.quantidade);

    if (ingredientesValidos.length === 0) {
      toast.warning("Adicione pelo menos um ingrediente com nome e quantidade.");
      return;
    }

    setSalvando(true);
    try {
      const dadosReceita = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        url_imagem: url_imagem.trim(),
        id_categoria: Number(id_categoria),
        tempo_preparo_minutos: Number(tempo_preparo_minutos) || 30,
        dificuldade,
        instrucoes: instrucoes.trim(),
        ingredientes: ingredientesValidos
      };

      const resposta = await api.post('/receitas', dadosReceita);
      toast.success("Receita criada com sucesso!");
      navigate(`/receita/${resposta.data.id_receita || ''}`);
    } catch (err) {
      console.error('Erro ao salvar receita:', err);
      toast.error(err.response?.data?.mensagem || 'Ocorreu um erro ao criar a receita.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 selection:bg-terracota-500 selection:text-white">
      <Helmet>
        <title>CookFlow — Criar Nova Receita</title>
      </Helmet>

      <div className="glass-panel p-6 sm:p-10 rounded-3xl shadow-card border border-white/80 space-y-8">
        
        {/* Cabeçalho */}
        <div className="border-b border-zinc-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-verde-floresta font-heading">
              Criar Nova Receita
            </h1>
            <p className="text-sm text-cinza-ardosia mt-1">
              Compartilhe suas melhores criações culinárias com o mundo.
            </p>
          </div>
          <span className="bg-terracota-50 text-terracota-600 font-bold text-xs px-3.5 py-1.5 rounded-full border border-terracota-200 self-start sm:self-auto">
            Passo a Passo
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Seção 1: Foto e Título */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6">
              <ImageUpload
                valorAtual={url_imagem}
                aoMudarImagem={setUrlImagem}
                label="Foto Principal do Prato"
              />
            </div>

            <div className="lg:col-span-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-verde-floresta mb-2">
                  Título da Receita <span className="text-terracota-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Lasanha Artesanal de Quatro Queijos"
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl text-verde-floresta text-sm font-medium focus:outline-none focus:ring-2 focus:ring-terracota-500/50 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-verde-floresta mb-2">
                  Breve Descrição ou História
                </label>
                <textarea
                  ref={descricaoRef}
                  placeholder="Conte um pouco sobre o sabor, a origem ou o segredo dessa delícia..."
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  className="w-full p-4 bg-white border border-zinc-300 rounded-xl text-verde-floresta text-sm focus:outline-none focus:ring-2 focus:ring-terracota-500/50 shadow-sm resize-none"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Informações Técnicas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-5 bg-creme-100/70 rounded-2xl border border-zinc-200/70">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-cinza-ardosia mb-2">
                Tempo de Preparo (minutos) <span className="text-terracota-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="Ex: 45"
                value={tempo_preparo_minutos}
                onChange={e => setTempoPreparo(e.target.value)}
                required
                className="w-full p-3 bg-white border border-zinc-300 rounded-xl text-verde-floresta font-bold text-sm focus:ring-2 focus:ring-terracota-500/50 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-cinza-ardosia mb-2">
                Dificuldade
              </label>
              <select
                value={dificuldade}
                onChange={e => setDificuldade(e.target.value)}
                className="w-full p-3 bg-white border border-zinc-300 rounded-xl text-verde-floresta font-bold text-sm focus:ring-2 focus:ring-terracota-500/50 shadow-sm cursor-pointer"
              >
                <option value="Fácil">🟢 Fácil</option>
                <option value="Médio">🟡 Médio</option>
                <option value="Difícil">🔴 Difícil</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-cinza-ardosia mb-2">
                Categoria
              </label>
              <select
                value={id_categoria}
                onChange={e => setIdCategoria(e.target.value)}
                className="w-full p-3 bg-white border border-zinc-300 rounded-xl text-verde-floresta font-bold text-sm focus:ring-2 focus:ring-terracota-500/50 shadow-sm cursor-pointer"
              >
                {categorias.map(cat => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Seção 3: Lista de Ingredientes Dinâmica */}
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
              <div>
                <h2 className="text-xl font-bold text-verde-floresta font-heading flex items-center gap-2">
                  <span>🥕</span> Ingredientes da Receita
                </h2>
                <p className="text-xs text-cinza-ardosia">
                  Esses itens serão usados no Carrinho Inteligente de compras.
                </p>
              </div>

              <button
                type="button"
                onClick={adicionarIngrediente}
                className="btn-secondary py-1.5 px-4 text-xs font-bold flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>+ Ingrediente</span>
              </button>
            </div>

            <div className="space-y-3">
              {ingredientes.map((ing, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 items-center p-3 bg-white/80 rounded-2xl border border-zinc-200/80 shadow-sm"
                >
                  <div className="col-span-12 sm:col-span-6">
                    <CreatableSelect
                      options={opcoesIngredientes}
                      isClearable
                      isSearchable
                      placeholder="Nome do ingrediente..."
                      onChange={opcao => handleIngredienteChange(index, 'nome', opcao ? opcao.value : '')}
                      onCreateOption={novoValor => {
                        const novaOpcao = { value: novoValor, label: novoValor };
                        setOpcoesIngredientes(prev => [...prev, novaOpcao]);
                        handleIngredienteChange(index, 'nome', novoValor);
                      }}
                      value={ing.nome ? { value: ing.nome, label: ing.nome } : null}
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderRadius: '0.75rem',
                          padding: '0.2rem',
                          borderColor: state.isFocused ? '#E15A31' : '#E4E4E7',
                          boxShadow: state.isFocused ? '0 0 0 1px #E15A31' : 'none',
                          '&:hover': { borderColor: '#E15A31' },
                        }),
                      }}
                    />
                  </div>

                  <div className="col-span-5 sm:col-span-2">
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      placeholder="Qtd"
                      value={ing.quantidade}
                      onChange={e => handleIngredienteChange(index, 'quantidade', e.target.value)}
                      required
                      className="w-full p-2.5 bg-white border border-zinc-300 rounded-xl text-verde-floresta text-sm font-semibold text-center focus:ring-2 focus:ring-terracota-500/50"
                    />
                  </div>

                  <div className="col-span-5 sm:col-span-3">
                    <select
                      value={ing.unidade_medida}
                      onChange={e => handleIngredienteChange(index, 'unidade_medida', e.target.value)}
                      required
                      className="w-full p-2.5 bg-white border border-zinc-300 rounded-xl text-verde-floresta text-xs font-semibold focus:ring-2 focus:ring-terracota-500/50"
                    >
                      {opcoesUnidades.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removerIngrediente(index)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Remover ingrediente"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seção 4: Modo de Preparo */}
          <div className="space-y-3 pt-2">
            <label className="block text-xl font-bold text-verde-floresta font-heading flex items-center gap-2">
              <span>👩‍🍳</span> Modo de Preparo (Instruções)
            </label>
            <p className="text-xs text-cinza-ardosia">
              Dica: Escreva um passo por linha para criar uma lista numerada automática e organizada.
            </p>
            <textarea
              ref={instrucoesRef}
              placeholder={`1. Em uma tigela grande, misture a farinha e os ovos...\n2. Pré-aqueça o forno a 180°C...\n3. Asse por 35 minutos até dourar.`}
              value={instrucoes}
              onChange={e => setInstrucoes(e.target.value)}
              required
              className="w-full p-4 bg-white border border-zinc-300 rounded-2xl text-verde-floresta text-sm focus:outline-none focus:ring-2 focus:ring-terracota-500/50 shadow-sm resize-none"
              rows="5"
            />
          </div>

          {/* Botão de Envio */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={salvando}
              className="btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-terracota-500/30"
            >
              {salvando ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Publicando Receita...</span>
                </>
              ) : (
                <>
                  <span>Publicar Receita no CookFlow</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}