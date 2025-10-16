// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

// --- Ícones para a UI ---
function IconeUsuarioPlus() {
  return (
    <div className="mx-auto h-12 w-12 text-terracota-500/50">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
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

export default function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!nome || !email || !senha) {
      setErro('Todos os campos são obrigatórios.');
      return;
    }

    try {
      await api.post('/usuarios', { nome, email, senha });
      setSucesso('Cadastro realizado com sucesso! Redirecionando...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.mensagem) {
        setErro(err.response.data.mensagem);
      } else {
        setErro('Ocorreu um erro ao tentar fazer o cadastro. Tente novamente.');
      }
    }
  };

  return (
    <div className="bg-creme min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 p-10 bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl border border-black/5">
        
        <div>
          <IconeUsuarioPlus />
          <h2 className="mt-6 text-center text-3xl font-bold text-verde-floresta">
            Crie sua conta
          </h2>
          <p className="mt-2 text-center text-md text-cinza-ardosia">
            Junte-se à comunidade e comece a cozinhar.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">Nome</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-3 text-verde-floresta bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracota-500 transition-shadow"
                placeholder="Nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
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
                required
                className="w-full px-4 py-3 text-verde-floresta bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracota-500 transition-shadow"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
          </div>

          {erro && <p className="mt-2 text-center text-sm text-red-600">{erro}</p>}
          {sucesso && <p className="mt-2 text-center text-sm text-green-600">{sucesso}</p>}

          <div>
            <button
              type="submit"
              className="group w-full flex items-center justify-center py-3 px-4 border border-transparent font-bold rounded-lg text-white bg-verde-floresta hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracota-500"
            >
              Criar conta
              <IconeSetaDireita />
            </button>
          </div>
          
          <div className="text-sm text-center">
            <p className="text-cinza-ardosia">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-medium text-terracota-500 hover:text-terracota-600 transition-colors">
                Faça login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}