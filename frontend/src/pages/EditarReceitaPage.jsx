// Arquivo: src/pages/EditarReceitaPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import api from '../services/api';

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
  const [formData, setFormData] = useState(null);
  const [opcoesIngredientes, setOpcoesIngredientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarDados() {
      try {
        const [respostaReceita, respostaIngredientes] = await Promise.all([
          api.get(`/receitas/${id}`),
          api.get('/ingredientes')
        ]);
        
        const receita = respostaReceita.data;
        setFormData({
          titulo: receita.titulo,
          descricao: receita.descricao || '',
          id_categoria: receita.id_categoria,
          tempo_preparo_minutos: receita.tempo_preparo_minutos,
          dificuldade: receita.dificuldade,
          instrucoes: receita.instrucoes,
          ingredientes: receita.ingredientes.map(ing => ({ ...ing, quantidade: parseFloat(ing.quantidade) }))
        });
        
        setOpcoesIngredientes(respostaIngredientes.data.map(item => ({ value: item.nome, label: item.nome })));
      } catch (err) {
        setErro("Não foi possível carregar os dados da receita para edição.");
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [id]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIngredienteChange = (index, campo, valor) => {
    const novosIngredientes = [...formData.ingredientes];
    novosIngredientes[index][campo] = valor;
    setFormData(prev => ({ ...prev, ingredientes: novosIngredientes }));
  };

  const adicionarIngrediente = () => {
    setFormData(prev => ({ ...prev, ingredientes: [...prev.ingredientes, { nome: '', quantidade: '', unidade_medida: '' }] }));
  };
      
  const removerIngrediente = (index) => {
    const novosIngredientes = [...formData.ingredientes];
    novosIngredientes.splice(index, 1);
    setFormData(prev => ({ ...prev, ingredientes: novosIngredientes }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      // --- CORREÇÃO AQUI ---
      // Garantimos que os campos numéricos são enviados como números
      const dadosParaEnviar = {
        ...formData,
        id_categoria: Number(formData.id_categoria),
        tempo_preparo_minutos: Number(formData.tempo_preparo_minutos),
        ingredientes: formData.ingredientes.map(ing => ({
            ...ing,
            quantidade: Number(ing.quantidade)
        }))
      };

      await api.put(`/receitas/${id}`, dadosParaEnviar);
      navigate(`/receita/${id}`);
    } catch (err) {
      console.error("Erro ao atualizar:", err.response?.data || err.message);
      setErro('Ocorreu um erro ao atualizar a receita.');
    }
  };

  if (loading) return <p className="text-center text-gray-500 py-10">A carregar dados para edição...</p>;
  if (erro) return <p className="text-center text-red-500 py-10">{erro}</p>;
  if (!formData) return null;

  return (
    <div className="max-w-4xl w-full mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200 my-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 border-b pb-4">Editar Receita</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Título da Receita</label>
          <input type="text" name="titulo" value={formData.titulo} onChange={handleFormChange} required className="w-full p-3 border border-gray-300 rounded-md shadow-sm"/>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Descrição</label>
          <textarea name="descricao" value={formData.descricao} onChange={handleFormChange} className="w-full p-3 border border-gray-300 rounded-md shadow-sm"/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tempo de Preparo (min)</label>
            <input type="number" name="tempo_preparo_minutos" value={formData.tempo_preparo_minutos} onChange={handleFormChange} required className="w-full p-3 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dificuldade</label>
            <select name="dificuldade" value={formData.dificuldade} onChange={handleFormChange} className="w-full p-3 border border-gray-300 rounded-md shadow-sm bg-white">
              <option>Fácil</option>
              <option>Médio</option>
              <option>Difícil</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select name="id_categoria" value={formData.id_categoria} onChange={handleFormChange} className="w-full p-3 border border-gray-300 rounded-md shadow-sm bg-white">
              <option value="1">Sobremesa</option>
              <option value="2">Prato Principal</option>
              <option value="3">Lanche</option>
              <option value="4">Vegano</option>
            </select>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Ingredientes</h2>
          <div className="space-y-4">
            {formData.ingredientes.map((ing, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-12 md:col-span-6">
                  <Select
                    options={opcoesIngredientes}
                    isClearable isSearchable placeholder="Selecione ou digite..."
                    onChange={opcao => handleIngredienteChange(index, 'nome', opcao ? opcao.value : '')}
                    value={opcoesIngredientes.find(o => o.value === ing.nome)}
                    styles={{ control: (base) => ({ ...base, padding: '0.3rem' }) }}
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
                  {formData.ingredientes.length > 1 && (
                    <button type="button" onClick={() => removerIngrediente(index)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors">
                      <IconeLixeira />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={adicionarIngrediente} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors font-medium">+ Adicionar Ingrediente</button>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Modo de Preparo</label>
          <textarea name="instrucoes" value={formData.instrucoes} onChange={handleFormChange} required className="w-full p-3 border border-gray-300 rounded-md shadow-sm h-48"/>
        </div>

        {erro && <p className="text-red-500 text-center font-medium">{erro}</p>}

        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-xl hover:bg-blue-700 shadow-lg">
          Salvar Alterações
        </button>
      </form>
    </div>
  );
}