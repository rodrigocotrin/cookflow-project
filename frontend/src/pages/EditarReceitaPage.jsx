// Arquivo: src/pages/EditarReceitaPage.jsx

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import api from '../services/api';
import { toast } from 'react-toastify';

// Hook customizado para textareas auto-expansíveis
function useAutoResizeTextarea(value) {
  const ref = useRef(null);
  useEffect(() => {
    const textarea = ref.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);
  return ref;
}

// Componente de ícone
function IconeLixeira() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

const opcoesUnidades = [
  { value: 'g', label: 'g' }, { value: 'kg', label: 'kg' },
  { value: 'ml', label: 'ml' }, { value: 'l', label: 'l' },
  { value: 'unidade(s)', label: 'unidade(s)' }, { value: 'xícara(s)', label: 'xícara(s)' },
  { value: 'colher(es) de sopa', label: 'colher(es) de sopa' }, { value: 'colher(es) de chá', label: 'colher(es) de chá' },
  { value: 'a gosto', label: 'a gosto' },
];

export default function EditarReceitaPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados individuais, como na página de criação
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [url_imagem, setUrlImagem] = useState('');
  const [imagemPreview, setImagemPreview] = useState(null);
  const [id_categoria, setIdCategoria] = useState(1);
  const [tempo_preparo_minutos, setTempoPreparo] = useState('');
  const [dificuldade, setDificuldade] = useState('Fácil');
  const [instrucoes, setInstrucoes] = useState('');
  const [ingredientes, setIngredientes] = useState([{ nome: '', quantidade: '', unidade_medida: '' }]);
  const [opcoesIngredientes, setOpcoesIngredientes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Aplicando o hook de auto-resize
  const descricaoRef = useAutoResizeTextarea(descricao);
  const instrucoesRef = useAutoResizeTextarea(instrucoes);

  // Efeito para buscar os dados da receita e os ingredientes
  useEffect(() => {
    async function carregarDados() {
      try {
        const [respostaReceita, respostaIngredientes] = await Promise.all([
          api.get(`/receitas/${id}`),
          api.get('/ingredientes')
        ]);

        const receita = respostaReceita.data;
        
        // Populando os estados individuais com os dados da receita
        setTitulo(receita.titulo);
        setDescricao(receita.descricao || '');
        setUrlImagem(receita.url_imagem || '');
        setImagemPreview(receita.url_imagem || null); // Define o preview inicial
        setIdCategoria(receita.id_categoria);
        setTempoPreparo(receita.tempo_preparo_minutos);
        setDificuldade(receita.dificuldade);
        setInstrucoes(receita.instrucoes);
        // Garante que a lista de ingredientes não esteja vazia
        setIngredientes(receita.ingredientes.length > 0 ? receita.ingredientes : [{ nome: '', quantidade: '', unidade_medida: '' }]);

        const opcoesFormatadas = respostaIngredientes.data.map(item => ({ value: item.nome, label: item.nome }));
        setOpcoesIngredientes(opcoesFormatadas);

      } catch (err) {
        toast.error("Não foi possível carregar os dados da receita.");
        navigate('/'); // Redireciona em caso de erro
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [id, navigate]);

  const handleImagemChange = (e) => {
    const ficheiro = e.target.files[0];
    if (ficheiro) {
      setImagemPreview(URL.createObjectURL(ficheiro));
    }
  };

  const handleIngredienteChange = (index, nomeCampo, valor) => {
    const novosIngredientes = [...ingredientes];
    novosIngredientes[index][nomeCampo] = valor;
    setIngredientes(novosIngredientes);
  };

  const adicionarIngrediente = () => {
    setIngredientes([...ingredientes, { nome: '', quantidade: '', unidade_medida: '' }]);
  };

  const removerIngrediente = (index) => {
    const novosIngredientes = [...ingredientes];
    novosIngredientes.splice(index, 1);
    setIngredientes(novosIngredientes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!url_imagem.trim()) {
      toast.error('Por favor, forneça a URL da imagem da receita.');
      return;
    }

    for (const ing of ingredientes) {
      if (ing.nome && ing.quantidade && !ing.unidade_medida) {
        toast.error('Por favor, selecione a unidade de medida para todos os ingredientes.');
        return;
      }
    }

    try {
      const dadosReceita = {
        titulo, descricao, url_imagem, id_categoria: Number(id_categoria),
        tempo_preparo_minutos: Number(tempo_preparo_minutos), dificuldade, instrucoes,
        ingredientes: ingredientes.filter(ing => ing.nome && ing.quantidade && ing.unidade_medida)
      };
      
      if (dadosReceita.ingredientes.length === 0) {
        toast.error("Adicione pelo menos um ingrediente completo.");
        return;
      }

      await api.put(`/receitas/${id}`, dadosReceita);
      toast.success("Receita atualizada com sucesso!");
      navigate(`/receita/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.mensagem || 'Ocorreu um erro ao atualizar a receita.');
    }
  };

  if (loading) {
    return <div className="text-center p-10 font-semibold text-verde-floresta">Carregando editor...</div>;
  }

  return (
    <div className="bg-creme min-h-screen py-10">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <h1 className="text-4xl font-bold text-verde-floresta mb-8 border-b pb-4">Editar Receita</h1>
        <form onSubmit={handleSubmit} className="space-y-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Coluna da Imagem */}
            <div>
              <label className="block text-lg font-medium text-cinza-ardosia mb-2">Sua Receita</label>
              <div className="w-full h-64 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 relative">
                {imagemPreview ? (
                  <img src={imagemPreview} alt="Pré-visualização da receita" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="text-center text-cinza-ardosia">
                    <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 4v.01M28 8l4 4m0 0l4 4m-4-4v12m-8-4l-4-4m0 0l-4 4m4-4v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <p className="mt-2">Escolha uma imagem</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg, image/png"
                  onChange={handleImagemChange}
                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-xs text-cinza-ardosia mt-2">Formatos aceites: JPG, PNG.</p>
            </div>

            {/* Coluna do Título e URL */}
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-medium text-cinza-ardosia mb-2">Título da Receita</label>
                <input type="text" placeholder="Ex: Bolo de Chocolate..." value={titulo} onChange={e => setTitulo(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-lg font-medium text-cinza-ardosia mb-2">URL da Imagem</label>
                <input type="url" placeholder="https://exemplo.com/imagem.jpg" value={url_imagem} onChange={e => setUrlImagem(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-md" />
                <p className="text-xs text-cinza-ardosia mt-1">MVP: Por favor, cole a URL da imagem aqui por enquanto.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium text-cinza-ardosia mb-2">Descrição</label>
            <textarea
              ref={descricaoRef}
              placeholder="Uma breve descrição sobre a sua receita..."
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md resize-none overflow-hidden"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tempo de Preparo (min)</label>
              <input type="number" value={tempo_preparo_minutos} onChange={e => setTempoPreparo(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dificuldade</label>
              <select value={dificuldade} onChange={e => setDificuldade(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md shadow-sm bg-white">
                <option>Fácil</option> <option>Médio</option> <option>Difícil</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select value={id_categoria} onChange={e => setIdCategoria(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md shadow-sm bg-white">
                <option value="1">Sobremesa</option> <option value="2">Prato Principal</option>
                <option value="3">Lanche</option> <option value="4">Vegano</option>
              </select>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Ingredientes</h2>
            <div className="space-y-4">
              {ingredientes.map((ing, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-12 md:col-span-6">
                    <Select
                      options={opcoesIngredientes}
                      isClearable isSearchable
                      placeholder="Selecione ou digite..."
                      onChange={opcao => handleIngredienteChange(index, 'nome', opcao ? opcao.value : '')}
                      value={opcoesIngredientes.find(o => o.value === ing.nome)}
                      styles={{
                        control: (baseStyles, state) => ({
                          ...baseStyles,
                          padding: '0.3rem',
                          borderColor: state.isFocused ? '#2F4F4F' : '#D1D5DB',
                          boxShadow: state.isFocused ? '0 0 0 1px #2F4F4F' : 'none',
                          '&:hover': {
                            borderColor: state.isFocused ? '#2F4F4F' : '#A1A1AA',
                          },
                        }),
                      }}
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <input type="number" name="quantidade" placeholder="Qtd" value={ing.quantidade} onChange={e => handleIngredienteChange(index, 'quantidade', e.target.value)} required className="w-full p-3 border border-gray-300 rounded-md" />
                  </div>
                  <div className="col-span-6 md:col-span-3">
                    <select name="unidade_medida" value={ing.unidade_medida} onChange={e => handleIngredienteChange(index, 'unidade_medida', e.target.value)} required className="w-full p-3 border border-gray-300 rounded-md bg-white">
                      <option value="" disabled>Unidade</option>
                      {opcoesUnidades.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex justify-end">
                    {ingredientes.length > 1 && (<button type="button" onClick={() => removerIngrediente(index)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"><IconeLixeira /></button>)}
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={adicionarIngrediente} className="mt-4 bg-terracota-500 text-white py-2 px-4 rounded-md hover:bg-terracota-600 transition-colors font-medium">
              + Adicionar Ingrediente
            </button>
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Modo de Preparo</label>
            <textarea
              ref={instrucoesRef}
              placeholder="Descreva o passo a passo da sua receita..."
              value={instrucoes}
              onChange={e => setInstrucoes(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm h-48 focus:ring-green-500 focus:border-green-500 resize-none overflow-hidden"
            />
          </div>
          <button type="submit" className="w-full bg-terracota-500 text-white py-4 rounded-lg font-bold text-xl hover:bg-terracota-600 shadow-lg">
            Salvar Alterações
          </button>
        </form>
      </div>
    </div>
  );
}