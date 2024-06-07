/* eslint-disable no-unused-vars */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function App() {




  return (
    <main className="flex justify-center items-center bg-slate-400">
      <div className="w-[430px] h-dvh bg-white p-8 flex justify-center flex-col gap-16">
        <h1 className="text-center font-semibold text-5xl">Reto Biblico</h1>
        <div className="flex flex-col gap-8">
          <input
            className="h-[63px] pl-4 shadow-md border-[1px] focus:border-[#09f] duration-150 border-[#00000028] rounded-[20px] font-semibold"
            type="text"
            placeholder="Nombre"
          />
          <Link
            to={"/juego"}
            className="bg-[#09f] h-[102px] shadow-xl cursor-pointer text-white font-semibold text-[20px] rounded-[20px] flex justify-center items-center"
          >
            <span>Jugar</span>
          </Link>
          <Link
            to={"/scoreboard"}
            className="bg-[#09f] h-[102px] shadow-xl cursor-pointer text-white font-semibold text-[20px] rounded-[20px] flex justify-center items-center"
          >
            <span>Scoreboard</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default App;
