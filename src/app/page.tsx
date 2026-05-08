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

  // 🔄 obtener datos
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

  // 💾 guardar
  const guardarCamada = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
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
    } catch (error) {
      console.error(error);
      alert("Error al guardar");
    }
  };

  // 🗑 eliminar
  const eliminarCamada = async (id: string) => {
    try {
      await deleteDoc(doc(db, "camadas", id));
      obtenerCamadas();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar");
    }
  };

  // 🧠 edad automática
  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);

    const diffMs = hoy.getTime() - nacimiento.getTime();
    const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const semanas = Math.floor(dias / 7);

    return { dias, semanas };
  };

  // 📍 HOY (seguro)
  const esHoy = (fechaNacimiento: any) => {
    const hoy = new Date().toISOString().split("T")[0];

    if (typeof fechaNacimiento === "string") {
      return fechaNacimiento === hoy;
    }

    if (fechaNacimiento?.seconds) {
      const fecha = new Date(fechaNacimiento.seconds * 1000)
        .toISOString()
        .split("T")[0];

      return fecha === hoy;
    }

    return false;
  };

  // 📊 DASHBOARD
  const totalCamadas = camadas.length;

  const totalCerdos = camadas.reduce((acc, c) => {
    return acc + Number(c.cantidad || 0);
  }, 0);

  const hoy = new Date().toISOString().split("T")[0];

  const camadasHoy = camadas.filter((c) => {
    return c.fechaNacimiento === hoy;
  }).length;

  return (
    <main className="min-h-screen bg-gray-400 p-6 text-black">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-xl border border-gray-300">

        {/* TÍTULO */}
        <h1 className="text-4xl font-bold mb-2">
          🐷 Granja Topoyanes
        </h1>

        <p className="mb-4 text-gray-900">
          Sistema de control porcino
        </p>

        {/* 📊 DASHBOARD */}
        <div className="grid grid-cols-3 gap-3 mb-6">

          <div className="bg-gray-100 p-3 rounded-xl text-center">
            <p className="text-sm">Camadas</p>
            <p className="text-xl font-bold">{totalCamadas}</p>
          </div>

          <div className="bg-gray-100 p-3 rounded-xl text-center">
            <p className="text-sm">Cerdos</p>
            <p className="text-xl font-bold">{totalCerdos}</p>
          </div>

          <div className="bg-gray-100 p-3 rounded-xl text-center">
            <p className="text-sm">Hoy</p>
            <p className="text-xl font-bold">{camadasHoy}</p>
          </div>

        </div>

        {/* FORMULARIO */}
        <form onSubmit={guardarCamada} className="space-y-4">

          <input
            type="date"
            placeholder="Fecha de nacimiento"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full border rounded-xl p-3"
          />

          <input
            type="text"
            placeholder="Corral"
            value={corral}
            onChange={(e) => setCorral(e.target.value)}
            className="w-full border rounded-xl p-3"
          />

          <input
            type="number"
            placeholder="Cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="w-full border rounded-xl p-3"
          />

          <button
            type="submit"
            className="w-full bg-black text-white p-3 rounded-xl"
          >
            Guardar camada
          </button>
        </form>

        {/* 📍 PANEL HOY */}
        <div className="mt-6 p-4 border rounded-xl bg-green-50">
          <h2 className="text-xl font-bold mb-2">📍 Panel HOY</h2>

          {camadas.filter((c) => esHoy(c.fechaNacimiento)).length === 0 ? (
            <p>😴 Hoy no hay camadas registradas</p>
          ) : (
            camadas
              .filter((c) => esHoy(c.fechaNacimiento))
              .map((c) => (
                <div key={c.id}>
                  🐷 Corral {c.corral} - {c.cantidad} cerdos
                </div>
              ))
          )}
        </div>

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