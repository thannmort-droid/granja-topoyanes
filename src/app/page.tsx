"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

export default function Home() {
  const [fecha, setFecha] = useState("");
  const [corral, setCorral] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [camadas, setCamadas] = useState<any[]>([]);

  const hoy = new Date().toLocaleDateString("en-CA");

  // 🔄 obtener datos
  const obtenerCamadas = async () => {
    const snap = await getDocs(collection(db, "camadas"));

    const datos: any[] = [];
    snap.forEach((d) => datos.push({ id: d.id, ...d.data() }));

    setCamadas(datos);
  };

  useEffect(() => {
    obtenerCamadas();
  }, []);

  // 💾 guardar
  const guardarCamada = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await addDoc(collection(db, "camadas"), {
      fechaNacimiento: fecha,
      corral,
      cantidad: Number(cantidad),
      createdAt: new Date().toISOString(),
    });

    setFecha("");
    setCorral("");
    setCantidad("");

    obtenerCamadas();
  };

  // 🗑 eliminar
  const eliminarCamada = async (id: string) => {
    await deleteDoc(doc(db, "camadas", id));
    obtenerCamadas();
  };

  // 🧠 edad
  const calcularEdad = (fechaNacimiento: string) => {
    const hoyDate = new Date();
    const nac = new Date(fechaNacimiento);

    const dias = Math.floor(
      (hoyDate.getTime() - nac.getTime()) / (1000 * 60 * 60 * 24)
    );

    return dias;
  };

  return (
    <main className="min-h-screen bg-gray-200 p-6 flex justify-center">
      <div className="w-full max-w-3xl">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold">🐷 Granja Topoyanes</h1>
          <p className="text-gray-500">Sistema de control porcino</p>
        </div>

        {/* FORM */}
        <form
          onSubmit={guardarCamada}
          className="bg-white p-6 rounded-2xl shadow-md space-y-3 mb-6"
        >
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full border rounded-lg p-2"
          />

          <input
            type="text"
            placeholder="Corral"
            value={corral}
            onChange={(e) => setCorral(e.target.value)}
            className="w-full border rounded-lg p-2"
          />

          <input
            type="number"
            placeholder="Cantidad de cerdos"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="w-full border rounded-lg p-2"
          />

          <button className="w-full bg-black text-white py-2 rounded-lg">
            Guardar camada
          </button>
        </form>

        {/* LISTA */}
        <div className="space-y-4">

          {camadas.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl shadow-md p-5 border border-gray-100"
            >

              <p className="font-semibold text-lg mb-2">
                🐷 Camada registrada
              </p>

              <div className="space-y-1 text-gray-700">

                <p>
                  <span className="font-bold text-black">Corral:</span>{" "}
                  {c.corral}
                </p>

                <p>
                  <span className="font-bold text-black">Cantidad:</span>{" "}
                  {c.cantidad}
                </p>

                <p>
                  <span className="font-bold text-black">
                    Fecha de nacimiento:
                  </span>{" "}
                  {c.fechaNacimiento}
                </p>

                <p className="text-sm text-gray-500">
                  Edad: {calcularEdad(c.fechaNacimiento)} días
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => eliminarCamada(c.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}

        </div>

      </div>
    </main>
  );
}