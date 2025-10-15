import { useState, useEffect } from "react";

// === ÍCONES SVG MODERNOS E PADRONIZADOS ===
const EstrelaCheia = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="#FACC15"
    className="w-full h-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-transform duration-150 ease-out"
  >
    <path
      fillRule="evenodd"
      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 
         5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 
         3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 
         1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273
         -4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 
         2.082-5.007z"
      clipRule="evenodd"
    />
  </svg>
);

const MeiaEstrela = () => (
  <div className="relative w-full h-full">
    {/* Borda */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="#FACC15"
      className="absolute w-full h-full"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.5a.562.562 0 011.04 0l2.125 
          5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204
          3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 
          0 01-.84.61l-4.725-2.885a.563.563 
          0 00-.586 0L6.982 20.54a.562.562 
          0 01-.84-.61l1.285-5.386a.562.562 
          0 00-.182-.557l-4.204-3.602a.563.563 
          0 01.321-.988l5.518-.442a.563.563 
          0 00.475-.345L11.48 3.5z"
      />
    </svg>
    {/* Metade preenchida */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="#FACC15"
      className="absolute w-full h-full"
      style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0% 100%)" }}
    >
      <path
        fillRule="evenodd"
        d="M10.788 3.21c.448-1.077 1.976-1.077 
           2.424 0l2.082 5.007 5.404.433c1.164.093 
           1.636 1.545.749 2.305l-4.117 3.527 
           1.257 5.273c.271 1.136-.964 2.033-1.96 
           1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273
           -4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 
           2.082-5.007z"
        clipRule="evenodd"
      />
    </svg>
  </div>
);

const EstrelaVazia = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="#D1D5DB"
    className="w-full h-full transition-colors duration-150"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.48 3.499a.562.562 0 011.04 0l2.125 
         5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204
         3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 
         0 01-.84.61l-4.725-2.885a.563.563 
         0 00-.586 0L6.982 20.54a.562.562 
         0 01-.84-.61l1.285-5.386a.562.562 
         0 00-.182-.557l-4.204-3.602a.563.563 
         0 01.321-.988l5.518-.442a.563.563 
         0 00.475-.345L11.48 3.5z"
    />
  </svg>
);

export default function AvaliacaoEstrelas({
  tamanho = "w-5 h-5",
  interativo = false,
  valorInicial = 0,
  aoAvaliar = () => {},
}) {
  const [avaliacao, setAvaliacao] = useState(valorInicial);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    setAvaliacao(valorInicial);
  }, [valorInicial]);

  const handleClick = (valor) => {
    if (interativo) {
      setAvaliacao(valor);
      aoAvaliar(valor);
    }
  };

  const handleMouseEnter = (valor) => {
    if (interativo) setHover(valor);
  };
  const handleMouseLeave = () => {
    if (interativo) setHover(0);
  };

  const valorAtual = hover || avaliacao;

  return (
    <div className="flex gap-1 select-none" onMouseLeave={handleMouseLeave}>
      {[...Array(5)].map((_, index) => {
        const valorEstrela = index + 1;
        const estrela =
          valorAtual >= valorEstrela
            ? <EstrelaCheia />
            : valorAtual >= valorEstrela - 0.5
            ? <MeiaEstrela />
            : <EstrelaVazia />;
        return (
          <div
            key={index}
            className={`relative ${tamanho} ${
              interativo ? "cursor-pointer hover:scale-110" : ""
            } transition-transform`}
          >
            {interativo && (
              <>
                <span
                  className="absolute top-0 left-0 w-1/2 h-full z-10"
                  onMouseEnter={() => handleMouseEnter(valorEstrela - 0.5)}
                  onClick={() => handleClick(valorEstrela - 0.5)}
                />
                <span
                  className="absolute top-0 right-0 w-1/2 h-full z-10"
                  onMouseEnter={() => handleMouseEnter(valorEstrela)}
                  onClick={() => handleClick(valorEstrela)}
                />
              </>
            )}
            {estrela}
          </div>
        );
      })}
    </div>
  );
}
