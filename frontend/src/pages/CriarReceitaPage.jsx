// Arquivo: src/pages/CriarReceitaPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function CriarReceitaPage() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [id_categoria, setIdCategoria] = useState(1);
  const [tempo_preparo_minutos, setTempoPreparo] = useState('');
  const [dificuldade, setDificuldade] = useState('Fácil');
  const [instrucoes, setInstrucoes] = useState('');
  const [ingredientes, setIngredientes] = useState([{ nome: '', quantidade: '', unidade_medida: '' }]);
  const [opcoesIngredientes, setOpcoesIngredientes] = useState([]);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function carregarIngredientes() {
      try {
        const resposta = await api.get('/ingredientes');
        const opcoesFormatadas = resposta.data.map(item => ({ value: item.nome, label: item.nome }));
        setOpcoesIngredientes(opcoesFormatadas);
      } catch (err) {
        console.error("Erro ao carregar lista de ingredientes:", err);
      }
    }
    carregarIngredientes();
  }, []);

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
    setErro('');
    try {
      const dadosReceita = {
        titulo, descricao, id_categoria: Number(id_categoria), tempo_preparo_minutos: Number(tempo_preparo_minutos), dificuldade, instrucoes, ingredientes
      };
      await api.post('/receitas', dadosReceita);
      navigate('/');
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Ocorreu um erro ao criar a receita.');
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 border-b pb-4">Crie uma Nova Receita</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Título da Receita</label>
          <input type="text" placeholder="Ex: Bolo de Chocolate da Vovó" value={titulo} onChange={e => setTitulo(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Descrição</label>
          <textarea placeholder="Uma breve descrição sobre a sua receita..." value={descricao} onChange={e => setDescricao(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
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
                  <Select options={opcoesIngredientes} isClearable isSearchable placeholder="Selecione ou digite..." onChange={opcao => handleIngredienteChange(index, 'nome', opcao ? opcao.value : '')} value={opcoesIngredientes.find(o => o.value === ing.nome)} styles={{ control: (base) => ({ ...base, padding: '0.3rem' }) }}/>
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
          <button type="button" onClick={adicionarIngrediente} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors font-medium">+ Adicionar Ingrediente</button>
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Modo de Preparo</label>
          <textarea placeholder="Descreva o passo a passo da sua receita..." value={instrucoes} onChange={e => setInstrucoes(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-md shadow-sm h-48 focus:ring-green-500 focus:border-green-500" />
        </div>
        {erro && <p className="text-red-500 text-center font-medium">{erro}</p>}
        <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-xl hover:bg-green-700 transition-transform transform hover:scale-105 shadow-lg">Publicar Receita</button>
      </form>
    </div>
  );
}