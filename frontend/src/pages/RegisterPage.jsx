// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import PasswordInput from '../components/PasswordInput';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErro('');

    if (!nome.trim() || !email.trim() || !senha) {
      toast.warning('Todos os campos são obrigatórios.');
      return;
    }

    if (senha.length < 6) {
      toast.warning('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setCarregando(true);
    try {
      await api.post('/usuarios', { nome: nome.trim(), email: email.trim(), senha });
      toast.success('Conta criada com sucesso! Redirecionando para login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.mensagem || 'Ocorreu um erro ao tentar fazer o cadastro. Tente novamente.';
      setErro(msg);
      toast.error(msg);
      setCarregando(false);
    }
  };

  return (
    <div className="bg-creme min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-terracota-500 selection:text-white">
      <Helmet>
        <title>CookFlow — Crie sua Conta Grátis</title>
      </Helmet>

      <div className="max-w-md w-full space-y-8 p-8 sm:p-10 glass-panel shadow-card rounded-3xl border border-white/80 animate-fade-in">
        
        {/* Cabeçalho */}
        <div className="text-center">
          <Link to="/" className="inline-block mb-4">
            <span className="text-3xl font-extrabold text-terracota-500 font-heading tracking-tight">
              CookFlow
            </span>
          </Link>
          <div className="mx-auto w-14 h-14 rounded-2xl bg-terracota-50 text-terracota-500 flex items-center justify-center shadow-inner mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-verde-floresta font-heading">
            Crie sua conta
          </h1>
          <p className="mt-2 text-sm text-cinza-ardosia">
            Junte-se a milhares de amantes da boa culinária.
          </p>
        </div>
        
        <form className="mt-8 space-y-5" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-verde-floresta uppercase tracking-wider mb-2">
                Nome Completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-3.5 text-verde-floresta bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracota-500/50 shadow-sm text-sm"
                placeholder="Ex: Chef Rodrigo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="email-address" className="block text-xs font-bold text-verde-floresta uppercase tracking-wider mb-2">
                Endereço de E-mail
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3.5 text-verde-floresta bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracota-500/50 shadow-sm text-sm"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-verde-floresta uppercase tracking-wider mb-2">
                Senha Segura
              </label>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                required
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
          </div>

          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center text-xs font-medium text-red-600 animate-fade-in">
              {erro}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={carregando}
              className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
            >
              {carregando ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Criar Conta Gratuita</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
          
          <div className="text-sm text-center pt-2">
            <p className="text-cinza-ardosia">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-bold text-terracota-500 hover:text-terracota-600 transition-colors underline">
                Faça login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}