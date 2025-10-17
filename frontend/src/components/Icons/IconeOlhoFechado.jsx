// src/components/Icones/IconeOlhoFechado.jsx
// Ícone "Olho Fechado/Riscado" (Heroicons)

export function IconeOlhoFechado({ className = "h-5 w-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 14.303 7.23 17.668 12 17.668c.307 0 .61-.01.91-.03a10.45 10.45 0 003.525-1.025m3.7-3.725A10.45 10.45 0 0022.066 12c-1.292-2.303-5.296-5.668-9.999-5.668-.307 0-.61.01-.91.03a10.45 10.45 0 00-3.525 1.025m3.7 3.725l3.7 3.725m0 0l-3.7-3.725M12 15a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21L3 3" />
    </svg>
  );
}