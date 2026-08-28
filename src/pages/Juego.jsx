import { useEffect, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import Comodines from "../components/Comodines";
import Escalera from "../components/Escalera";
import FinDeJuego from "../components/FinDeJuego";
import Opcion from "../components/Opcion";
import PanelAyuda from "../components/PanelAyuda";
import Temporizador from "../components/Temporizador";
import BotonSonido from "../components/BotonSonido";
import { ESCALERA, TOTAL_NIVELES, formatearTalentos } from "../data/escalera";
import { useJuego } from "../hooks/useJuego";
import { guardarPuntaje, leerJugador } from "../lib/almacenamiento";

const Juego = () => {
  const jugador = leerJugador();
  const juego = useJuego();
  const guardado = useRef(null);

  const { fase, resultado, pregunta, nivel } = juego;

  // Registrar el puntaje una sola vez por partida terminada. El `ref` evita
  // que el doble montaje de StrictMode duplique la entrada.
  useEffect(() => {
    if (fase !== "terminado" || !resultado || !jugador) return;
    const marca = `${resultado.motivo}:${resultado.talentos}:${resultado.nivelAlcanzado}`;
    if (guardado.current === marca) return;
    guardado.current = marca;
    guardarPuntaje({
      nombre: jugador,
      talentos: resultado.talentos,
      nivel: resultado.nivelAlcanzado,
      motivo: resultado.motivo,
    });
  }, [fase, resultado, jugador]);

  if (!jugador) return <Navigate to="/" replace />;

  const reiniciar = () => {
    guardado.current = null;
    juego.reiniciar();
  };

  if (fase === "terminado" && resultado) {
    const correcta = pregunta?.opciones.find((o) => o.id === pregunta.correcta)?.texto;
    return (
      <main className="mx-auto flex min-h-dvh max-w-5xl items-center p-6">
        <FinDeJuego
          resultado={resultado}
          jugador={jugador}
          respuestaCorrecta={resultado.motivo === "derrota" || resultado.motivo === "tiempo" ? correcta : undefined}
          onReiniciar={reiniciar}
        />
      </main>
    );
  }

  if (!pregunta) return <Navigate to="/" replace />;

  const premioEnJuego = ESCALERA[nivel].talentos;

  return (
    <main className="mx-auto grid min-h-dvh max-w-5xl gap-6 p-4 lg:grid-cols-[1fr_14rem] lg:p-6">
      <div className="flex flex-col gap-5">
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link to="/" className="text-sm text-slate-400 hover:text-oro-400">
              ← Salir
            </Link>
            <div className="flex items-center gap-3">
              <p className="text-sm text-slate-300">
                Pregunta <strong className="text-slate-100">{nivel + 1}</strong> de {TOTAL_NIVELES} ·{" "}
                <span className="text-oro-400">{formatearTalentos(premioEnJuego)} talentos</span>
              </p>
              <BotonSonido />
            </div>
          </div>
          <Temporizador
            segundos={juego.segundos}
            total={juego.segundosTotales}
            enPausa={fase !== "jugando" || Boolean(juego.ayuda)}
          />
        </header>

        <Comodines
          disponibles={juego.comodines}
          habilitado={fase === "jugando"}
          onUsar={juego.usarComodin}
        />

        <PanelAyuda ayuda={juego.ayuda} onCerrar={juego.cerrarAyuda} />

        <section className="panel animate-aparecer p-6" key={pregunta.id}>
          <h1 className="font-titulo text-xl leading-snug sm:text-2xl">{pregunta.enunciado}</h1>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {pregunta.opciones.map((opcion) => (
              <Opcion
                key={opcion.id}
                opcion={opcion}
                fase={fase}
                estaSeleccionada={juego.seleccionada === opcion.id}
                esCorrecta={pregunta.correcta === opcion.id}
                eliminada={juego.eliminadas.includes(opcion.id)}
                onElegir={juego.responder}
              />
            ))}
          </div>

          {fase === "revelando" && (
            <p className="mt-5 text-center text-sm text-slate-400" aria-live="polite">
              {pregunta.referencia}
            </p>
          )}
        </section>

        <button
          type="button"
          className="boton-secundario self-center"
          disabled={fase !== "jugando" || nivel === 0}
          onClick={juego.retirarse}
        >
          Retirarme con {formatearTalentos(nivel === 0 ? 0 : ESCALERA[nivel - 1].talentos)} talentos
        </button>
      </div>

      <Escalera nivelActual={nivel} />
    </main>
  );
};

export default Juego;
