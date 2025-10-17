// src/components/PasswordInput.jsx
import { useState } from 'react';
import { IconeOlho } from './Icones/IconeOlho';
import { IconeOlhoFechado } from './Icones/IconeOlhoFechado';

/**
 * Componente de Input de Senha com funcionalidade de "mostrar/ocultar".
 * Aceita todas as props de um <input> padrão.
 */
export default function PasswordInput({ 
  value, 
  onChange, 
  id = "password", 
  name = "password", 
  placeholder = "Senha", 
  required = true, 
  autoComplete = "current-password",
  className = "" // Permite classes customizadas
}) {
  
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  const label = showPassword ? "Ocultar senha" : "Mostrar senha";

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={showPassword ? 'text' : 'password'}
        autoComplete={autoComplete}
        required={required}
        // Classes base do projeto + pr-10 para o ícone
        className={`w-full px-4 py-3 text-verde-floresta bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracota-500 transition-shadow pr-10 ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        onClick={toggleShowPassword}
        // Posicionamento e estilo do botão
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-cinza-ardosia hover:text-verde-floresta focus:outline-none focus:ring-2 focus:ring-terracota-500 rounded-lg"
        aria-label={label}
        title={label} // Tooltip para acessibilidade
      >
        {showPassword ? (
          <IconeOlhoFechado className="h-5 w-5" />
        ) : (
          <IconeOlho className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}