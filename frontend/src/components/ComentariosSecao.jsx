import { useState, useEffect, useContext, useRef } from "react";
import api from "../services/api";
import { AuthContexto } from "../context/AuthContexto";
import AvaliacaoEstrelas from "./AvaliacaoEstrelas";

function useAutoResizeTextarea(value) {
  const ref = useRef(null);
  useEffect(() => {
    const textarea = ref.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);
  return ref;
}

export default function ComentariosSecao({ idReceita }) {
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [nota, setNota] = useState(0);
  const { assinado } = useContext(AuthContexto);
  const textareaRef = useAutoResizeTextarea(novoComentario);

  const buscarComentarios = async () => {
    try {
      const resposta = await api.get(`/receitas/${idReceita}/comentarios`);
      setComentarios(resposta.data);
    } catch (error) {
      console.error("Erro ao buscar comentários", error);
    }
  };

  useEffect(() => {
    if (idReceita) buscarComentarios();
  }, [idReceita]);

  const handlePublicar = async () => {
    if (!novoComentario.trim() || nota === 0) {
      alert("Por favor, escreva um comentário e selecione uma nota.");
      return;
    }
    try {
      await api.post(`/receitas/${idReceita}/comentar`, {
        conteudo: novoComentario,
        nota: nota,
      });
      setNovoComentario("");
      setNota(0);
      buscarComentarios();
    } catch (error) {
      console.error("Erro ao publicar comentário", error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-verde-floresta mb-4">Comentários</h2>

      {assinado && (
        <div className="bg-gray-50 p-4 rounded-lg border mb-8 shadow-sm">
          <p className="font-semibold text-cinza-ardosia mb-2">
            O que você achou desta receita?
          </p>

          <AvaliacaoEstrelas
            interativo={true}
            valorInicial={nota}
            aoAvaliar={setNota}
          />

          <textarea
            ref={textareaRef}
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            placeholder="Conte-nos o que você achou ou faça uma pergunta..."
            className="w-full p-3 mt-3 border border-gray-300 rounded-md resize-none overflow-hidden focus:ring-2 focus:ring-verde-floresta/30"
            rows="2"
          />

          <div className="flex justify-end mt-3">
            <button
              onClick={handlePublicar}
              className="bg-verde-floresta text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-all"
            >
              Publicar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {comentarios.length > 0 ? (
          comentarios.map((comentario) => (
            <div key={comentario.id_comentario} className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-terracota-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {comentario.nome_usuario.charAt(0).toUpperCase()}
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-verde-floresta">
                    {comentario.nome_usuario}
                  </span>
                  <AvaliacaoEstrelas
                    tamanho="w-5 h-5"
                    valorInicial={comentario.nota_avaliacao}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(comentario.data_criacao).toLocaleDateString()}
                </p>
                <p className="mt-2 text-cinza-ardosia">{comentario.conteudo}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-cinza-ardosia italic">
            Ainda não há comentários. Seja o primeiro a comentar!
          </p>
        )}
      </div>
    </div>
  );
}
