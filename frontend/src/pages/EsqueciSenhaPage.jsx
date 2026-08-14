// Arquivo: frontend/src/pages/EsqueciSenhaPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PasswordInput from '../components/PasswordInput';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';

export default function EsqueciSenhaPage() {
  const [etapa, setEtapa] = useState(1); // 1: Solicitar código, 2: Inserir código e nova senha
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [codigoDemo, setCodigoDemo] = useState(null);
  const navigate = useNavigate();

  const handleSolicitarCodigo = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.warning('Por favor, informe o seu endereço de e-mail.');
      return;
    }

    setCarregando(true);
    try {
      const resposta = await api.post('/recuperar-senha', { email: email.trim() });
      toast.success(resposta.data?.mensagem || 'Código de verificação gerado com sucesso!');
      if (resposta.data?.codigo_demo) {
        setCodigoDemo(resposta.data.codigo_demo);
        setCodigo(resposta.data.codigo_demo); // Auto-preenche para conveniência
      }
      setEtapa(2);
    } catch (erro) {
      console.error('Erro ao solicitar código:', erro);
      toast.error(erro.response?.data?.mensagem || 'Erro ao processar solicitação.');
    } finally {
      setCarregando(false);
    }
  };

  const handleRedefinirSenha = async (e) => {
    e.preventDefault();

    if (!codigo.trim()) {
      toast.warning('Por favor, informe o código de 6 dígitos.');
      return;
    }

    if (novaSenha.length < 6) {
      toast.warning('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast.error('As senhas digitadas não coincidem.');
      return;
    }

    setCarregando(true);
    try {
      const resposta = await api.post('/redefinir-senha', {
        email: email.trim(),
        codigo: codigo.trim(),
        novaSenha
      });

      toast.success(resposta.data?.mensagem || 'Senha alterada com sucesso!');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (erro) {
      console.error('Erro ao redefinir senha:', erro);
      toast.error(erro.response?.data?.mensagem || 'Código inválido ou expirado.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="bg-creme min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-terracota-500 selection:text-white">
      <Helmet>
        <title>CookFlow — Recuperação de Senha</title>
      </Helmet>

      <div className="max-w-md w-full space-y-8 p-8 sm:p-10 glass-panel shadow-card rounded-3xl border border-white/80 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-terracota-50 text-terracota-500 flex items-center justify-center shadow-inner mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-verde-floresta font-heading">
            {etapa === 1 ? 'Esqueceu sua senha?' : 'Criar nova senha'}
          </h1>
          <p className="mt-2 text-sm text-cinza-ardosia">
            {etapa === 1 
              ? 'Não se preocupe! Digite seu e-mail cadastrado para enviarmos um código de recuperação.' 
              : `Enviamos o código para ${email}. Insira o código e digite sua nova senha.`}
          </p>
        </div>

        {codigoDemo && etapa === 2 && (
          <div className="bg-amber-50/90 border border-amber-200 p-3 rounded-xl text-center text-xs text-amber-800">
            <span className="font-bold">Código de Recuperação: </span>
            <span className="font-mono font-bold text-sm text-terracota-600 bg-white px-2 py-0.5 rounded border border-amber-300">
              {codigoDemo}
            </span>
          </div>
        )}

        {etapa === 1 ? (
          <form onSubmit={handleSolicitarCodigo} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-verde-floresta uppercase tracking-wider mb-2">
                Endereço de E-mail
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white border border-zinc-300 rounded-xl text-verde-floresta text-sm focus:outline-none focus:ring-2 focus:ring-terracota-500/50 shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
            >
              {carregando ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Enviar Código de Recuperação</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRedefinirSenha} className="mt-8 space-y-5">
            <div>
              <label htmlFor="codigo" className="block text-xs font-bold text-verde-floresta uppercase tracking-wider mb-2">
                Código de 6 dígitos
              </label>
              <input
                id="codigo"
                type="text"
                maxLength="6"
                required
                placeholder="Ex: 123456"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl text-center font-mono font-bold text-lg tracking-widest text-verde-floresta focus:outline-none focus:ring-2 focus:ring-terracota-500/50 shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="nova-senha" className="block text-xs font-bold text-verde-floresta uppercase tracking-wider mb-2">
                Nova Senha
              </label>
              <PasswordInput
                id="nova-senha"
                name="novaSenha"
                placeholder="Mínimo de 6 caracteres"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="confirmar-senha" className="block text-xs font-bold text-verde-floresta uppercase tracking-wider mb-2">
                Confirmar Nova Senha
              </label>
              <PasswordInput
                id="confirmar-senha"
                name="confirmarSenha"
                placeholder="Repita sua nova senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
            >
              {carregando ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Salvar Nova Senha</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setEtapa(1)}
              className="w-full text-center text-xs text-cinza-ardosia hover:text-terracota-500 transition-colors py-1"
            >
              Voltar e reenviar código para outro e-mail
            </button>
          </form>
        )}

        <div className="text-center pt-4 border-t border-zinc-200/60">
          <Link
            to="/login"
            className="inline-flex items-center text-sm font-semibold text-verde-floresta hover:text-terracota-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Lembrou sua senha? Faça login
          </Link>
        </div>
      </div>
    </div>
  );
}
