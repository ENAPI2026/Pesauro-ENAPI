```javascript
"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {

  const [petauri, setPetauri] = useState([]);
  const [colonie, setColonie] = useState([]);
  const [pesi, setPesi] = useState([]);
  const [alimenti, setAlimenti] = useState([]);

  const [nomePetauro, setNomePetauro] = useState("");
  const [coloniaPetauro, setColoniaPetauro] = useState("");

  const [nomeColonia, setNomeColonia] = useState("");

  const [petauroSelezionato, setPetauroSelezionato] =
    useState("");

  const [peso, setPeso] = useState("");
  const [dataPeso, setDataPeso] = useState("");

  const [csvFile, setCsvFile] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {

    await loadPetauri();
    await loadColonie();
    await loadPesi();
    await loadAlimenti();
  }

  async function loadPetauri() {

    const { data } = await supabase
      .from("petauri")
      .select("*")
      .order("nome");

    if (data) {
      setPetauri(data);
    }
  }

  async function loadColonie() {

    const { data } = await supabase
      .from("colonie")
      .select("*")
      .order("nome");

    if (data) {
      setColonie(data);
    }
  }

  async function loadPesi() {

    const { data } = await supabase
      .from("pesi")
      .select("*")
      .order("data", { ascending: true });

    if (data) {
      setPesi(data);
    }
  }

  async function loadAlimenti() {

    const { data } = await supabase
      .from("alimenti")
      .select("*")
      .order("Nome");

    if (data) {
      setAlimenti(data);
    }
  }

  async function aggiungiPetauro() {

    if (!nomePetauro) {
      return;
    }

    await supabase
      .from("petauri")
      .insert([
        {
          nome: nomePetauro,
          colonia: coloniaPetauro
        }
      ]);

    setNomePetauro("");
    setColoniaPetauro("");

    loadPetauri();
  }

  async function aggiungiColonia() {

    if (!nomeColonia) {
      return;
    }

    await supabase
      .from("colonie")
      .insert([
        {
          nome: nomeColonia
        }
      ]);

    setNomeColonia("");

    loadColonie();
  }

  async function aggiungiPeso() {

    if (
      !petauroSelezionato ||
      !peso ||
      !dataPeso
    ) {
      return;
    }

    await supabase
      .from("pesi")
      .insert([
        {
          petauro_id: petauroSelezionato,
          peso: Number(peso),
          data: dataPeso
        }
      ]);

    setPeso("");
    setDataPeso("");

    loadPesi();
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

  const datiGrafico = useMemo(() => {

    return pesi
      .filter(
        (p) =>
          String(p.petauro_id) ===
          String(petauroSelezionato)
      )
      .map((p) => ({
        data: p.data,
        peso: p.peso
      }));

  }, [pesi, petauroSelezionato]);

  return (

    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#eef1ea",
        padding: "20px",
        fontFamily: "Arial"
      }}
    >

      <h1
        style={{
          color: "#234b2d"
        }}
      >
        Dietauro ENAPI
      </h1>

      <div style={cardStyle}>

        <h2>🐿️ Aggiungi colonia</h2>

        <input
          placeholder="Nome colonia"
          value={nomeColonia}
          onChange={(e) =>
            setNomeColonia(e.target.value)
          }
          style={inputStyle}
        />

        <button
          onClick={aggiungiColonia}
          style={greenButton}
        >
          Salva colonia
        </button>

      </div>

      <div style={cardStyle}>

        <h2>🐿️ Aggiungi petauro</h2>

        <input
          placeholder="Nome petauro"
          value={nomePetauro}
          onChange={(e) =>
            setNomePetauro(e.target.value)
          }
          style={inputStyle}
        />

        <select
          value={coloniaPetauro}
          onChange={(e) =>
            setColoniaPetauro(e.target.value)
          }
          style={inputStyle}
        >

          <option value="">
            Nessuna colonia
          </option>

          {colonie.map((colonia) => (

            <option
              key={colonia.id}
              value={colonia.nome}
            >
              {colonia.nome}
            </option>

          ))}

        </select>

        <button
          onClick={aggiungiPetauro}
          style={greenButton}
        >
          Salva petauro
        </button>

      </div>

      <div style={cardStyle}>

        <h2>⚖️ Inserisci peso</h2>

        <select
          value={petauroSelezionato}
          onChange={(e) =>
            setPetauroSelezionato(
              e.target.value
            )
          }
          style={inputStyle}
        >

          <option value="">
            Seleziona petauro
          </option>

          {petauri.map((petauro) => (

            <option
              key={petauro.id}
              value={petauro.id}
            >
              {petauro.nome}
            </option>

          ))}

        </select>

        <input
          type="number"
          placeholder="Peso"
          value={peso}
          onChange={(e) =>
            setPeso(e.target.value)
          }
          style={inputStyle}
        />

        <input
          type="date"
          value={dataPeso}
          onChange={(e) =>
            setDataPeso(e.target.value)
          }
          style={inputStyle}
        />

        <button
          onClick={aggiungiPeso}
          style={greenButton}
        >
          Salva peso
        </button>

      </div>

      {petauroSelezionato && (

        <div style={cardStyle}>

          <h2>📈 Andamento peso</h2>

          <div
            style={{
              width: "100%",
              height: 300
            }}
          >

            <ResponsiveContainer>

              <LineChart data={datiGrafico}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="data" />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="#234b2d"
                  strokeWidth={3}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>

      )}

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

            Ca: {alimento.Calcio}
            {" | "}
            P: {alimento.Fosforo}

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

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "10px",
  borderRadius: "10px",
  border: "1px solid #ccc"
};

const greenButton = {
  backgroundColor: "#234b2d",
  color: "white",
  border: "none",
  padding: "15px",
  borderRadius: "12px",
  cursor: "pointer"
};
```
