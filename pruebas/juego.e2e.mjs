/**
 * Prueba de extremo a extremo del Reto Bíblico.
 *
 * Levanta el servidor de desarrollo, juega una partida completa en un
 * navegador real y comprueba las tres formas de terminar: ganar el premio
 * mayor, fallar y retirarse. Ejecutar con `npm run test:e2e`.
 *
 * Requiere el navegador de Playwright una sola vez:
 *     npx playwright install chromium
 */
import { spawn } from "node:child_process";
import { setTimeout as esperar } from "node:timers/promises";
import { chromium } from "playwright";

const PUERTO = 5179;
const URL = `http://localhost:${PUERTO}`;

const paso = (mensaje) => console.log("  ✓", mensaje);

async function levantarServidor() {
  const proceso = spawn(
    "npx",
    ["vite", "--port", String(PUERTO), "--strictPort", "--logLevel", "error"],
    { stdio: "inherit" }
  );

  for (let intento = 0; intento < 60; intento += 1) {
    try {
      const respuesta = await fetch(URL);
      if (respuesta.ok) return proceso;
    } catch {
      /* todavía no responde */
    }
    await esperar(500);
  }

  proceso.kill();
  throw new Error("el servidor de desarrollo no respondió a tiempo");
}

/** Índice de la pregunta que se está jugando, o null si la partida terminó. */
const preguntaActual = (pagina) =>
  pagina.evaluate(() => {
    const contador = document.querySelector("header p strong");
    return contador ? Number(contador.textContent) : null;
  });

async function responder(pagina, texto) {
  const antes = await preguntaActual(pagina);
  await pagina.locator("section button", { hasText: texto }).first().click();
  await pagina.waitForFunction(
    (esperado) => {
      const contador = document.querySelector("header p strong");
      return !contador || Number(contador.textContent) !== esperado;
    },
    antes,
    { timeout: 15000 }
  );
}

const segundosEnPantalla = async (pagina) =>
  Number(await pagina.locator('[role="timer"]').textContent());

const premioMostrado = async (pagina) =>
  (await pagina.locator("section p.text-5xl").textContent()).trim();

async function ejecutar(pagina, banco) {
  // --- Pantalla de inicio ---
  await pagina.goto(URL);
  await pagina.getByRole("button", { name: "Jugar" }).click();
  if (!(await pagina.getByRole("alert").isVisible())) {
    throw new Error("deja jugar sin escribir el nombre");
  }
  paso("exige un nombre antes de empezar");

  await pagina.getByLabel("Tu nombre").fill("Peregrino");
  await pagina.getByRole("button", { name: "Jugar" }).click();
  await pagina.waitForURL("**/juego");
  paso("entra al juego");

  // --- Comodines ---
  await pagina.getByRole("button", { name: /^50:50/ }).click();
  const vivas = await pagina
    .locator("section button")
    .evaluateAll((botones) => botones.filter((b) => !b.className.includes("invisible")).length);
  if (vivas !== 2) throw new Error(`el 50:50 dejó ${vivas} opciones en pie, esperaba 2`);
  paso("el 50:50 descarta dos respuestas incorrectas");

  await pagina.getByRole("button", { name: /^Público/ }).click();
  await pagina.getByText("La congregación opina").waitFor();
  const barras = await pagina.locator('[role="img"][aria-label^="Opción"]').count();
  if (barras !== 2) throw new Error(`la votación mostró ${barras} barras, esperaba 2`);
  paso("el público sólo reparte votos entre las opciones que siguen vivas");

  await pagina.getByRole("button", { name: /^Llamada/ }).click();
  await pagina.getByText("Tu amigo al teléfono").waitFor();
  const gastados = await pagina
    .locator('[role="group"][aria-label="Comodines"] button[disabled]')
    .count();
  if (gastados !== 3) throw new Error(`quedaron ${3 - gastados} comodines sin gastar`);
  paso("los tres comodines se gastan una sola vez");

  // --- Temporizador ---
  // La ayuda del comodín sigue abierta, así que el reloj debe estar detenido.
  const detenido = await segundosEnPantalla(pagina);
  await esperar(2500);
  if ((await segundosEnPantalla(pagina)) !== detenido) {
    throw new Error("el reloj corrió mientras había un comodín abierto");
  }
  paso("la cuenta atrás se detiene mientras se lee un comodín");

  await pagina.getByRole("button", { name: "Cerrar la ayuda" }).click();
  const antesDeEsperar = await segundosEnPantalla(pagina);
  await esperar(2500);
  const despues = await segundosEnPantalla(pagina);
  if (despues >= antesDeEsperar) {
    throw new Error(`el reloj no avanzó: ${antesDeEsperar} → ${despues}`);
  }
  paso("la cuenta atrás corre al cerrar el comodín");

  // --- Partida ganada ---
  for (let nivel = 1; nivel <= 15; nivel += 1) {
    const enunciado = (await pagina.locator("section h1").textContent()).trim();
    if (!banco[enunciado]) throw new Error(`pregunta fuera del banco: ${enunciado}`);
    if ((await preguntaActual(pagina)) !== nivel) {
      throw new Error(`el contador no marca la pregunta ${nivel}`);
    }
    await responder(pagina, banco[enunciado]);
  }
  await pagina.getByText("¡Millonario en talentos!").waitFor({ timeout: 15000 });
  const premio = await premioMostrado(pagina);
  if (premio !== "1.000.000") throw new Error(`el premio mayor pagó ${premio}`);
  paso("acertar las quince preguntas paga 1.000.000 de talentos");

  // --- Puntajes ---
  await pagina.getByRole("link", { name: "Ver puntajes" }).click();
  await pagina.waitForURL("**/scoreboard");
  await pagina.locator("ol li").first().waitFor();
  const filas = await pagina.locator("ol li").count();
  if (filas !== 1) throw new Error(`el marcador guardó ${filas} entradas, esperaba 1`);
  const fila = await pagina.locator("ol li").first().innerText();
  if (!fila.includes("Peregrino") || !fila.includes("1.000.000")) {
    throw new Error(`entrada inesperada en el marcador: ${fila}`);
  }
  paso("la partida queda registrada una sola vez, pese al doble montaje de StrictMode");

  // --- Partida perdida ---
  await pagina.goto(`${URL}/juego`);
  let enunciado = (await pagina.locator("section h1").textContent()).trim();
  const incorrecta = await pagina
    .locator("section button")
    .filter({ hasNotText: banco[enunciado] })
    .first()
    .innerText();
  await responder(pagina, incorrecta.split("\n").pop().trim());
  await pagina.getByText("Fin del camino").waitFor({ timeout: 15000 });
  if ((await premioMostrado(pagina)) !== "0") {
    throw new Error("fallar la primera pregunta debería pagar 0 talentos");
  }
  paso("fallar antes del primer nivel seguro deja el premio en cero");

  // --- Retiro voluntario ---
  await pagina.getByRole("button", { name: "Jugar otra vez" }).click();
  await pagina.locator("section h1").waitFor();
  enunciado = (await pagina.locator("section h1").textContent()).trim();
  await responder(pagina, banco[enunciado]);
  await pagina.getByRole("button", { name: /^Retirarme/ }).click();
  await pagina.getByText("Te retiraste a tiempo").waitFor({ timeout: 15000 });
  if ((await premioMostrado(pagina)) !== "100") {
    throw new Error("retirarse tras un acierto debería pagar 100 talentos");
  }
  paso("retirarse conserva lo ganado hasta la pregunta anterior");

  // --- Tiempo agotado ---
  // La primera pregunta es siempre fácil, así que concede 30 segundos.
  await pagina.goto(`${URL}/juego`);
  await pagina.locator("section h1").waitFor();
  if ((await segundosEnPantalla(pagina)) !== 30) {
    throw new Error("la primera pregunta debería conceder 30 segundos");
  }
  await pagina.getByText("Se acabó el tiempo").waitFor({ timeout: 60000 });
  if ((await premioMostrado(pagina)) !== "0") {
    throw new Error("quedarse sin tiempo en la primera pregunta debería pagar 0");
  }
  paso("agotar el tiempo termina la partida sin premio");

  // --- Interruptor de sonido ---
  await pagina.goto(URL);
  const interruptor = pagina.getByRole("button", { name: "Silenciar el sonido" });
  await interruptor.click();
  await pagina.reload();
  const silenciado = pagina.getByRole("button", { name: "Activar el sonido" });
  if ((await silenciado.getAttribute("aria-pressed")) !== "true") {
    throw new Error("el silencio no sobrevivió a la recarga");
  }
  await silenciado.click();
  paso("el interruptor de sonido recuerda la preferencia entre recargas");
}

const servidor = await levantarServidor();
let navegador;
let codigo = 0;

// Todo lo que siga va dentro del `try`: si el navegador no arranca, el
// servidor de desarrollo tiene que morir igualmente y no quedar ocupando
// el puerto para la siguiente ejecución.
try {
  navegador = await chromium.launch();
  const contexto = await navegador.newContext({ viewport: { width: 1280, height: 900 } });
  const pagina = await contexto.newPage();

  const errores = [];
  pagina.on("console", (mensaje) => mensaje.type() === "error" && errores.push(mensaje.text()));
  pagina.on("pageerror", (error) => errores.push(`pageerror: ${error.message}`));

  await pagina.goto(URL);
  // El banco vive en el propio código: así la prueba conoce las respuestas
  // correctas sin duplicarlas aquí.
  const banco = await pagina.evaluate(async () => {
    const { PREGUNTAS } = await import("/src/data/preguntas.js");
    return Object.fromEntries(PREGUNTAS.map((p) => [p.enunciado, p.opciones[p.correcta]]));
  });
  await ejecutar(pagina, banco);

  if (errores.length) throw new Error(`la consola registró errores:\n${errores.join("\n")}`);
  console.log("\n✅ todas las comprobaciones pasaron");
} catch (error) {
  console.error("\n❌", error.message);
  codigo = 1;
} finally {
  await navegador?.close();
  servidor.kill();
}

process.exit(codigo);
