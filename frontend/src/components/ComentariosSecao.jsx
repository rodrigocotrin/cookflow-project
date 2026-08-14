import { useState, useEffect, useContext, useRef } from "react";
import api from "../services/api";
import { AuthContexto } from "../context/AuthContexto";
import AvaliacaoEstrelas from "./AvaliacaoEstrelas";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

function useAutoResizeTextarea(value) {
  const ref = useRef(null);
  useEffect(() => {
    const textarea = ref.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
    }
  }, [value]);
  return ref;
}

export default function ComentariosSecao({ idReceita, aoAtualizarStats }) {
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [nota, setNota] = useState(5);
  const [enviando, setEnviando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const { assinado, utilizador } = useContext(AuthContexto);
  const textareaRef = useAutoResizeTextarea(novoComentario);

  const buscarComentarios = async () => {
    try {
      setCarregando(true);
      const resposta = await api.get(`/receitas/${idReceita}/comentarios`);
      setComentarios(resposta.data);
    } catch (error) {
      console.error("Erro ao buscar comentários", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (idReceita) {
      buscarComentarios();
      if (assinado) {
        api.get(`/receitas/${idReceita}/minha-avaliacao`)
          .then(res => {
            if (res.data?.nota > 0) {
              setNota(res.data.nota);
            }
          })
          .catch(() => {});
      }
    }
  }, [idReceita, assinado]);

  const handlePublicar = async (e) => {
    e.preventDefault();
    if (!novoComentario.trim()) {
      toast.warning("Por favor, escreva um comentário sobre a sua experiência com a receita.");
      return;
    }

    setEnviando(true);
    try {
      const resposta = await api.post(`/receitas/${idReceita}/comentar`, {
        conteudo: novoComentario,
        nota: Number(nota),
      });

      toast.success("Avaliação e comentário publicados!");
      setNovoComentario("");
      
      // Notifica o componente pai com a nova média calculada
      if (aoAtualizarStats && resposta.data) {
        aoAtualizarStats({
          media_avaliacoes: resposta.data.media_avaliacoes,
          total_avaliacoes: resposta.data.total_avaliacoes
        });
      }

      buscarComentarios();
    } catch (error) {
      console.error("Erro ao publicar comentário", error);
      toast.error(error.response?.data?.mensagem || "Não foi possível publicar seu comentário.");
    } finally {
      setEnviando(false);
    }
  };

  const handleDeletarComentario = async (idComentario) => {
    if (!window.confirm("Deseja realmente excluir este comentário?")) return;

    try {
      await api.delete(`/comentarios/${idComentario}`);
      toast.success("Comentário excluído.");
      setComentarios(prev => prev.filter(c => c.id_comentario !== idComentario));
    } catch (error) {
      console.error("Erro ao deletar comentário:", error);
      toast.error(error.response?.data?.mensagem || "Não foi possível excluir o comentário.");
    }
  };

  return (
    <div id="comentarios" className="space-y-6">
      <div className="flex justify-between items-center border-b border-zinc-200/80 pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-verde-floresta font-heading">
            Avaliações e Comentários
          </h2>
          <p className="text-sm text-cinza-ardosia mt-1">
            Veja o que outros cozinheiros acharam desta receita
          </p>
        </div>
        <span className="bg-terracota-50 text-terracota-600 font-bold text-sm px-3.5 py-1.5 rounded-full border border-terracota-200">
          {comentarios.length} {comentarios.length === 1 ? 'opinião' : 'opiniões'}
        </span>
      </div>

      {/* Caixa de Criação de Comentário */}
      {assinado ? (
        <form onSubmit={handlePublicar} className="glass-panel p-6 rounded-2xl shadow-card border border-white/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
            <div>
              <p className="font-bold text-verde-floresta text-sm">
                Qual sua nota para esta receita?
              </p>
              <p className="text-xs text-cinza-ardosia">
                Clique nas estrelas para avaliar
              </p>
            </div>
            <AvaliacaoEstrelas
              tamanho="w-7 h-7"
              interativo={true}
              valorInicial={nota}
              aoAvaliar={setNota}
              mostrarRotulo={true}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-cinza-ardosia uppercase tracking-wider mb-2">
              Seu Comentário ou Dica Culunária
            </label>
            <textarea
              ref={textareaRef}
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
              placeholder="Fale sobre o sabor, facilidade, substituições de ingredientes ou dicas para os próximos chefs..."
              className="w-full p-4 text-sm bg-white/90 border border-zinc-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-terracota-500/50 shadow-inner"
              rows="3"
              required
            />
          </div>

          <div className="flex justify-end items-center gap-3">
            <button
              type="submit"
              disabled={enviando}
              className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {enviando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Publicando...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Publicar Avaliação</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-creme-200/60 p-6 rounded-2xl border border-terracota-500/20 text-center flex flex-col items-center justify-center gap-3">
          <p className="font-semibold text-verde-floresta">
            Deseja avaliar ou deixar sua opinião sobre esta receita?
          </p>
          <Link
            to="/login"
            className="btn-primary py-2 px-6 text-sm"
          >
            Faça login para comentar
          </Link>
        </div>
      )}

      {/* Lista de Comentários */}
      <div className="space-y-4 pt-2">
        {carregando ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white/60 p-5 rounded-2xl animate-pulse flex gap-4">
                <div className="w-12 h-12 rounded-full bg-zinc-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-200 rounded w-1/4"></div>
                  <div className="h-3 bg-zinc-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : comentarios.length > 0 ? (
          comentarios.map((comentario) => {
            const eMeuComentario = assinado && utilizador && utilizador.id_usuario === comentario.id_usuario;
            const inicial = comentario.nome_usuario ? comentario.nome_usuario.charAt(0).toUpperCase() : '?';

            return (
              <div
                key={comentario.id_comentario}
                className="bg-white/85 backdrop-blur-sm p-5 rounded-2xl border border-zinc-200/70 shadow-sm hover:shadow-md transition-all flex gap-4 items-start"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-terracota-500 to-terracota-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
                  {inicial}
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-verde-floresta text-sm sm:text-base truncate">
                        {comentario.nome_usuario}
                      </span>
                      {comentario.nota_avaliacao && (
                        <div className="bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 flex items-center gap-1">
                          <AvaliacaoEstrelas
                            tamanho="w-3.5 h-3.5"
                            valorInicial={comentario.nota_avaliacao}
                          />
                          <span className="text-xs font-bold text-amber-700 ml-0.5">
                            {parseFloat(comentario.nota_avaliacao).toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-cinza-ardosia">
                        {new Date(comentario.data_criacao).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>

                      {eMeuComentario && (
                        <button
                          onClick={() => handleDeletarComentario(comentario.id_comentario)}
                          className="text-zinc-400 hover:text-red-600 transition-colors p-1"
                          title="Excluir meu comentário"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="mt-2.5 text-sm text-verde-floresta/90 leading-relaxed break-words whitespace-pre-line">
                    {comentario.conteudo}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 px-4 bg-white/50 rounded-2xl border border-dashed border-zinc-300">
            <div className="text-3xl mb-2">🧑‍🍳</div>
            <h4 className="font-bold text-verde-floresta text-base">Ainda não há comentários</h4>
            <p className="text-xs text-cinza-ardosia mt-1 max-w-sm mx-auto">
              Seja o primeiro a preparar esta receita e compartilhar sua experiência com a comunidade!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
