// src/pages/LoginPage.jsx
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContexto } from '../context/AuthContexto';
import PasswordInput from '../components/PasswordInput';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { login } = useContext(AuthContexto);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    const resultado = await login(email, senha);

    if (resultado.sucesso) {
      toast.success('Bem-vindo de volta ao CookFlow!');
      navigate('/');
    } else {
      setErro(resultado.mensagem || 'E-mail ou senha inválidos. Tente novamente.');
      toast.error(resultado.mensagem || 'E-mail ou senha inválidos.');
      setCarregando(false);
    }
  };

  return (
    <div className="bg-creme min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-terracota-500 selection:text-white">
      <Helmet>
        <title>CookFlow — Login</title>
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-verde-floresta font-heading">
            Bem-vindo de volta
          </h1>
          <p className="mt-2 text-sm text-cinza-ardosia">
            Acesse suas receitas favoritas e planeje suas próximas refeições.
          </p>
        </div>
        
        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-xs font-bold text-verde-floresta uppercase tracking-wider mb-2">
                Endereço de E-mail
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3.5 text-verde-floresta bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracota-500/50 shadow-sm text-sm"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-bold text-verde-floresta uppercase tracking-wider">
                  Sua Senha
                </label>
                <Link
                  to="/recuperar-senha"
                  className="text-xs font-semibold text-terracota-500 hover:text-terracota-600 transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
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
                  <span>Entrar na Conta</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
          
          <div className="text-sm text-center pt-2">
            <p className="text-cinza-ardosia">
              Ainda não tem uma conta?{' '}
              <Link to="/cadastro" className="font-bold text-terracota-500 hover:text-terracota-600 transition-colors underline">
                Cadastre-se grátis
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}