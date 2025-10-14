// Arquivo: src/components/ComentariosSecao.jsx
import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContexto } from '../context/AuthContexto';
import AvaliacaoEstrelas from './AvaliacaoEstrelas'; // Importamos nosso componente de estrelas

// Pequeno componente para o Avatar
function Avatar({ nome }) {
  const inicial = nome ? nome.charAt(0).toUpperCase() : '?';
  return (
    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xl">
      {inicial}
    </div>
  );
}

export default function ComentariosSecao({ idReceita }) {
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [novaAvaliacao, setNovaAvaliacao] = useState(0); // Estado para a nova avaliação
  const [erro, setErro] = useState('');
  const { assinado, utilizador } = useContext(AuthContexto);

  const [idEmEdicao, setIdEmEdicao] = useState(null);
  const [textoEditado, setTextoEditado] = useState('');

  useEffect(() => {
    async function buscarComentarios() {
      try {
        const resposta = await api.get(`/receitas/${idReceita}/comentarios`);
        setComentarios(resposta.data);
      } catch (err) { console.error("Erro ao buscar comentários:", err); }
    }
    buscarComentarios();
  }, [idReceita]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    // Valida se há pelo menos uma avaliação ou um comentário
    if (novaAvaliacao === 0 && !novoComentario.trim()) {
      setErro('Por favor, dê uma nota ou escreva um comentário.');
      return;
    }

    try {
      // Envia a avaliação, se houver
      if (novaAvaliacao > 0) {
        await api.post(`/receitas/${idReceita}/avaliar`, { nota: novaAvaliacao });
      }
      // Envia o comentário, se houver
      if (novoComentario.trim()) {
        const respostaComentario = await api.post(`/receitas/${idReceita}/comentar`, { conteudo: novoComentario });
        // Atualiza a lista de comentários na UI
        setComentarios([{ ...respostaComentario.data, nome_usuario: utilizador.nome, id_usuario: utilizador.id_usuario }, ...comentarios]);
      }

      setNovoComentario('');
      setNovaAvaliacao(0);
      alert('Obrigado pela sua contribuição!');
      // Poderíamos também recarregar a página para atualizar a média de estrelas

    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Ocorreu um erro. Tente novamente.');
    }
  };

  const handleIniciarEdicao = (comentario) => {
    setIdEmEdicao(comentario.id_comentario);
    setTextoEditado(comentario.conteudo);
  };

  const handleCancelarEdicao = () => {
    setIdEmEdicao(null);
    setTextoEditado('');
  };

  const handleSalvarEdicao = async (id_comentario) => {
    try {
      const resposta = await api.put(`/comentarios/${id_comentario}`, { conteudo: textoEditado });
      setComentarios(comentarios.map(c => c.id_comentario === id_comentario ? { ...c, conteudo: resposta.data.conteudo } : c));
      handleCancelarEdicao();
    } catch (err) { console.error("Erro ao salvar edição:", err); }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Comentários</h2>

      {assinado && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">O que você achou desta receita?</h3>
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-4 mb-4">
              <Avatar nome={utilizador.nome} />
              <AvaliacaoEstrelas aoAvaliar={setNovaAvaliacao} valorInicial={novaAvaliacao} />
            </div>
            <textarea
              className="w-full p-3 border rounded-md"
              rows="4"
              placeholder="Conte-nos o que você achou dessa receita ou faça uma pergunta."
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
            ></textarea>
            {erro && <p className="text-red-500 text-sm mt-2">{erro}</p>}
            <div className="text-right mt-4">
              <button type="submit" className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 font-semibold">
                Publicar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {comentarios.map((comentario) => (
          <div key={comentario.id_comentario} className="flex gap-4">
            <Avatar nome={comentario.nome_usuario} />
            <div className="flex-grow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800">{comentario.nome_usuario}</p>
                  <p className="text-xs text-gray-500">{new Date(comentario.data_criacao).toLocaleDateString('pt-BR')}</p>
                </div>
                {assinado && utilizador.id_usuario === comentario.id_usuario && idEmEdicao !== comentario.id_comentario && (
                  <button onClick={() => handleIniciarEdicao(comentario)} className="text-sm font-medium text-blue-600 hover:underline">Editar</button>
                )}
              </div>

              {idEmEdicao === comentario.id_comentario ? (
                <div className="mt-2">
                  <textarea value={textoEditado} onChange={(e) => setTextoEditado(e.target.value)} className="w-full p-2 border rounded" />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleSalvarEdicao(comentario.id_comentario)} className="text-sm bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600">Salvar</button>
                    <button onClick={handleCancelarEdicao} className="text-sm bg-gray-500 text-white py-1 px-3 rounded hover:bg-gray-600">Cancelar</button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 mt-2">{comentario.conteudo}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}