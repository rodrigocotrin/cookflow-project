// Arquivo: src/pages/CriarReceitaPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function CriarReceitaPage() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [id_categoria, setIdCategoria] = useState(1); // Ex: 1 para Sobremesa
  const [tempo_preparo_minutos, setTempoPreparo] = useState('');
  const [dificuldade, setDificuldade] = useState('Fácil');
  const [instrucoes, setInstrucoes] = useState('');
  const [ingredientes, setIngredientes] = useState([{ nome: '', quantidade: '', unidade_medida: '' }]);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleIngredienteChange = (index, event) => {
    const novosIngredientes = [...ingredientes];
    novosIngredientes[index][event.target.name] = event.target.value;
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
      setErro('Ocorreu um erro ao criar a receita. Verifique todos os campos.');
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Crie uma Nova Receita</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="text" placeholder="Título da Receita" value={titulo} onChange={e => setTitulo(e.target.value)} required className="w-full p-2 border rounded" />
        <textarea placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} className="w-full p-2 border rounded" />
        <div className="grid grid-cols-3 gap-4">
          <input type="number" placeholder="Tempo (min)" value={tempo_preparo_minutos} onChange={e => setTempoPreparo(e.target.value)} required className="p-2 border rounded" />
          <select value={dificuldade} onChange={e => setDificuldade(e.target.value)} className="p-2 border rounded">
            <option>Fácil</option>
            <option>Médio</option>
            <option>Difícil</option>
          </select>
          <select value={id_categoria} onChange={e => setIdCategoria(e.target.value)} className="p-2 border rounded">
            <option value="1">Sobremesa</option>
            <option value="2">Prato Principal</option>
            <option value="3">Lanche</option>
            <option value="4">Vegano</option>
          </select>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Ingredientes</h2>
          {ingredientes.map((ing, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input type="text" name="nome" placeholder="Nome do Ingrediente" value={ing.nome} onChange={e => handleIngredienteChange(index, e)} required className="flex-grow p-2 border rounded" />
              <input type="number" name="quantidade" placeholder="Qtd" value={ing.quantidade} onChange={e => handleIngredienteChange(index, e)} required className="w-24 p-2 border rounded" />
              <input type="text" name="unidade_medida" placeholder="Unidade (ex: g, ml)" value={ing.unidade_medida} onChange={e => handleIngredienteChange(index, e)} required className="w-32 p-2 border rounded" />
              {ingredientes.length > 1 && <button type="button" onClick={() => removerIngrediente(index)} className="bg-red-500 text-white p-2 rounded">X</button>}
            </div>
          ))}
          <button type="button" onClick={adicionarIngrediente} className="mt-2 bg-blue-500 text-white py-2 px-4 rounded">Adicionar Ingrediente</button>
        </div>
        <textarea placeholder="Modo de Preparo (um passo por linha)" value={instrucoes} onChange={e => setInstrucoes(e.target.value)} required className="w-full p-2 border rounded h-40" />
        {erro && <p className="text-red-500 text-center">{erro}</p>}
        <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700">Publicar Receita</button>
      </form>
    </div>
  );
}