import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import BotonSonido from "../components/BotonSonido";
import { guardarJugador, leerJugador } from "../lib/almacenamiento";

const LARGO_MAXIMO = 24;

const Inicio = () => {
  const [nombre, setNombre] = useState(leerJugador);
  const [error, setError] = useState("");
  const navegar = useNavigate();

  const jugar = (evento) => {
    evento.preventDefault();
    const limpio = nombre.trim();
    if (!limpio) {
      setError("Escribe tu nombre para comenzar.");
      return;
    }
    guardarJugador(limpio);
    navegar("/juego");
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-10 p-6">
      <header className="text-center">
        <div className="flex justify-end">
          <BotonSonido />
        </div>
        <h1 className="font-titulo text-5xl font-bold text-oro-400">Reto Bíblico</h1>
        <p className="mt-3 text-slate-300">
          Quince preguntas, tres comodines y un millón de talentos en juego.
        </p>
      </header>

      <form onSubmit={jugar} className="flex flex-col gap-6" noValidate>
        <div className="flex flex-col gap-2">
          <label htmlFor="nombre" className="text-sm font-semibold text-slate-300">
            Tu nombre
          </label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            maxLength={LARGO_MAXIMO}
            autoComplete="off"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "error-nombre" : undefined}
            onChange={(evento) => {
              setNombre(evento.target.value);
              if (error) setError("");
            }}
            placeholder="Ej. Josué"
            className="rounded-xl border border-white/20 bg-noche-800/70 px-4 py-4
                       font-semibold text-slate-100 placeholder:text-slate-500
                       focus:border-oro-400"
          />
          {error && (
            <p id="error-nombre" role="alert" className="text-sm text-fallo">
              {error}
            </p>
          )}
        </div>

        <button type="submit" className="boton-primario py-5 text-lg">
          Jugar
        </button>
        <Link to="/scoreboard" className="boton-secundario py-5 text-lg">
          Puntajes
        </Link>
      </form>
    </main>
  );
};

export default Inicio;
