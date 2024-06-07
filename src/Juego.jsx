/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axios from "axios";

const Juego = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    const handleAxios = async () => {
      try {
        const r = await axios("https://us-east-2.aws.data.mongodb-api.com/app/data-ocnqeua/endpoint/data/v1");
        setData(r.data);
      } catch (error) {
        console.log(error);
      }
    };
    handleAxios();
  }, []);

  const text = data[0]?.text;
  const question = data[0]?.question;
  const options = data[0]?.options;

  return (
    <main className="w-1/2 mx-auto mt-10 flex flex-col gap-5 text-center">
      {data.length === 0 ? (
        <h1>Loading...</h1>
      ) : (
        <>
          <h1 className="font-bold text-3xl">{question}</h1>
          <span>{text}</span>

          <div className="grid grid-cols-2 gap-10">
            {options.map((option) => (
              <div
                key={option.id}
                className="text-center p-10 bg-[#09f] rounded-lg"
              >
                {option}
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
};

export default Juego;
