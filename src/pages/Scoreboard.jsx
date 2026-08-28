import { useState } from "react";
import { Link } from "react-router-dom";
import { formatearTalentos } from "../data/escalera";
import { borrarPuntajes, leerPuntajes } from "../lib/almacenamiento";

const ETIQUETA_MOTIVO = {
  victoria: "Ganó el premio mayor",
  retiro: "Se retiró",
  derrota: "Falló",
};

const MEDALLAS = ["🥇", "🥈", "🥉"];

const formatearFecha = (iso) => {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime())
    ? ""
    : fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
};

const Scoreboard = () => {
  const [puntajes, setPuntajes] = useState(leerPuntajes);

  const limpiar = () => {
    if (window.confirm("¿Borrar todos los puntajes guardados?")) {
      setPuntajes(borrarPuntajes());
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <Link to="/" className="text-sm text-slate-400 hover:text-oro-400">
          ← Inicio
        </Link>
        <h1 className="font-titulo text-3xl text-oro-400">Puntajes</h1>
      </header>

      {puntajes.length === 0 ? (
        <p className="panel p-8 text-center text-slate-300">
          Todavía no hay partidas registradas.{" "}
          <Link to="/juego" className="text-oro-400 underline">
            Juega la primera
          </Link>
          .
        </p>
      ) : (
        <>
          <ol className="panel divide-y divide-white/10">
            {puntajes.map((puntaje, indice) => (
              <li
                key={`${puntaje.fecha}-${puntaje.nombre}`}
                className="flex items-center gap-4 px-5 py-3"
              >
                <span className="w-8 text-center text-lg tabular-nums text-slate-400">
                  {MEDALLAS[indice] ?? indice + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{puntaje.nombre}</p>
                  <p className="text-xs text-slate-400">
                    {ETIQUETA_MOTIVO[puntaje.motivo] ?? "Partida"} · nivel {puntaje.nivel}
                    {puntaje.fecha ? ` · ${formatearFecha(puntaje.fecha)}` : ""}
                  </p>
                </div>
                <span className="tabular-nums font-bold text-oro-400">
                  {formatearTalentos(puntaje.talentos)}
                </span>
              </li>
            ))}
          </ol>

          <button type="button" onClick={limpiar} className="boton-secundario self-center">
            Borrar puntajes
          </button>
        </>
      )}
    </main>
  );
};

export default Scoreboard;
