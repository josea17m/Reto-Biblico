# Reto Bíblico

Juego de preguntas bíblicas al estilo de los concursos de escalera de premios:
quince preguntas de dificultad creciente, tres comodines y un millón de
talentos en juego.

## Cómo se juega

- **Quince preguntas** en dificultad creciente: cinco fáciles, cinco medias y
  cinco difíciles, escogidas al azar de un banco de 46 y con las respuestas
  barajadas en cada partida.
- **Escalera de premios** de 100 a 1.000.000 de talentos. Los niveles 5 y 10
  son *seguros*: una vez alcanzados, ese premio ya no se pierde.
- **Tres comodines**, uno de cada tipo y de un solo uso:
  - `50:50` descarta dos respuestas incorrectas.
  - `Público` muestra cómo votaría la congregación.
  - `Llamada` pide consejo a un amigo, que acierta más a menudo en las
    preguntas fáciles que en las difíciles.
- **Temporizador** por pregunta: 30 segundos en las fáciles, 45 en las medias
  y 60 en las difíciles. Se detiene mientras se lee la ayuda de un comodín, y
  en los últimos cinco segundos se pinta en rojo y hace tic-tac. Quedarse sin
  tiempo cuenta como fallo.
- **Efectos de sonido** sintetizados con la Web Audio API, sin archivos de
  audio: al elegir respuesta, al acertar, al fallar, al gastar un comodín y en
  cada final. El interruptor de la esquina los silencia y recuerda la
  preferencia.
- **Retirarse** en cualquier momento conserva lo ganado hasta la pregunta
  anterior. Fallar deja sólo el último nivel seguro superado.
- Los resultados se guardan en el navegador (`localStorage`) y se listan en
  `/scoreboard`.

## Puesta en marcha

```bash
npm install
npm run dev
```

Otros comandos:

| Comando            | Qué hace                                              |
| ------------------ | ----------------------------------------------------- |
| `npm run build`    | Compila la versión de producción en `dist/`.          |
| `npm run preview`  | Sirve `dist/` para revisar el resultado compilado.     |
| `npm run lint`     | Pasa ESLint sobre `src/`.                              |
| `npm run test:e2e` | Juega una partida completa en un navegador real.       |

La prueba de extremo a extremo necesita el navegador de Playwright una sola vez:

```bash
npx playwright install chromium
```

## Estructura

```
src/
  data/escalera.js     escalera de premios y cálculo de lo que se cobra
  data/preguntas.js    banco de preguntas
  hooks/useJuego.js    máquina de estados: partida, comodines y cuenta atrás
  lib/aleatorio.js     barajado y selección al azar
  lib/sonido.js        síntesis de los efectos de sonido
  lib/almacenamiento.js  nombre del jugador y tabla de puntajes
  components/          escalera, opciones, comodines, ayudas y pantalla final
  pages/               inicio, juego y puntajes
pruebas/juego.e2e.mjs  prueba de extremo a extremo
```

No hay servidor: las preguntas viven en el repositorio y los puntajes en el
navegador de cada jugador.

## Añadir preguntas

Cada entrada de `src/data/preguntas.js` lleva un `id` único, su `dificultad`,
el `enunciado`, exactamente cuatro `opciones`, el índice de la `correcta` y la
`referencia` bíblica que se muestra al revelar la respuesta. El orden en que se
escriben las opciones no importa: se barajan en cada partida.

```js
{
  id: "f16",
  dificultad: "facil",
  enunciado: "¿Quién construyó el arca por mandato de Dios?",
  opciones: ["Noé", "Moisés", "Abraham", "David"],
  correcta: 0,
  referencia: "Génesis 6:14",
}
```

Una partida usa cinco preguntas de cada dificultad, así que el banco necesita
al menos cinco de cada una; cuantas más haya, menos se repiten entre partidas.

## Historia

La primera versión de este proyecto, escrita a mano hace años, se conserva
intacta en la rama [`codigo-original`](../../tree/codigo-original).

## Tecnologías

React 18, React Router 7, Vite 8 y Tailwind CSS 3.
