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
  const totalCamadas = camadas.length;

const totalCerdos = camadas.reduce((acc, c) => {
  return acc + Number(c.cantidad || 0);
}, 0);

  const [editando, setEditando] = useState<any | null>(null);
  const [editCorral, setEditCorral] = useState("");
  const [editCantidad, setEditCantidad] = useState("");
  const [editFecha, setEditFecha] = useState("");

  const hoy = new Date().toLocaleDateString("en-CA");

  const obtenerCamadas = async () => {
    const snap = await getDocs(collection(db, "camadas"));
    const datos: any[] = [];

    snap.forEach((d) => datos.push({ id: d.id, ...d.data() }));
    setCamadas(datos);
  };

  useEffect(() => {
    obtenerCamadas();
  }, []);

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

  const eliminarCamada = async (id: string) => {
    await deleteDoc(doc(db, "camadas", id));
    obtenerCamadas();
  };

  const abrirEdicion = (c: any) => {
    setEditando(c);
    setEditCorral(c.corral);
    setEditCantidad(c.cantidad);
    setEditFecha(c.fechaNacimiento);
  };

  const guardarEdicion = async () => {
    if (!editando) return;

    await updateDoc(doc(db, "camadas", editando.id), {
      corral: editCorral,
      cantidad: Number(editCantidad),
      fechaNacimiento: editFecha,
    });

    setEditando(null);
    obtenerCamadas();
  };

  const calcularEdad = (fechaNacimiento: string) => {
    const hoyDate = new Date();
    const nac = new Date(fechaNacimiento);

    return Math.floor(
      (hoyDate.getTime() - nac.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  return (
    <main className="min-h-screen bg-gray-200 p-6 flex justify-center text-black">
      <div className="w-full max-w-3xl">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow p-5 mb-6">
          <h1 className="text-3xl font-bold text-black">
            🐷 Granja Topoyanes
          </h1>
          <p className="text-gray-600">Sistema de control porcino</p>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">

  <div className="bg-gray-100 p-3 rounded-xl text-center">
    <p className="text-sm text-gray-600">Camadas</p>
    <p className="text-2xl font-bold">{totalCamadas}</p>
  </div>

  <div className="bg-gray-100 p-3 rounded-xl text-center">
    <p className="text-sm text-gray-600">Cerdos totales</p>
    <p className="text-2xl font-bold">{totalCerdos}</p>
  </div>

</div>

        {/* FORM */}
        <form
          onSubmit={guardarCamada}
          className="bg-white p-5 rounded-2xl shadow space-y-3 mb-6"
        >
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full border p-2 rounded text-black"
          />

          <input
            type="text"
            placeholder="Corral"
            value={corral}
            onChange={(e) => setCorral(e.target.value)}
            className="w-full border p-2 rounded text-black"
          />

          <input
            type="number"
            placeholder="Cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="w-full border p-2 rounded text-black"
          />

          <button className="w-full bg-black text-white py-2 rounded">
            Guardar camada
          </button>
        </form>

        {/* EDITOR */}
        {editando && (
          <div className="bg-yellow-50 p-4 rounded-2xl shadow mb-6">
            <h2 className="font-bold mb-2 text-black">✏️ Editar camada</h2>

            <input
              value={editCorral}
              onChange={(e) => setEditCorral(e.target.value)}
              className="w-full border p-2 mb-2 text-black"
            />

            <input
              type="number"
              value={editCantidad}
              onChange={(e) => setEditCantidad(e.target.value)}
              className="w-full border p-2 mb-2 text-black"
            />

            <input
              type="date"
              value={editFecha}
              onChange={(e) => setEditFecha(e.target.value)}
              className="w-full border p-2 mb-2 text-black"
            />

            <div className="flex gap-2">
              <button
                onClick={guardarEdicion}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Guardar
              </button>

              <button
                onClick={() => setEditando(null)}
                className="bg-gray-400 text-white px-3 py-1 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* LISTA */}
        <div className="space-y-4">
          {camadas.map((c) => (
            <div
              key={c.id}
              className="bg-white p-5 rounded-2xl shadow border text-black"
            >

              <p className="font-bold text-lg">🐷 Camada</p>

              <p><b>Corral:</b> {c.corral}</p>
              <p><b>Cantidad:</b> {c.cantidad}</p>
              <p><b>Fecha de nacimiento:</b> {c.fechaNacimiento}</p>
              <p className="text-sm text-gray-600">
                Edad: {calcularEdad(c.fechaNacimiento)} días
              </p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => abrirEdicion(c)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
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
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}