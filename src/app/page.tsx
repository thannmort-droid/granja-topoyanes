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

  // ✏️ editar
  const [editando, setEditando] = useState<any | null>(null);
  const [editCorral, setEditCorral] = useState("");
  const [editCantidad, setEditCantidad] = useState("");
  const [editFecha, setEditFecha] = useState("");

  // 📅 HOY (LOCAL, NO UTC)
  const hoy = new Date().toLocaleDateString("en-CA");

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

  // 🧠 edad
  const calcularEdad = (fechaNacimiento: string) => {
    const hoyDate = new Date();
    const nacimiento = new Date(fechaNacimiento);

    const diffMs = hoyDate.getTime() - nacimiento.getTime();
    const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const semanas = Math.floor(dias / 7);

    return { dias, semanas };
  };

  // 📍 HOY
  const esHoy = (fechaNacimiento: string) => {
    return fechaNacimiento === hoy;
  };

  // 📊 DASHBOARD
  const totalCamadas = camadas.length;

  const totalCerdos = camadas.reduce((acc, c) => {
    return acc + Number(c.cantidad || 0);
  }, 0);

  const camadasHoy = camadas.filter((c) =>
    esHoy(c.fechaNacimiento)
  ).length;

  // ✏️ editar abrir
  const abrirEdicion = (camada: any) => {
    setEditando(camada);
    setEditCorral(camada.corral);
    setEditCantidad(camada.cantidad);
    setEditFecha(camada.fechaNacimiento);
  };

  // 💾 guardar edición
  const guardarEdicion = async () => {
    if (!editando) return;

    try {
      const ref = doc(db, "camadas", editando.id);

      await updateDoc(ref, {
        corral: editCorral,
        cantidad: Number(editCantidad),
        fechaNacimiento: editFecha,
      });

      setEditando(null);
      obtenerCamadas();
    } catch (error) {
      console.error(error);
      alert("Error al actualizar");
    }
  };

  return (
    <main className="min-h-screen bg-gray-400 p-6 text-black">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-xl border border-gray-300">

        <h1 className="text-4xl font-bold mb-2">
          🐷 Granja Topoyanes
        </h1>

        <p className="mb-4">Sistema de control porcino</p>

        {/* 📊 DASHBOARD */}
        <div className="grid grid-cols-3 gap-3 mb-6">

          <div className="bg-gray-100 p-3 rounded-xl text-center">
            <p>Camadas</p>
            <p className="text-xl font-bold">{totalCamadas}</p>
          </div>

          <div className="bg-gray-100 p-3 rounded-xl text-center">
            <p>Cerdos</p>
            <p className="text-xl font-bold">{totalCerdos}</p>
          </div>

          <div className="bg-gray-100 p-3 rounded-xl text-center">
            <p>Hoy</p>
            <p className="text-xl font-bold">{camadasHoy}</p>
          </div>

        </div>

        {/* FORM */}
        <form onSubmit={guardarCamada} className="space-y-4">

          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full border p-2"
          />

          <input
            type="text"
            placeholder="Corral"
            value={corral}
            onChange={(e) => setCorral(e.target.value)}
            className="w-full border p-2"
          />

          <input
            type="number"
            placeholder="Cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="w-full border p-2"
          />

          <button className="w-full bg-black text-white p-3 rounded-xl">
            Guardar
          </button>
        </form>

        {/* EDITAR */}
        {editando && (
          <div className="mt-6 p-4 bg-yellow-50 border rounded-xl">
            <h2 className="font-bold mb-2">✏️ Editar camada</h2>

            <input
              value={editCorral}
              onChange={(e) => setEditCorral(e.target.value)}
              className="w-full border p-2 mb-2"
              placeholder="Corral"
            />

            <input
              type="number"
              value={editCantidad}
              onChange={(e) => setEditCantidad(e.target.value)}
              className="w-full border p-2 mb-2"
            />

            <input
              type="date"
              value={editFecha}
              onChange={(e) => setEditFecha(e.target.value)}
              className="w-full border p-2 mb-2"
            />

            <div className="flex gap-2">
              <button
                onClick={guardarEdicion}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Guardar
              </button>

              <button
                onClick={() => setEditando(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* LISTA */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">
            Camadas registradas
          </h2>

          {camadas.map((c) => {
            const edad = calcularEdad(c.fechaNacimiento);

            return (
              <div key={c.id} className="border p-3 rounded mb-2">

                <p>🐷 {c.corral} - {c.cantidad}</p>
                <p>{c.fechaNacimiento}</p>
                <p>{edad.dias} días</p>

                <button
                  onClick={() => abrirEdicion(c)}
                  className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                >
                  Editar
                </button>

                <button
                  onClick={() => eliminarCamada(c.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Eliminar
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
}