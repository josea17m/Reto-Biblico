import { useState } from "react";
import { alternarSilencio, estaSilenciado } from "../lib/sonido";

/** Interruptor de sonido. La preferencia se guarda en el navegador. */
const BotonSonido = () => {
  const [silencio, setSilencio] = useState(estaSilenciado);

  return (
    <button
      type="button"
      onClick={() => setSilencio(alternarSilencio())}
      aria-pressed={silencio}
      aria-label={silencio ? "Activar el sonido" : "Silenciar el sonido"}
      title={silencio ? "Activar el sonido" : "Silenciar el sonido"}
      className="rounded-lg px-2 py-1 text-lg text-slate-400 transition hover:text-oro-400"
    >
      {silencio ? "🔇" : "🔊"}
    </button>
  );
};

export default BotonSonido;
