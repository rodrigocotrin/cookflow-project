// Arquivo: src/components/AvaliacaoEstrelas.jsx
import { useState, useEffect } from 'react';

// O componente agora aceita um 'valorInicial'
export default function AvaliacaoEstrelas({ totalEstrelas = 5, aoAvaliar = () => {}, valorInicial = 0 }) {
  const [avaliacao, setAvaliacao] = useState(valorInicial);
  const [hover, setHover] = useState(0);

  // Sincroniza o estado interno se o valor inicial mudar
  useEffect(() => {
    setAvaliacao(valorInicial);
  }, [valorInicial]);

  const handleClick = (valor) => {
    setAvaliacao(valor);
    aoAvaliar(valor);
  };

  return (
    <div className="flex">
      {[...Array(totalEstrelas)].map((_, index) => {
        const valorEstrela = index + 1;

        return (
          <div
            key={index}
            className="relative text-3xl cursor-pointer"
            onMouseLeave={() => setHover(0)}
          >
            <span className="text-gray-300">&#9733;</span>
            <span
              className="absolute top-0 left-0 h-full overflow-hidden text-yellow-400"
              style={{ width: `${(hover || avaliacao) >= valorEstrela ? 100 : (hover || avaliacao) >= valorEstrela - 0.5 ? 50 : 0}%` }}
            >
              &#9733;
            </span>
            <span 
              className="absolute top-0 left-0 w-1/2 h-full"
              onMouseEnter={() => setHover(valorEstrela - 0.5)}
              onClick={() => handleClick(valorEstrela - 0.5)}
            ></span>
            <span 
              className="absolute top-0 right-0 w-1/2 h-full"
              onMouseEnter={() => setHover(valorEstrela)}
              onClick={() => handleClick(valorEstrela)}
            ></span>
          </div>
        );
      })}
    </div>
  );
}