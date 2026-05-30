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

const giorniSettimana = [
  { nome: "Lunedi", numero: 1 },
  { nome: "Martedi", numero: 2 },
  { nome: "Mercoledi", numero: 3 },
  { nome: "Giovedi", numero: 4 },
  { nome: "Venerdi", numero: 5 },
  { nome: "Sabato", numero: 6 },
  { nome: "Domenica", numero: 7 }
];

export default function Home() {
  const [petauri, setPetauri] = useState([]);
  const [colonie, setColonie] = useState([]);
  const [pesi, setPesi] = useState([]);
  const [alimenti, setAlimenti] = useState([]);
  const [diete, setDiete] = useState([]);
  const [settimane, setSettimane] = useState([]);
  const [giorniDB, setGiorniDB] = useState([]);

  const [modalita, setModalita] = useState("petauro");
  const [petauroId, setPetauroId] = useState("");
  const [coloniaId, setColoniaId] = useState("");

  const [nomePetauro, setNomePetauro] = useState("");
  const [nomeColonia, setNomeColonia] = useState("");

  const [peso, setPeso] = useState("");
  const [dataPeso, setDataPeso] = useState("");

  const [alimentoId, setAlimentoId] = useState("");
  const [grammi, setGrammi] = useState("");
  const [dataDieta, setDataDieta] = useState("");

  const [csvFile, setCsvFile] = useState(null);

  const [settimanaNome, setSettimanaNome] = useState("");
  const [giornoSettimana, setGiornoSettimana] = useState("Lunedi");
  const [settimanaDaApplicare, setSettimanaDaApplicare] = useState("");
  const [dataInizioSettimana, setDataInizioSettimana] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    await Promise.all([
      loadPetauri(),
      loadColonie(),
      loadPesi(),
      loadAlimenti(),
      loadDiete(),
      loadSettimane(),
      loadGiorniDB()
    ]);
  }

  async function loadPetauri() {
    const { data } = await supabase.from("petauri").select("*");
    if (data) setPetauri(data);
  }

  async function loadColonie() {
    const { data } = await supabase.from("colonie").select("*");
    if (data) setColonie(data);
  }

  async function loadPesi() {
    const { data } = await supabase
      .from("pesi")
      .select("*")
      .order("data", { ascending: true });

    if (data) setPesi(data);
  }

  async function loadAlimenti() {
    const { data } = await supabase.from("alimenti").select("*");
    if (data) setAlimenti(data);
  }

  async function loadDiete() {
    const { data } = await supabase
      .from("diete")
      .select("*")
      .order("data", { ascending: false });

    if (data) setDiete(data);
  }

  async function loadSettimane() {
    const { data } = await supabase.from("settimane_dieta").select("*");
    if (data) setSettimane(data);
  }

  async function loadGiorniDB() {
    const { data } = await supabase.from("settimane_dieta_giorni").select("*");
    if (data) setGiorniDB(data);
  }

  function nomePetauroDisplay(petauro) {
    return petauro?.Nome || petauro?.nome || "-";
  }

  function nomeColoniaDisplay(colonia) {
    return colonia?.Nome || colonia?.nome || "-";
  }

  function getPetauro(id) {
    return petauri.find((p) => String(p.id) === String(id));
  }

  function getColonia(id) {
    return colonie.find((c) => String(c.id) === String(id));
  }

  function getAlimento(id) {
    return alimenti.find((a) => String(a.id) === String(id));
  }

  function nomeAlimento(id) {
    const alimento = getAlimento(id);
    return alimento ? alimento.Nome : "-";
  }

  function rapportoAlimento(alimento) {
    const calcio = Number(alimento?.Calcio || 0);
    const fosforo = Number(alimento?.Fosforo || 0);

    if (fosforo > 0) {
      return (calcio / fosforo).toFixed(2);
    }

    if (alimento?.Rapporto) {
      return Number(alimento.Rapporto).toFixed(2);
    }

    return "0.00";
  }

  async function aggiungiColonia() {
    if (!nomeColonia) {
      alert("Inserisci il nome della colonia");
      return;
    }

    const { error } = await supabase.from("colonie").insert([
      {
        Nome: nomeColonia
      }
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setNomeColonia("");
    loadColonie();
  }

  async function aggiungiPetauro() {
    if (!nomePetauro) {
      alert("Inserisci il nome del petauro");
      return;
    }

    const nuovoPetauro = {
      Nome: nomePetauro
    };

    if (coloniaId) {
      nuovoPetauro.colonia_id = Number(coloniaId);
    }

    const { error } = await supabase.from("petauri").insert([nuovoPetauro]);

    if (error) {
      alert(error.message);
      return;
    }

    setNomePetauro("");
    loadPetauri();
  }

  async function salvaPeso() {
    if (!petauroId || !peso || !dataPeso) {
      alert("Seleziona petauro, peso e data");
      return;
    }

    const { error } = await supabase.from("pesi").insert([
      {
        petauro_id: Number(petauroId),
        peso: Number(peso),
        data: dataPeso
      }
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setPeso("");
    setDataPeso("");
    loadPesi();
  }

  async function salvaDieta() {
    if (!alimentoId || !grammi || !dataDieta) {
      alert("Seleziona alimento, grammi e data");
      return;
    }

    if (modalita === "petauro") {
      if (!petauroId) {
        alert("Seleziona un petauro");
        return;
      }

      const { error } = await supabase.from("diete").insert([
        {
          petauro_id: Number(petauroId),
          colonia_id: null,
          alimento_id: Number(alimentoId),
          grammi: Number(grammi),
          data: dataDieta
        }
      ]);

      if (error) {
        alert(error.message);
        return;
      }
    }

    if (modalita === "colonia") {
      if (!coloniaId) {
        alert("Seleziona una colonia");
        return;
      }

      const membri = petauri.filter(
        (p) => String(p.colonia_id) === String(coloniaId)
      );

      if (membri.length === 0) {
        alert("Nessun petauro collegato a questa colonia");
        return;
      }

      const records = membri.map((p) => ({
        petauro_id: Number(p.id),
        colonia_id: Number(coloniaId),
        alimento_id: Number(alimentoId),
        grammi: Number(grammi),
        data: dataDieta
      }));

      const { error } = await supabase.from("diete").insert(records);

      if (error) {
        alert(error.message);
        return;
      }
    }

    setAlimentoId("");
    setGrammi("");
    setDataDieta("");
    loadDiete();
  }

  async function eliminaDieta(id) {
    const conferma = confirm("Eliminare questo alimento dalla dieta?");
    if (!conferma) return;

    const { error } = await supabase.from("diete").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadDiete();
  }

  async function svuotaDiete() {
    const conferma = confirm("Svuotare tutte le diete inserite?");
    if (!conferma) return;

    const { error } = await supabase.from("diete").delete().neq("id", 0);

    if (error) {
      alert(error.message);
      return;
    }

    loadDiete();
  }

  async function importCSV() {
    if (!csvFile) {
      alert("Seleziona un file CSV");
      return;
    }

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async function (results) {
        const records = results.data
          .filter((row) => row.nome || row.Nome)
          .map((row) => {
            const nome = row.nome || row.Nome;
            const categoria = row.categoria || row.Categoria || "";
            const rapporto = Number(row.rapporto || row.Rapporto || 0);
            const calcio = Number(row.Calcio || row.calcio || rapporto || 0);
            const fosforo = Number(row.Fosforo || row.fosforo || 1);
            const note = row.Note || row.note || "";

            return {
              Nome: nome,
              Categoria: categoria,
              Calcio: calcio,
              Fosforo: fosforo,
              Note: note
            };
          });

        if (records.length === 0) {
          alert("CSV vuoto o non valido");
          return;
        }

        const { error } = await supabase.from("alimenti").insert(records);

        if (error) {
          alert(error.message);
          return;
        }

        alert("Import completato");
        setCsvFile(null);
        loadAlimenti();
      }
    });
  }

  async function salvaSettimana() {
    if (!settimanaNome) {
      alert("Inserisci il nome della settimana");
      return;
    }

    if (diete.length === 0) {
      alert("Non ci sono diete da salvare");
      return;
    }

    const { data, error } = await supabase
      .from("settimane_dieta")
      .insert([{ Nome: settimanaNome }])
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    const records = [];

const { error: errorGiorni } = await supabase
  .from("settimane_dieta_giorni")
  .insert(records);

if (errorGiorni) {
  alert(errorGiorni.message);
  return;
}

    if (errorGiorni) {
      alert(errorGiorni.message);
      return;
    }

    alert("Settimana salvata");
    setSettimanaNome("");
    loadSettimane();
    loadGiorniDB();
  }

  async function applicaSettimana() {
    if (!settimanaDaApplicare || !dataInizioSettimana) {
      alert("Seleziona settimana e data inizio");
      return;
    }

    if (modalita === "petauro" && !petauroId) {
      alert("Seleziona un petauro");
      return;
    }

    if (modalita === "colonia" && !coloniaId) {
      alert("Seleziona una colonia");
      return;
    }

    const recordsSettimana = giorniDB.filter(
      (g) => String(g.settimana_id) === String(settimanaDaApplicare)
    );

    const base = new Date(dataInizioSettimana);
    const recordsFinali = [];

    recordsSettimana.forEach((record) => {
      const nuovaData = new Date(base);
      nuovaData.setDate(base.getDate() + Number(record.giorno_numero || 1) - 1);
      const dataFinale = nuovaData.toISOString().split("T")[0];

      if (modalita === "petauro") {
        recordsFinali.push({
          petauro_id: Number(petauroId),
          colonia_id: null,
          alimento_id: Number(record.alimento_id),
          grammi: Number(record.grammi),
          data: dataFinale
        });
      } else {
        const membri = petauri.filter(
          (p) => String(p.colonia_id) === String(coloniaId)
        );

        membri.forEach((p) => {
          recordsFinali.push({
            petauro_id: Number(p.id),
            colonia_id: Number(coloniaId),
            alimento_id: Number(record.alimento_id),
            grammi: Number(record.grammi),
            data: dataFinale
          });
        });
      }
    });

    if (recordsFinali.length === 0) {
      alert("Nessun dato da applicare");
      return;
    }

    const { error } = await supabase.from("diete").insert(recordsFinali);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Settimana applicata");
    loadDiete();
  }

  const datiGrafico = useMemo(() => {
    if (!petauroId) return [];

    return pesi
      .filter((p) => String(p.petauro_id) === String(petauroId))
      .sort((a, b) => new Date(a.data) - new Date(b.data))
      .map((p) => ({
        data: p.data,
        peso: Number(p.peso)
      }));
  }, [pesi, petauroId]);

  const alertPeso = useMemo(() => {
    return petauri
      .map((petauro) => {
        const storico = pesi
          .filter((p) => String(p.petauro_id) === String(petauro.id))
          .sort((a, b) => new Date(b.data) - new Date(a.data));

        if (storico.length < 2) return null;

        const ultimo = Number(storico[0].peso);
        const precedente = Number(storico[1].peso);
        const differenza = ultimo - precedente;

        if (differenza <= -5) {
          return {
            nome: nomePetauroDisplay(petauro),
            differenza
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [petauri, pesi]);

  const analisiCategorie = useMemo(() => {
    const stats = {
      Frutta: 0,
      Verdura: 0,
      Insetto: 0,
      Integratore: 0,
      Tossico: 0,
      Altro: 0
    };

    const conteggio = {};

    diete.forEach((dieta) => {
      const alimento = getAlimento(dieta.alimento_id);
      if (!alimento) return;

      const categoria = alimento.Categoria || "Altro";
      const g = Number(dieta.grammi || 0);

      if (!stats[categoria]) stats[categoria] = 0;
      stats[categoria] += g;

      if (!conteggio[alimento.Nome]) conteggio[alimento.Nome] = 0;
      conteggio[alimento.Nome] += g;
    });

    const alimentoPiuUsato =
      Object.entries(conteggio)
        .map(([nome, grammi]) => ({ nome, grammi }))
        .sort((a, b) => b.grammi - a.grammi)[0] || null;

    return { stats, alimentoPiuUsato };
  }, [diete, alimenti]);

  const listaSpesa = useMemo(() => {
    const totale = {};

    diete.forEach((dieta) => {
      const alimento = getAlimento(dieta.alimento_id);
      if (!alimento) return;

      if (!totale[alimento.Nome]) totale[alimento.Nome] = 0;
      totale[alimento.Nome] += Number(dieta.grammi || 0);
    });

    return Object.entries(totale)
      .map(([nome, grammi]) => ({ nome, grammi }))
      .sort((a, b) => b.grammi - a.grammi);
  }, [diete, alimenti]);

  const calcoloDieta = useMemo(() => {
    let calcioTotale = 0;
    let fosforoTotale = 0;
    let calcioVegetale = 0;
    let fosforoVegetale = 0;

    diete.forEach((dieta) => {
      const alimento = getAlimento(dieta.alimento_id);
      if (!alimento) return;

      const calcio = (Number(alimento.Calcio || 0) / 100) * Number(dieta.grammi || 0);
      const fosforo = (Number(alimento.Fosforo || 0) / 100) * Number(dieta.grammi || 0);

      calcioTotale += calcio;
      fosforoTotale += fosforo;

      if (alimento.Categoria !== "Insetto") {
        calcioVegetale += calcio;
        fosforoVegetale += fosforo;
      }
    });

    const rapportoTotale = fosforoTotale > 0 ? calcioTotale / fosforoTotale : 0;
    const rapportoVegetale = fosforoVegetale > 0 ? calcioVegetale / fosforoVegetale : 0;

    const calcioNecessario = fosforoVegetale * 2;
    const calcioDaAggiungere =
      calcioVegetale < calcioNecessario ? calcioNecessario - calcioVegetale : 0;

    return {
      calcioTotale,
      fosforoTotale,
      calcioVegetale,
      fosforoVegetale,
      rapportoTotale,
      rapportoVegetale,
      calcioDaAggiungere
    };
  }, [diete, alimenti]);
const coloniaSelezionata = colonie.find(
  (c) => String(c.id) === String(coloniaId)
);

const membriColonia = coloniaSelezionata
  ? petauri.filter(
      (p) =>
        String(p.Colonia || "").trim() ===
        String(coloniaSelezionata.Nome || "").trim()
    )
  : [];
  return (
    <div style={pageStyle}>
      <h1 style={{ color: "#234b2d" }}>Dietauro ENAPI</h1>

      {alertPeso.length > 0 && (
        <div style={alertCard}>
          <h2>🚨 Alert peso</h2>
          {alertPeso.map((a, index) => (
            <p key={index}>
              ⚠️ {a.nome} ha perso {Math.abs(a.differenza)} g
            </p>
          ))}
        </div>
      )}

      <div style={cardStyle}>
        <h2>Modalità</h2>

        <select
          value={modalita}
          onChange={(e) => setModalita(e.target.value)}
          style={inputStyle}
        >
          <option value="petauro">Singolo petauro</option>
          <option value="colonia">Colonia</option>
        </select>

        {modalita === "petauro" ? (
          <select
            value={petauroId}
            onChange={(e) => setPetauroId(e.target.value)}
            style={inputStyle}
          >
            <option value="">Seleziona petauro</option>
            {petauri.map((p) => (
              <option key={p.id} value={p.id}>
                {nomePetauroDisplay(p)}
              </option>
            ))}
          </select>
        ) : (
          <select
            value={coloniaId}
            onChange={(e) => setColoniaId(e.target.value)}
            style={inputStyle}
          >
            <option value="">Seleziona colonia</option>
            {colonie.map((c) => (
              <option key={c.id} value={c.id}>
                {nomeColoniaDisplay(c)}
              </option>
            ))}
          </select>
        )}
      </div>

      <div style={cardStyle}>
        <h2>🏠 Aggiungi colonia</h2>

        <input
          type="text"
          placeholder="Nome colonia"
          value={nomeColonia}
          onChange={(e) => setNomeColonia(e.target.value)}
          style={inputStyle}
        />

        <button onClick={aggiungiColonia} style={greenButton}>
          Salva colonia
        </button>
      </div>

      <div style={cardStyle}>
        <h2>🐿️ Aggiungi petauro</h2>

        <input
          type="text"
          placeholder="Nome petauro"
          value={nomePetauro}
          onChange={(e) => setNomePetauro(e.target.value)}
          style={inputStyle}
        />

        <button onClick={aggiungiPetauro} style={greenButton}>
          Salva petauro
        </button>
      </div>

      <div style={cardStyle}>
        <h2>⚖️ Inserisci peso</h2>

        <input
          type="number"
          placeholder="Peso in grammi"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          style={inputStyle}
        />

        <input
          type="date"
          value={dataPeso}
          onChange={(e) => setDataPeso(e.target.value)}
          style={inputStyle}
        />

        <button onClick={salvaPeso} style={greenButton}>
          Salva peso
        </button>
      </div>

      {petauroId && datiGrafico.length > 0 && (
        <div style={cardStyle}>
          <h2>📈 Andamento peso</h2>

          <div style={{ width: "100%", height: 300 }}>
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
{modalita === "colonia" && coloniaId && (
  <div style={cardStyle}>
    <h2>
      🐿️ Colonia {coloniaSelezionata?.Nome}
    </h2>

    <p>
      Totale petauri: {membriColonia.length}
    </p>

    {membriColonia.map((petauro) => {
      const storico = pesi
        .filter(
          (p) =>
            String(p.petauro_id) === String(petauro.id)
        )
        .sort(
          (a, b) =>
            new Date(a.data) - new Date(b.data)
        );

      const ultimoPeso =
        storico.length > 0
          ? storico[storico.length - 1].peso
          : "-";

      const datiStorico = storico.map((p) => ({
        data: p.data,
        peso: Number(p.peso)
      }));

      return (
        <div
          key={petauro.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "15px",
            marginBottom: "15px"
          }}
        >
          <h3>{nomePetauroDisplay(petauro)}</h3>

          <p>
            ⚖️ Peso attuale: {ultimoPeso} g
          </p>

          {datiStorico.length > 0 && (
            <div
              style={{
                width: "100%",
                height: 250
              }}
            >
              <ResponsiveContainer>
                <LineChart data={datiStorico}>
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
          )}
        </div>
      );
    })}
  </div>
)}
      <div style={cardStyle}>
        <h2 style={{ display: "none" }}>
  🍎 Aggiungi alimento alla dieta
</h2>

        <select
          value={alimentoId}
          onChange={(e) => setAlimentoId(e.target.value)}
          style={inputStyle}
        >
          <option value="">Seleziona alimento</option>
          {alimenti.map((a) => (
            <option key={a.id} value={a.id}>
              {a.Nome}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Grammi"
          value={grammi}
          onChange={(e) => setGrammi(e.target.value)}
          style={inputStyle}
        />

        <input
          type="date"
          value={dataDieta}
          onChange={(e) => setDataDieta(e.target.value)}
          style={inputStyle}
        />

        <button onClick={salvaDieta} style={greenButton}>
          Salva alimento
        </button>
      </div>
      <div style={cardStyle}>
  <h2>🍽️ Costruisci la dieta</h2>

{["Frutta", "Verdura", "Insetto", "Integratore"].map((categoria) => (
  <div key={categoria} style={{ marginBottom: "25px" }}>
    <h3>
      {categoria === "Frutta" && "🍎 Frutta"}
      {categoria === "Verdura" && "🥬 Verdura"}
      {categoria === "Insetto" && "🦗 Insetti"}
      {categoria === "Integratore" && "🧪 Integratori"}
    </h3>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(95px, 1fr))",
        gap: "8px"
      }}
    >
      {alimenti
        .filter((a) => a.Categoria === categoria)
        .sort((a, b) => a.Nome.localeCompare(b.Nome))
        .map((a) => (
          <div
            key={a.id}
           onClick={() => setAlimentoId(a.id)}
            style={{
              border: "1px solid #ddd",
              borderRadius: "50px",
              padding: "8px",
             minHeight: "78px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: "#ffffff"
            }}
          >
            <strong style={{ fontSize: "13px" }}>{a.Nome}</strong>

            {a.Categoria !== "Integratore" && a.Categoria !== "Insetto" && (
              <div style={{ fontSize: "11px" }}>
                Ca:P {rapportoAlimento(a)}:1
              </div>
            )}

            {a.Categoria === "Insetto" && (
              <div style={{ fontSize: "11px" }}>
                🦗 {a.DoseConsigliata} {a.UnitaMisura}
              </div>
            )}

                      {a.Categoria === "Integratore" && (
              <div style={{ fontSize: "11px" }}>
                🧪 Posologia
              </div>
            )}
          </div>
        ))}
    </div>
  </div>
))}
 
</div>

{alimentoId && (
  <div style={cardStyle}>
    <h2>{nomeAlimento(alimentoId)}</h2>

    <p>
      Ca:P {rapportoAlimento(getAlimento(alimentoId))}:1
    </p>

    <input
      type="number"
      placeholder="Grammi"
      value={grammi}
      onChange={(e) => setGrammi(e.target.value)}
      style={inputStyle}
    />

    <button
      onClick={salvaDieta}
      style={greenButton}
    >
      ➕ Aggiungi alla dieta
    </button>
  </div>
)}

{/* Area Import CSV nascosta - solo amministrazione ENAPI */}
    
      <div style={cardStyle}>
        <h2>🧪 Analisi Ca:P</h2>

        <p>Ca:P totale: {calcoloDieta.rapportoTotale.toFixed(2)}:1</p>
        <p>Ca:P vegetale: {calcoloDieta.rapportoVegetale.toFixed(2)}:1</p>

        <p>
          Calcio da aggiungere:{" "}
          <strong>{calcoloDieta.calcioDaAggiungere.toFixed(2)} mg</strong>
        </p>
      </div>

      <div style={cardStyle}>
        <h2>📅 Settimane alimentari</h2>

        <input
          type="text"
          placeholder="Nome settimana"
          value={settimanaNome}
          onChange={(e) => setSettimanaNome(e.target.value)}
          style={inputStyle}
        />

        <select
          value={giornoSettimana}
          onChange={(e) => setGiornoSettimana(e.target.value)}
          style={inputStyle}
        >
          {giorniSettimana.map((g) => (
            <option key={g.nome} value={g.nome}>
              {g.nome}
            </option>
          ))}
        </select>

        <button onClick={salvaSettimana} style={greenButton}>
          Salva settimana
        </button>

        <hr />

        <select
          value={settimanaDaApplicare}
          onChange={(e) => setSettimanaDaApplicare(e.target.value)}
          style={inputStyle}
        >
          <option value="">Seleziona settimana salvata</option>
          {settimane.map((s) => (
            <option key={s.id} value={s.id}>
              {s.Nome}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dataInizioSettimana}
          onChange={(e) => setDataInizioSettimana(e.target.value)}
          style={inputStyle}
        />

        <button onClick={applicaSettimana} style={greenButton}>
          Applica settimana
        </button>
      </div>

      <div style={cardStyle}>
        <h2>📊 Analisi automatica dieta</h2>

        <p>
          <strong>Alimento più usato:</strong>{" "}
          {analisiCategorie.alimentoPiuUsato
            ? `${analisiCategorie.alimentoPiuUsato.nome} (${analisiCategorie.alimentoPiuUsato.grammi} g)`
            : "-"}
        </p>

        <p>Frutta: {analisiCategorie.stats.Frutta || 0} g</p>
        <p>Verdura: {analisiCategorie.stats.Verdura || 0} g</p>
        <p>Insetti: {analisiCategorie.stats.Insetto || 0} g</p>
        <p>Integratori: {analisiCategorie.stats.Integratore || 0} g</p>
        <p>Tossici: {analisiCategorie.stats.Tossico || 0} g</p>
      </div>

      <div style={cardStyle}>
        <h2>🛒 Lista spesa automatica</h2>

        {listaSpesa.length === 0 && <p>Nessun alimento inserito.</p>}

        {listaSpesa.map((item) => (
          <div key={item.nome} style={rowStyle}>
            <strong>{item.nome}</strong>
            <span>{item.grammi} g</span>
          </div>
        ))}
      </div>

    </div>
  );
}
 
const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#eef1ea",
  padding: "20px",
  fontFamily: "Arial, sans-serif"
};

const cardStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "20px",
  marginBottom: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const inputStyle = {
  width: "100%",
  padding: "12px",
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

const redButton = {
  backgroundColor: "#b00020",
  color: "white",
  border: "none",
  padding: "10px",
  borderRadius: "10px",
  cursor: "pointer"
};

const alertCard = {
  backgroundColor: "#ffe5e5",
  color: "#9b1c1c",
  padding: "20px",
  borderRadius: "20px",
  marginBottom: "20px"
};

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px 0",
  borderBottom: "1px solid #ddd"
};

const rowColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  padding: "10px 0",
  borderBottom: "1px solid #ddd"
};

const dietCard = {
  border: "1px solid #ddd",
  borderRadius: "15px",
  padding: "15px",
  marginBottom: "10px"
};
