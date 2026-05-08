"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";

export default function Home() {
  const [fecha, setFecha] = useState("");
  const [corral, setCorral] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [camadas, setCamadas] = useState<any[]>([]);

  const obtenerCamadas = async () => {
    const querySnapshot = await getDocs(collection(db, "camadas"));

    const datos: any[] = [];

    querySnapshot.forEach((docSnap) => {
      datos.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    setCamadas(datos);
  };

  useEffect(() => {
    obtenerCamadas();
  }, []);

  const guardarCamada = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "camadas"), {
        fechaNacimiento: fecha,
        corral,
        cantidad: Number(cantidad),
        createdAt: new Date(),
      });

      alert("🐷 Camada guardada");

      setFecha("");
      setCorral("");
      setCantidad("");

      obtenerCamadas();
    } catch (error) {
      console.error(error);
      alert("Error al guardar");
    }
  };

  const eliminarCamada = async (id: string) => {
    try {
      await deleteDoc(doc(db, "camadas", id));
      obtenerCamadas();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar la camada");
    }
  };

  // 🧠 EDAD AUTOMÁTICA
  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);

    const diffMs = hoy.getTime() - nacimiento.getTime();
    const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const semanas = Math.floor(dias / 7);

    return { dias, semanas };
  };

  return (
    <main className="min-h-screen bg-gray-400 p-6 text-black">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-xl border border-gray-300">

        <h1 className="text-4xl font-bold mb-2">
          🐷 Granja Topoyanes
        </h1>

        <p className="mb-6 text-gray-900">
          Sistema de control porcino
        </p>

        {/* FORMULARIO */}
        <form onSubmit={guardarCamada} className="space-y-4">

          <div>
            <label className="block mb-1 font-medium">
              Fecha de nacimiento
            </label>

            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Corral
            </label>

            <input
              type="text"
              placeholder="Ejemplo: Corral 3"
              value={corral}
              onChange={(e) => setCorral(e.target.value)}
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Cantidad de cerdos
            </label>

            <input
              type="number"
              placeholder="10"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full border rounded-xl p-3"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white p-3 rounded-xl"
          >
            Guardar camada
          </button>
        </form>

        {/* LISTA */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">
            Camadas registradas
          </h2>

          <div className="space-y-3">
            {camadas.map((camada) => {
              const edad = calcularEdad(camada.fechaNacimiento);

              return (
                <div
                  key={camada.id}
                  className="border rounded-xl p-4 bg-gray-50"
                >
                  <p><strong>Corral:</strong> {camada.corral}</p>
                  <p><strong>Cantidad:</strong> {camada.cantidad}</p>
                  <p><strong>Fecha:</strong> {camada.fechaNacimiento}</p>

                  <p>
                    <strong>Edad:</strong> {edad.dias} días ({edad.semanas} semanas)
                  </p>

                  <button
                    onClick={() => eliminarCamada(camada.id)}
                    className="mt-2 bg-red-500 text-white px-3 py-1 rounded-lg"
                  >
                    Eliminar
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </main>
  );
}