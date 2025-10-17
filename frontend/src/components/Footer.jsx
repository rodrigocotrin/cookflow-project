// Arquivo: src/components/Footer.jsx
import React from 'react';

// --- Ícones Vetoriais Minimalistas (Mesmos de antes) ---
const IconMail = ({ className = "h-5 w-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);
const IconGitHub = ({ className = "h-5 w-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
  </svg>
);
const IconLinkedIn = ({ className = "h-5 w-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
    <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
  </svg>
);
const IconInstagram = ({ className = "h-5 w-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75h-9A6.75 6.75 0 00.75 10.5v3A6.75 6.75 0 007.5 20.25h9a6.75 6.75 0 006.75-6.75v-3A6.75 6.75 0 0016.5 3.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5a.75.75 0 01.75.75v.001a.75.75 0 01-1.5 0v-.001a.75.75 0 01.75-.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 110-6 3 3 0 010 6z" />
  </svg>
);


export default function Footer() {
  const anoAtual = new Date().getFullYear();

  // TODO: Substitua os URLs e o e-mail pelos seus links reais.
  const links = {
    email: 'mailto:rodrigo.cotrin@exemplo.com',
    github: 'https://github.com/rodrigocotrin',
    linkedin: 'https://linkedin.com/in/rodrigocotrin',
    instagram: 'https://instagram.com/rodrigocotrin',
    portfolio: 'https://rodrigocotrin.com',
  };

  return (
    // Estilo inspirado 1:1 no Header
    // bg-creme, py-4, px-6, shadow-md (EXATAMENTE como o header)
    // border-t-2 (em vez de border-b-2) e border-gray-100 (EXATAMENTE como o header)
    <footer className="bg-creme w-full py-4 px-6 shadow-xl/20 border-t-2 border-gray-100 sticky top-0 z-50">
      
      {/* Layout principal: container, flex, justify-between (EXATAMENTE como o header) */}
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        
        {/* 1. Nome (Esquerda) - Inspirado no Logo "CookFlow" */}
        <div className="text-center md:text-left">
          <span className="text-xl text-terracota-500">
            Rodrigo Cotrin
          </span>
          <p className="text-sm text-cinza-ardosia">Desenvolvedor Full-Stack</p>
        </div>

        {/* 2. Links Sociais (Centro) - Ícones com hover sutil */}
        <nav className="flex items-center space-x-6">
          <a href={links.email} title="E-mail" target="_blank" rel="noopener noreferrer" className="text-cinza-ardosia hover:text-terracota-500 transition-colors duration-200">
            <IconMail className="h-6 w-6" />
          </a>
          <a href={links.github} title="GitHub" target="_blank" rel="noopener noreferrer" className="text-cinza-ardosia hover:text-terracota-500 transition-colors duration-200">
            <IconGitHub className="h-5 w-5" />
          </a>
          <a href={links.linkedin} title="LinkedIn" target="_blank" rel="noopener noreferrer" className="text-cinza-ardosia hover:text-terracota-500 transition-colors duration-200">
            <IconLinkedIn className="h-5 w-5" />
          </a>
          <a href={links.instagram} title="Instagram" target="_blank" rel="noopener noreferrer" className="text-cinza-ardosia hover:text-terracota-500 transition-colors duration-200">
            <IconInstagram className="h-6 w-6" />
          </a>
        </nav>

        {/* 3. Copyright & Portfolio (Direita) - Inspirado nos links "Login" */}
        <div className="text-center md:text-right">
           <a 
              href={links.portfolio} 
              target="_blank" 
              rel="noopener noreferrer" 
              // Estilo EXATO do link "Login" do header
              className="font-semibold text-verde-floresta hover:text-terracota-500 transition-colors"
            >
              Ver Portfólio
            </a>
          <p className="text-sm text-cinza-ardosia mt-1">
            &copy; {anoAtual} CookFlow. Todos os direitos reservados.
          </p>
        </div>

      </div>
    </footer>
  );
}