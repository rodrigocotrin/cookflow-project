// src/pages/LoginPage.jsx
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContexto } from '../context/AuthContexto';

// --- Ícones para a UI ---
function IconeChave() {
  return (
    <div className="mx-auto h-12 w-12 text-terracota-500/50">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    </div>
  );
}
function IconeSetaDireita() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
    );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const { login } = useContext(AuthContexto);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');

    const sucesso = await login(email, senha);

    if (sucesso) {
      navigate('/');
    } else {
      setErro('E-mail ou senha inválidos. Tente novamente.');
    }
  };

  return (
    <div className="bg-creme min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* AQUI ESTÁ A MUDANÇA: max-w-lg para um formulário maior */}
      <div className="max-w-lg w-full space-y-8 p-10 bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl border border-black/5">
        
        <div>
          <IconeChave />
          <h2 className="mt-6 text-center text-3xl font-bold text-verde-floresta">
            Bem-vindo de volta
          </h2>
          <p className="mt-2 text-center text-md text-cinza-ardosia">
            Faça login para continuar sua jornada culinária.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 text-verde-floresta bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracota-500 transition-shadow"
                placeholder="Endereço de e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 text-verde-floresta bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracota-500 transition-shadow"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
          </div>

          {erro && (
            <p className="text-center text-sm text-red-600">
              {erro}
            </p>
          )}

          <div>
            <button
              type="submit"
              className="group w-full flex items-center justify-center py-3 px-4 border border-transparent font-bold rounded-lg text-white bg-verde-floresta hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracota-500"
            >
              Entrar
              <IconeSetaDireita />
            </button>
          </div>
          
          <div className="text-sm text-center">
            <p className="text-cinza-ardosia">
              Não tem uma conta?{' '}
              <Link to="/cadastro" className="font-medium text-terracota-500 hover:text-terracota-600 transition-colors">
                Cadastre-se
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}