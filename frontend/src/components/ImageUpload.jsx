// Arquivo: frontend/src/components/ImageUpload.jsx
import { useState, useRef, useEffect } from 'react';
import api, { resolverUrlImagem } from '../services/api';
import { toast } from 'react-toastify';

const SUGESTOES_IMAGEM_FOOD = [
  { nome: 'Massa Artesanal', url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281230?auto=format&fit=crop&w=800&q=80' },
  { nome: 'Sobremesa / Bolo', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80' },
  { nome: 'Grelhado / Carne', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
  { nome: 'Salada / Saudável', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80' },
];

export default function ImageUpload({ valorAtual, aoMudarImagem, label = "Foto da Receita" }) {
  const [modo, setModo] = useState(valorAtual && valorAtual.startsWith('http') && !valorAtual.includes('localhost') && !valorAtual.includes('/uploads/') ? 'url' : 'arquivo');
  const [urlManual, setUrlManual] = useState(valorAtual || '');
  const [uploadando, setUploadando] = useState(false);
  const [arrastando, setArrastando] = useState(false);
  const [statusValidacao, setStatusValidacao] = useState(null); // 'validando' | 'valida' | 'invalida'
  const [motivoInvalido, setMotivoInvalido] = useState('');
  const fileInputRef = useRef(null);

  // Valida integridade e dimensões reais de qualquer imagem carregada
  const validarImagemReal = (fonteImagem) => {
    return new Promise((resolve) => {
      setStatusValidacao('validando');
      const img = new Image();
      img.onload = () => {
        if (img.width < 150 || img.height < 150) {
          setStatusValidacao('invalida');
          setMotivoInvalido('A resolução da imagem é muito baixa (mínimo de 150x150 pixels).');
          resolve(false);
        } else {
          setStatusValidacao('valida');
          setMotivoInvalido('');
          resolve(true);
        }
      };
      img.onerror = () => {
        setStatusValidacao('invalida');
        setMotivoInvalido('Não foi possível carregar a imagem. Verifique se o arquivo ou link está correto.');
        resolve(false);
      };
      img.src = resolverUrlImagem(fonteImagem);
    });
  };

  useEffect(() => {
    if (valorAtual) {
      validarImagemReal(valorAtual);
    } else {
      setStatusValidacao(null);
      setMotivoInvalido('');
    }
  }, [valorAtual]);

  const handleUploadArquivo = async (arquivo) => {
    if (!arquivo) return;

    // Barreira 1: Tipo MIME
    const tiposValidos = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/avif'];
    if (!tiposValidos.includes(arquivo.type.toLowerCase())) {
      toast.error('Barreira de Segurança: Selecione apenas arquivos de imagem reais (JPG, PNG, WEBP, GIF).');
      return;
    }

    // Barreira 2: Tamanho máximo (5MB)
    if (arquivo.size > 5 * 1024 * 1024) {
      toast.error('O tamanho da foto não pode exceder 5MB.');
      return;
    }

    // Barreira 3: Validar integridade e dimensões antes do upload
    const objectUrl = URL.createObjectURL(arquivo);
    const imagemValida = await validarImagemReal(objectUrl);
    if (!imagemValida) {
      toast.error(motivoInvalido || 'O arquivo selecionado não é uma imagem válida.');
      URL.revokeObjectURL(objectUrl);
      return;
    }
    URL.revokeObjectURL(objectUrl);

    const formData = new FormData();
    formData.append('imagem', arquivo);

    setUploadando(true);
    try {
      const resposta = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const urlGerada = resposta.data.url;
      aoMudarImagem(urlGerada);
      setUrlManual(urlGerada);
      toast.success('Foto verificada e enviada com sucesso! ✨');
    } catch (erro) {
      console.error('Erro no upload de imagem:', erro);
      toast.error(erro.response?.data?.mensagem || 'Falha ao processar a foto. Use a opção de colar link web caso persista.');
    } finally {
      setUploadando(false);
    }
  };

  const handleAplicarUrlManual = async (url) => {
    setUrlManual(url);
    if (!url || url.trim() === '') {
      aoMudarImagem('');
      setStatusValidacao(null);
      return;
    }

    const urlTrim = url.trim();
    if (!urlTrim.startsWith('http://') && !urlTrim.startsWith('https://') && !urlTrim.startsWith('/uploads/')) {
      setStatusValidacao('invalida');
      setMotivoInvalido('O link precisa começar com https://');
      return;
    }

    const valida = await validarImagemReal(urlTrim);
    if (valida) {
      aoMudarImagem(urlTrim);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setArrastando(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setArrastando(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setArrastando(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadArquivo(e.dataTransfer.files[0]);
    }
  };

  const handleRemoverImagem = (e) => {
    e.stopPropagation();
    aoMudarImagem('');
    setUrlManual('');
    setStatusValidacao(null);
    setMotivoInvalido('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const previewSrc = resolverUrlImagem(valorAtual || urlManual);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <label className="block text-sm font-bold text-verde-floresta tracking-wide">
          {label} <span className="text-terracota-500">*</span>
        </label>

        {/* Alternância de Modo */}
        <div className="flex bg-creme-200/80 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setModo('arquivo')}
            className={`px-3 py-1 rounded-lg transition-all ${
              modo === 'arquivo'
                ? 'bg-white text-terracota-600 shadow-sm'
                : 'text-cinza-ardosia hover:text-verde-floresta'
            }`}
          >
            📁 Fazer Upload
          </button>
          <button
            type="button"
            onClick={() => setModo('url')}
            className={`px-3 py-1 rounded-lg transition-all ${
              modo === 'url'
                ? 'bg-white text-terracota-600 shadow-sm'
                : 'text-cinza-ardosia hover:text-verde-floresta'
            }`}
          >
            🔗 Colar Link Web
          </button>
        </div>
      </div>

      {/* Indicador de Barreira de Validação */}
      {statusValidacao === 'valida' && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium">
          <span>✅</span>
          <span>Foto aprovada pelo sistema de verificação</span>
        </div>
      )}

      {statusValidacao === 'invalida' && motivoInvalido && (
        <div className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl font-medium">
          <span>⚠️</span>
          <span>{motivoInvalido}</span>
        </div>
      )}

      {modo === 'arquivo' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploadando && fileInputRef.current?.click()}
          className={`relative group h-60 w-full rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
            arrastando
              ? 'border-terracota-500 bg-terracota-50/50 scale-[1.01]'
              : valorAtual
              ? 'border-verde-floresta/20 bg-verde-floresta/5'
              : 'border-zinc-300 hover:border-terracota-500/60 bg-white/70 hover:bg-white'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg,image/gif,image/avif"
            onChange={(e) => e.target.files?.[0] && handleUploadArquivo(e.target.files[0])}
            className="hidden"
          />

          {uploadando ? (
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              <div className="w-10 h-10 border-4 border-terracota-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-verde-floresta animate-pulse">
                Processando e validando imagem...
              </p>
            </div>
          ) : valorAtual ? (
            <div className="relative w-full h-full group">
              <img
                src={previewSrc}
                alt="Pré-visualização da Foto"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                <span className="bg-white/90 backdrop-blur-sm text-verde-floresta font-bold text-xs px-3.5 py-2 rounded-xl shadow-md">
                  Clique para trocar a foto
                </span>
                <button
                  type="button"
                  onClick={handleRemoverImagem}
                  className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-xl shadow-md transition-transform hover:scale-110"
                  title="Remover foto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-terracota-50 text-terracota-500 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="font-bold text-sm text-verde-floresta mt-1">
                Arraste sua foto aqui ou <span className="text-terracota-500 underline">clique para selecionar</span>
              </p>
              <p className="text-xs text-cinza-ardosia">
                Formatos aceitos: JPG, PNG, WEBP (Mín. 150x150, Máx. 5MB)
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="url"
              placeholder="Cole o link da foto (ex: https://images.unsplash.com/...)"
              value={urlManual}
              onChange={(e) => handleAplicarUrlManual(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl text-verde-floresta text-sm focus:outline-none focus:ring-2 focus:ring-terracota-500/50 shadow-sm"
            />
          </div>

          {/* Sugestões Rápidas de Fotos de Alta Qualidade */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-cinza-ardosia">Ou escolha uma foto de alta resolução:</span>
            <div className="flex flex-wrap gap-2">
              {SUGESTOES_IMAGEM_FOOD.map((sug) => (
                <button
                  key={sug.nome}
                  type="button"
                  onClick={() => handleAplicarUrlManual(sug.url)}
                  className="px-2.5 py-1 text-xs bg-creme-200/70 hover:bg-terracota-100 hover:text-terracota-600 text-verde-floresta font-semibold rounded-lg transition-colors border border-zinc-200"
                >
                  {sug.nome}
                </button>
              ))}
            </div>
          </div>

          {valorAtual && (
            <div className="h-44 w-full rounded-2xl overflow-hidden border border-zinc-200 relative group bg-zinc-100 shadow-sm">
              <img
                src={previewSrc}
                alt="Pré-visualização por link"
                className="w-full h-full object-cover"
                onError={() => {
                  setStatusValidacao('invalida');
                  setMotivoInvalido('O link fornecido não aponta para uma imagem válida.');
                }}
              />
              <button
                type="button"
                onClick={handleRemoverImagem}
                className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white p-2 rounded-xl shadow transition-transform hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
