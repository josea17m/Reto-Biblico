import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import Juego from "./Juego.jsx";
import Scoreboard from "./Scoreboard.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/juego" element={<Juego />} />
        <Route path="/scoreboard" element={<Scoreboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
