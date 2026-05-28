"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {

  const [alimenti, setAlimenti] = useState([]);
  const [csvFile, setCsvFile] = useState(null);

  useEffect(() => {
    loadAlimenti();
  }, []);

  async function loadAlimenti() {

    const { data } = await supabase
      .from("alimenti")
      .select("*")
      .order("Nome");

    if (data) {
      setAlimenti(data);
    }
  }

  async function importCSV() {

    if (!csvFile) {
      alert("Seleziona un CSV");
      return;
    }

    Papa.parse(csvFile, {

      header: true,
      skipEmptyLines: true,

      complete: async function(results) {

        const records = results.data.map((row) => ({
          Nome: row.Nome,
          Categoria: row.Categoria,
          Calcio: Number(row.Calcio),
          Fosforo: Number(row.Fosforo),
          Note: row.Note || ""
        }));

        const { error } = await supabase
          .from("alimenti")
          .insert(records);

        if (error) {
          alert(error.message);
        } else {
          alert("Import completato 😄");
          loadAlimenti();
        }
      }
    });
  }

  return (

    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#eef1ea",
        padding: "20px",
        fontFamily: "Arial"
      }}
    >

      <h1 style={{ color: "#234b2d" }}>
        Dietauro ENAPI
      </h1>

      <div style={cardStyle}>

        <h2>📂 Import CSV alimenti</h2>

        <input
          type="file"
          accept=".csv"
          onChange={(e) =>
            setCsvFile(e.target.files[0])
          }
        />

        <br />
        <br />

        <button
          onClick={importCSV}
          style={greenButton}
        >
          Importa CSV
        </button>

      </div>

      <div style={cardStyle}>

        <h2>🍎 Alimenti presenti</h2>

        {alimenti.map((alimento) => (

          <div
            key={alimento.id}
            style={{
              padding: "10px 0",
              borderBottom: "1px solid #ddd"
            }}
          >

            <strong>
              {alimento.Nome}
            </strong>

            <br />

            Categoria: {alimento.Categoria}

            <br />

            Ca: {alimento.Calcio} | P: {alimento.Fosforo}

          </div>

        ))}

      </div>

    </div>
  );
}

const cardStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "20px",
  marginBottom: "20px"
};

const greenButton = {
  backgroundColor: "#234b2d",
  color: "white",
  border: "none",
  padding: "15px",
  borderRadius: "12px",
  cursor: "pointer"
};