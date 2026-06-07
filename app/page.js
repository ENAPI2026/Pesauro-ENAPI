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
  const { data, error } = await supabase
    .from("petauri")
    .select("*");

  if (error) {
    alert("ERRORE PETAURI: " + error.message);
    return;
  }

  setPetauri(data || []);
}

  async function loadColonie() {
  const { data, error } = await supabase
    .from("colonie")
    .select("*");

  if (error) {
    alert("ERRORE COLONIE: " + error.message);
    return;
  }

  setColonie(data || []);
}

  async function loadPesi() {
    const { data } = await supabase
      .from("pesi")
      .select("*")
      .order("data", { ascending: true });

    if (data) setPesi(data);
  }

  async function loadAlimenti() {
  const { data, error } = await supabase
    .from("alimenti")
    .select("*");

  if (error) {
    alert("ERRORE ALIMENTI: " + error.message);
    return;
  }

  setAlimenti(data || []);
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

    if (fosforo > 0) return (calcio / fosforo).toFixed(2);
    if (alimento?.Rapporto) return Number(alimento.Rapporto).toFixed(2);
    return "0.00";
  }
function valutazioneAlimento(alimento) {
  const categoria = alimento?.Categoria || "";
  const rapporto = Number(rapportoAlimento(alimento));

  if (categoria === "Tossico") {
    return {
      coloreSfondo: "#ffebee",
      coloreTesto: "#c62828",
      icona: "🔴",
      titolo: "Non adatto",
      testo: "Alimento tossico o da evitare."
    };
  }

  if (rapporto >= 2) {
    return {
      coloreSfondo: "#e8f5e9",
      coloreTesto: "#2e7d32",
      icona: "🟢",
      titolo: "Ottimo rapporto Ca:P",
      testo: "Alimento favorevole per il bilanciamento calcio/fosforo."
    };
  }

  if (rapporto >= 1) {
    return {
      coloreSfondo: "#fff8e1",
      coloreTesto: "#f57f17",
      icona: "🟡",
      titolo: "Rapporto intermedio",
      testo: "Alimento utilizzabile, ma da bilanciare con alimenti più ricchi di calcio."
    };
  }

  return {
    coloreSfondo: "#ffebee",
    coloreTesto: "#c62828",
    icona: "🔴",
    titolo: "Rapporto sfavorevole",
    testo: "Alimento povero di calcio rispetto al fosforo: usare con attenzione e bilanciare la dieta."
  };
}
  async function aggiungiColonia() {
    if (!nomeColonia) {
      alert("Inserisci il nome della colonia");
      return;
    }

    const { error } = await supabase.from("colonie").insert([{ Nome: nomeColonia }]);

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

    const nuovoPetauro = { Nome: nomePetauro };
    if (coloniaId) nuovoPetauro.colonia_id = Number(coloniaId);

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
  if (!alimentoId || !dataDieta) {
    alert("Seleziona alimento e data");
    return;
  }

  const alimento = getAlimento(alimentoId);
  if (!alimento) {
    alert("Alimento non trovato");
    return;
  }

  const isInsetto = alimento.Categoria === "Insetto";
  const isIntegratore = alimento.Categoria === "Integratore";

  let quantitaDaSalvare = Number(grammi);

  if (!isInsetto && !isIntegratore && !grammi) {
    alert("Inserisci i grammi");
    return;
  }

  if (isInsetto) {
    const doseSingola = Number(
      String(alimento.DoseConsigliata || "")
        .replace(",", ".")
        .match(/\d+(\.\d+)?/)?.[0] || 0
    );

    if (!doseSingola) {
      alert("Dose ENAPI non impostata per questo insetto");
      return;
    }

    const membriColonia = petauri.filter(
  (p) => Number(p.colonia_id) === Number(coloniaId)
);

console.log("MODALITA:", modalita);
console.log("COLONIA ID:", coloniaId);
console.log("MEMBRI COLONIA:", membriColonia);

const numeroPetauri =
  modalita === "colonia"
    ? membriColonia.length
    : 1;

    quantitaDaSalvare = doseSingola * numeroPetauri;
  }

  if (isIntegratore) {
    quantitaDaSalvare = 0;
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
        grammi: quantitaDaSalvare,
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

    const quantitaPerPetauro = isInsetto
      ? quantitaDaSalvare / membri.length
      : quantitaDaSalvare;

    const records = membri.map((p) => ({
      petauro_id: Number(p.id),
      colonia_id: Number(coloniaId),
      alimento_id: Number(alimentoId),
      grammi: quantitaPerPetauro,
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

  const { data, error } = await supabase
    .from("diete")
    .delete()
    .eq("id", Number(id))
    .select("id");

  if (error) {
    alert("Errore eliminazione dieta: " + error.message);
    return;
  }

  if (!data || data.length === 0) {
    alert("Nessuna dieta eliminata. Controlla permessi/policy DELETE su Supabase.");
    return;
  }

  setDiete((precedenti) =>
    precedenti.filter((dieta) => String(dieta.id) !== String(id))
  );

  await loadDiete();
}
async function svuotaDiete() {
  const conferma = confirm("Svuotare tutte le diete inserite?");
  if (!conferma) return;

  const { data, error } = await supabase
    .from("diete")
    .delete()
    .gte("id", 0)
    .select("id");

  if (error) {
    alert("Errore svuota diete: " + error.message);
    return;
  }

  if (!data || data.length === 0) {
    alert("Nessuna dieta eliminata. La tabella potrebbe essere già vuota oppure la DELETE è bloccata.");
    return;
  }

  setDiete([]);

  await loadDiete();
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

    const giornoObj = giorniSettimana.find((g) => g.nome === giornoSettimana) || giorniSettimana[0];
    const records = diete.map((dieta) => ({
      settimana_id: data.id,
      giorno_nome: giornoObj.nome,
      giorno_numero: giornoObj.numero,
      alimento_id: Number(dieta.alimento_id),
      grammi: Number(dieta.grammi || 0)
    }));

    const { error: errorGiorni } = await supabase
      .from("settimane_dieta_giorni")
      .insert(records);

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
        const membri = petauri.filter((p) => String(p.colonia_id) === String(coloniaId));

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
      .map((p) => ({ data: p.data, peso: Number(p.peso) }));
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
          return { nome: nomePetauroDisplay(petauro), differenza };
        }

        return null;
      })
      .filter(Boolean);
  }, [petauri, pesi]);

  const analisiCategorie = useMemo(() => {
    const stats = { Frutta: 0, Verdura: 0, Insetto: 0, Integratore: 0, Tossico: 0, Altro: 0 };
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

  const dietePerData = useMemo(() => {
  const gruppi = {};

  diete.forEach((dieta) => {
    const data = dieta.data || "Senza data";

    if (!gruppi[data]) gruppi[data] = [];

    gruppi[data].push(dieta);
  });

  return Object.entries(gruppi).sort(
    ([a], [b]) => new Date(b) - new Date(a)
  );
}, [diete]);

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
    const calcioDaAggiungere = calcioVegetale < calcioNecessario ? calcioNecessario - calcioVegetale : 0;

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

  const coloniaSelezionata = colonie.find((c) => String(c.id) === String(coloniaId));

  const membriColonia = coloniaSelezionata
    ? petauri.filter(
        (p) =>
          String(p.colonia_id || "") === String(coloniaId) ||
          String(p.Colonia || "").trim() === String(coloniaSelezionata.Nome || "").trim()
      )
    : [];
const verificaEnapi = useMemo(() => {
  let records = [];

  if (modalita === "petauro" && petauroId) {
    records = diete.filter(
      (d) => String(d.petauro_id) === String(petauroId)
    );
  }

  if (modalita === "colonia" && coloniaId) {
    records = diete.filter(
      (d) => String(d.colonia_id) === String(coloniaId)
    );
  }

  const dataRiferimento = dataDieta
    ? new Date(dataDieta)
    : new Date();

  const stessaData = (dataA, dataB) => {
    if (!dataA || !dataB) return false;

    const a = new Date(dataA).toISOString().split("T")[0];
    const b = new Date(dataB).toISOString().split("T")[0];

    return a === b;
  };

  const recordsGiorno = records.filter((record) =>
    stessaData(record.data, dataRiferimento)
  );

  const alimentoDaRecord = (record) => getAlimento(record.alimento_id);

  const alimentiUniciGiorno = new Map();

  recordsGiorno.forEach((record) => {
    const alimento = alimentoDaRecord(record);
    if (!alimento) return;

    if (!alimentiUniciGiorno.has(alimento.id)) {
      alimentiUniciGiorno.set(alimento.id, alimento);
    }
  });

  const listaGiorno = Array.from(alimentiUniciGiorno.values());

  const frutti = listaGiorno.filter(
    (a) => a.Categoria === "Frutta"
  );

  const verdure = listaGiorno.filter(
    (a) => a.Categoria === "Verdura"
  );

  const insetti = listaGiorno.filter(
    (a) => a.Categoria === "Insetto"
  );

  const integratorePresenteNegliUltimiGiorni = (testo, giorni) => {
    return records.some((record) => {
      const alimento = alimentoDaRecord(record);
      if (!alimento) return false;

      if (alimento.Categoria !== "Integratore") return false;

      const nome = String(alimento.Nome || "").toLowerCase();
      const posologia = String(alimento.Posologia || "").toLowerCase();
      const cerca = testo.toLowerCase();

      const corrisponde =
        nome.includes(cerca) ||
        posologia.includes(cerca);

      if (!corrisponde) return false;
      if (!record.data) return false;

      const dataRecord = new Date(record.data);
      const differenzaMs = dataRiferimento - dataRecord;
      const differenzaGiorni = differenzaMs / (1000 * 60 * 60 * 24);

      return differenzaGiorni >= 0 && differenzaGiorni <= giorni;
    });
  };

  const pollineOk = integratorePresenteNegliUltimiGiorni("polline", 7);
  const loriOk = integratorePresenteNegliUltimiGiorni("lori", 7);

  const gommaOk =
    integratorePresenteNegliUltimiGiorni("gomma", 10) ||
    integratorePresenteNegliUltimiGiorni("arabica", 10);

  let punteggio = 0;

  if (frutti.length >= 2) punteggio += 25;
  else if (frutti.length === 1) punteggio += 10;

  if (verdure.length >= 3) punteggio += 25;
  else if (verdure.length === 2) punteggio += 10;

  if (insetti.length > 0) punteggio += 25;

  if (calcoloDieta.rapportoTotale >= 2) punteggio += 25;
  else if (calcoloDieta.rapportoTotale >= 1) punteggio += 10;

  const numeroPetauri =
    modalita === "colonia"
      ? membriColonia.length || 1
      : 1;

  return {
    dataRiferimento: dataRiferimento.toISOString().split("T")[0],

    frutti: frutti.length,
    verdure: verdure.length,
    insetti: insetti.length,
    varietaTotale: listaGiorno.length,

    pollineOk,
    loriOk,
    gommaOk,

    punteggio,

    calcioTotale:
      calcoloDieta.calcioDaAggiungere,

    calcioPerPetauro:
      calcoloDieta.calcioDaAggiungere /
      numeroPetauri
  };
}, [
  diete,
  alimenti,
  petauroId,
  coloniaId,
  modalita,
  membriColonia,
  calcoloDieta,
  dataDieta
]);
  const alimentoSelezionato = getAlimento(alimentoId);

  return (
    <div style={pageStyle}>
      <h1 style={{ color: "#234b2d" }}>Dietauro ENAPI</h1>

      {alertPeso.length > 0 && (
        <div style={alertCard}>
          <h2>🚨 Alert peso</h2>
          {alertPeso.map((a, index) => (
            <p key={index}>⚠️ {a.nome} ha perso {Math.abs(a.differenza)} g</p>
          ))}
        </div>
      )}

      <div style={cardStyle}>
        <h2>Modalità</h2>
        <select value={modalita} onChange={(e) => setModalita(e.target.value)} style={inputStyle}>
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
        <input type="text" placeholder="Nome colonia" value={nomeColonia} onChange={(e) => setNomeColonia(e.target.value)} style={inputStyle} />
        <button onClick={aggiungiColonia} style={greenButton}>Salva colonia</button>
      </div>

      <div style={cardStyle}>
        <h2>🐿️ Aggiungi petauro</h2>
        <input type="text" placeholder="Nome petauro" value={nomePetauro} onChange={(e) => setNomePetauro(e.target.value)} style={inputStyle} />
        <button onClick={aggiungiPetauro} style={greenButton}>Salva petauro</button>
      </div>

      <div style={cardStyle}>
        <h2>⚖️ Inserisci peso</h2>
        <input type="number" placeholder="Peso in grammi" value={peso} onChange={(e) => setPeso(e.target.value)} style={inputStyle} />
        <input type="date" value={dataPeso} onChange={(e) => setDataPeso(e.target.value)} style={inputStyle} />
        <button onClick={salvaPeso} style={greenButton}>Salva peso</button>
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
                <Line type="monotone" dataKey="peso" stroke="#234b2d" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {modalita === "colonia" && coloniaId && (
        <div style={cardStyle}>
          <h2>🐿️ Colonia {coloniaSelezionata?.Nome}</h2>
          <p>Totale petauri: {membriColonia.length}</p>

          {membriColonia.map((petauro) => {
            const storico = pesi
              .filter((p) => String(p.petauro_id) === String(petauro.id))
              .sort((a, b) => new Date(a.data) - new Date(b.data));
            const ultimoPeso = storico.length > 0 ? storico[storico.length - 1].peso : "-";
            const datiStorico = storico.map((p) => ({ data: p.data, peso: Number(p.peso) }));

            return (
              <div key={petauro.id} style={dietCard}>
                <h3>{nomePetauroDisplay(petauro)}</h3>
                <p>⚖️ Peso attuale: {ultimoPeso} g</p>

                {datiStorico.length > 0 && (
                  <div style={{ width: "100%", height: 250 }}>
                    <ResponsiveContainer>
                      <LineChart data={datiStorico}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="data" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="peso" stroke="#234b2d" strokeWidth={3} />
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
        <h2>🍽️ Costruisci la dieta</h2>

        {["Frutta", "Verdura", "Insetto", "Integratore"].map((categoria) => (
          <div key={categoria} style={{ marginBottom: "25px" }}>
            <h3>
              {categoria === "Frutta" && "🍎 Frutta"}
              {categoria === "Verdura" && "🥬 Verdura"}
              {categoria === "Insetto" && "🦗 Insetti"}
              {categoria === "Integratore" && "🧪 Integratori"}
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(95px, 1fr))", gap: "8px" }}>
              {alimenti
                .filter((a) => a.Categoria === categoria)
                .sort((a, b) => a.Nome.localeCompare(b.Nome))
                .map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAlimentoId(String(a.id))}
                    style={{
                      border: String(alimentoId) === String(a.id) ? "2px solid #234b2d" : "1px solid #ddd",
                      borderRadius: "18px",
                      padding: "8px",
                      minHeight: "95px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      cursor: "pointer",
                      backgroundColor: "#ffffff",
                      fontFamily: "inherit"
                    }}
                  >
                    <strong style={{ fontSize: "13px" }}>{a.Nome}</strong>

                    {a.Categoria !== "Integratore" && a.Categoria !== "Insetto" && (
                      <div style={{ fontSize: "11px" }}>Ca:P {rapportoAlimento(a)}:1</div>
                    )}

                    {a.Categoria === "Insetto" && (
                      <div style={{ fontSize: "11px" }}>🦗 {a.DoseConsigliata} {a.UnitaMisura}</div>
                    )}

                    {a.Categoria === "Integratore" && (
                      <div style={{ fontSize: "11px" }}>🧪 Posologia</div>
                    )}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

 {alimentoId && alimentoSelezionato && (() => {
  const isInsetto = alimentoSelezionato.Categoria === "Insetto";
  const isIntegratore = alimentoSelezionato.Categoria === "Integratore";
  const isTossico = alimentoSelezionato.Categoria === "Tossico";

  const numeroPetauri =
    modalita === "colonia"
      ? petauri.filter((p) => String(p.colonia_id) === String(coloniaId)).length || 1
      : 1;

  const doseSingola = Number(
    String(alimentoSelezionato.DoseConsigliata || "")
      .replace(",", ".")
      .match(/\d+(\.\d+)?/)?.[0] || 0
  );

  const doseIntegratoreSingola = Number(
    String(alimentoSelezionato.DoseConsigliata || alimentoSelezionato.Posologia || "")
      .replace(",", ".")
      .match(/\d+(\.\d+)?/)?.[0] || 0
  );

  const totaleInsetti = doseSingola * numeroPetauri;
  const totaleIntegratore = doseIntegratoreSingola * numeroPetauri;

  const unitaMisura = alimentoSelezionato.UnitaMisura || "";

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={() => setAlimentoId("")} style={closeButtonStyle}>
          ✕
        </button>

        <h2>{nomeAlimento(alimentoId)}</h2>

        <p>
          Categoria: <strong>{alimentoSelezionato.Categoria}</strong>
        </p>

     {!isInsetto && !isIntegratore && (() => {
  const valutazione = valutazioneAlimento(alimentoSelezionato);

  return (
    <div
      style={{
        backgroundColor: valutazione.coloreSfondo,
        color: valutazione.coloreTesto,
        padding: "12px",
        borderRadius: "12px",
        fontWeight: "bold"
      }}
    >
      <p style={{ margin: 0 }}>
        {valutazione.icona} {valutazione.titolo}
      </p>

      <p style={{ margin: "6px 0 0 0" }}>
        Ca:P {rapportoAlimento(alimentoSelezionato)}:1
      </p>

      <p style={{ margin: "6px 0 0 0", fontWeight: "normal" }}>
        {valutazione.testo}
      </p>
    </div>
  );
})()}

        {isTossico && (
          <p
            style={{
              backgroundColor: "#ffebee",
              color: "#c62828",
              padding: "10px",
              borderRadius: "10px",
              fontWeight: "bold"
            }}
          >
            ☠️ Attenzione: alimento tossico / non consigliato.
          </p>
        )}

        {isInsetto && (
          <>
            <p>
              🦗 Dose ENAPI per petauro:{" "}
              <strong>
                {alimentoSelezionato.DoseConsigliata} {unitaMisura}
              </strong>
            </p>

            <p>
              Totale da somministrare:{" "}
              <strong>
                {totaleInsetti} {unitaMisura}
              </strong>
              {modalita === "colonia" && ` per ${numeroPetauri} petauri`}
            </p>
          </>
        )}

        {isIntegratore && (
          <>
            {alimentoSelezionato.Posologia && (
              <p>
                🧪 Posologia: <strong>{alimentoSelezionato.Posologia}</strong>
              </p>
            )}

            {doseIntegratoreSingola > 0 && (
              <>
                <p>
                  Dose per petauro:{" "}
                  <strong>
                    {doseIntegratoreSingola} {unitaMisura}
                  </strong>
                </p>

                {modalita === "colonia" && (
                  <p>
                    Totale per colonia:{" "}
                    <strong>
                      {totaleIntegratore} {unitaMisura}
                    </strong>{" "}
                    per {numeroPetauri} petauri
                  </p>
                )}
              </>
            )}
          </>
        )}

        {alimentoSelezionato.Note && (
          <p
            style={{
              backgroundColor: "#fff8e1",
              color: "#6d4c00",
              padding: "10px",
              borderRadius: "10px",
              fontWeight: "bold"
            }}
          >
            📝 Note: {alimentoSelezionato.Note}
          </p>
        )}

        {!isInsetto && !isIntegratore && !isTossico && (
          <input
            type="number"
            placeholder="Grammi"
            value={grammi}
            onChange={(e) => setGrammi(e.target.value)}
            style={inputStyle}
          />
        )}

        <input
          type="date"
          value={dataDieta}
          onChange={(e) => setDataDieta(e.target.value)}
          style={inputStyle}
        />

        {!isTossico && (
          <button onClick={salvaDieta} style={greenButton}>
            ➕ Aggiungi alla dieta
          </button>
        )}
      </div>
    </div>
  );
})()}   
  

     <div style={cardStyle}>
  <h2>🧪 Analisi Ca:P</h2>

  <p
    style={{
      color:
        calcoloDieta.rapportoTotale >= 2
          ? "green"
          : calcoloDieta.rapportoTotale >= 1
          ? "orange"
          : "red",
      fontWeight: "bold",
      fontSize: "18px"
    }}
  >
    Ca:P totale: {calcoloDieta.rapportoTotale.toFixed(2)}:1
  </p>

  <p>
    Ca:P vegetale: {calcoloDieta.rapportoVegetale.toFixed(2)}:1
  </p>

  <p>
    Calcio da aggiungere:{" "}
    <strong>{calcoloDieta.calcioDaAggiungere.toFixed(2)} mg</strong>
  </p>
 {calcoloDieta.rapportoTotale >= 2 ? (
  <p
    style={{
      backgroundColor: "#e8f5e9",
      color: "#2e7d32",
      padding: "10px",
      borderRadius: "10px",
      fontWeight: "bold"
    }}
  >
    ✅ Rapporto Ca:P corretto secondo le linee guida ENAPI
  </p>
) : (
  <p
    style={{
      backgroundColor: "#ffebee",
      color: "#c62828",
      padding: "10px",
      borderRadius: "10px",
      fontWeight: "bold"
    }}
  >
    ⚠️ Rapporto Ca:P insufficiente. Aggiungere calcio senza D3.
  </p>
)} 
</div>

      <div style={cardStyle}>
        <h2>📅 Settimane alimentari</h2>
        <input type="text" placeholder="Nome settimana" value={settimanaNome} onChange={(e) => setSettimanaNome(e.target.value)} style={inputStyle} />
        <select value={giornoSettimana} onChange={(e) => setGiornoSettimana(e.target.value)} style={inputStyle}>
          {giorniSettimana.map((g) => <option key={g.nome} value={g.nome}>{g.nome}</option>)}
        </select>
        <button onClick={salvaSettimana} style={greenButton}>Salva settimana</button>
        <hr />
        <select value={settimanaDaApplicare} onChange={(e) => setSettimanaDaApplicare(e.target.value)} style={inputStyle}>
          <option value="">Seleziona settimana salvata</option>
          {settimane.map((s) => <option key={s.id} value={s.id}>{s.Nome}</option>)}
        </select>
        <input type="date" value={dataInizioSettimana} onChange={(e) => setDataInizioSettimana(e.target.value)} style={inputStyle} />
        <button onClick={applicaSettimana} style={greenButton}>Applica settimana</button>
      </div>
<div style={cardStyle}>
  <h2>📋 Verifica Dieta ENAPI</h2>

  <p>
    🍎 Frutti diversi:
    <strong>
      {" "}
      {verificaEnapi.frutti}
      {verificaEnapi.frutti >= 2 ? " ✅" : " ⚠️"}
    </strong>
  </p>

  <p>
    🥬 Verdure diverse:
    <strong>
      {" "}
      {verificaEnapi.verdure}
      {verificaEnapi.verdure >= 3 ? " ✅" : " ⚠️"}
    </strong>
  </p>

  <p>
    🦗 Insetti:
    <strong>
      {" "}
      {verificaEnapi.insetti > 0
        ? `${verificaEnapi.insetti} varietà ✅`
        : "Assenti ⚠️"}
    </strong>
  </p>
  {verificaEnapi.insetti === 0 && (
  <p
    style={{
      backgroundColor: "#ffebee",
      color: "#c62828",
      padding: "10px",
      borderRadius: "10px",
      fontWeight: "bold"
    }}
  >
    ⚠️ Attenzione: nella dieta non è stato inserito nessun insetto.  
    Gli insetti vivi sono obbligatori nella dieta ENAPI.
  </p>
)}

  <hr />

  <p>
    📊 Varietà alimentare totale:
    <strong> {verificaEnapi.varietaTotale}</strong>
  </p>

  <hr />

  <p>
    ⚖️ Rapporto Ca:P vegetale:
    <strong>
      {" "}
      {calcoloDieta.rapportoVegetale.toFixed(2)}:1
    </strong>
  </p>

  <p>
    ⚖️ Rapporto Ca:P totale:
    <strong>
      {" "}
      {calcoloDieta.rapportoTotale.toFixed(2)}:1
    </strong>
  </p>

  <hr />

  <p>
    🧪 Calcio da aggiungere:
    <strong>
      {" "}
      {verificaEnapi.calcioTotale.toFixed(2)} mg
    </strong>
  </p>

  {modalita === "colonia" && (
    <p>
      👥 Calcio per petauro:
      <strong>
        {" "}
        {verificaEnapi.calcioPerPetauro.toFixed(2)} mg
      </strong>
    </p>
  )}

  <hr />

  <p>
  🌼 Polline:
  <strong>
    {" "}
    {verificaEnapi.pollineOk
      ? "✅ Inserito negli ultimi 7 giorni"
      : "⚠️ Non risulta inserito negli ultimi 7 giorni"}
  </strong>
</p>

{!verificaEnapi.pollineOk && (
  <p
    style={{
      backgroundColor: "#fff8e1",
      color: "#f57f17",
      padding: "10px",
      borderRadius: "10px",
      fontWeight: "bold"
    }}
  >
    ⚠️ Controlla la posologia: il polline va inserito secondo frequenza ENAPI.
  </p>
)}

<p>
  🦜 Lori:
  <strong>
    {" "}
    {verificaEnapi.loriOk
      ? "✅ Inserito negli ultimi 7 giorni"
      : "⚠️ Non risulta inserito negli ultimi 7 giorni"}
  </strong>
</p>

{!verificaEnapi.loriOk && (
  <p
    style={{
      backgroundColor: "#fff8e1",
      color: "#f57f17",
      padding: "10px",
      borderRadius: "10px",
      fontWeight: "bold"
    }}
  >
    ⚠️ Controlla la posologia: Lori va inserito secondo frequenza ENAPI.
  </p>
)}

<p>
  🌳 Gomma arabica:
  <strong>
    {" "}
    {verificaEnapi.gommaOk
      ? "✅ Inserita negli ultimi 10 giorni"
      : "⚠️ Non risulta inserita negli ultimi 10 giorni"}
  </strong>
</p>

{!verificaEnapi.gommaOk && (
  <p
    style={{
      backgroundColor: "#fff8e1",
      color: "#f57f17",
      padding: "10px",
      borderRadius: "10px",
      fontWeight: "bold"
    }}
  >
    ⚠️ Controlla la posologia: la gomma arabica va inserita secondo frequenza ENAPI.
  </p>
)}
  <hr />

  <h3
    style={{
      color:
        verificaEnapi.punteggio >= 90
          ? "green"
          : verificaEnapi.punteggio >= 60
          ? "orange"
          : "red"
    }}
  >
    ⭐ Punteggio ENAPI: {verificaEnapi.punteggio}/100
  </h3>
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
<div style={cardStyle}>
  <h2>📅 Storico Diete</h2>

  {dietePerData.length === 0 && (
    <p>Nessuna dieta registrata.</p>
  )}

  {dietePerData.map(([data, records]) => (
    <div
      key={data}
      style={{
        border: "1px solid #ddd",
        borderRadius: "15px",
        padding: "15px",
        marginBottom: "15px"
      }}
    >
      <h3>📅 {data}</h3>

      <p>
        Totale alimenti inseriti: <strong>{records.length}</strong>
      </p>

      {[...new Set(
        records.map((r) => nomeAlimento(r.alimento_id))
      )].map((nome) => (
        <div key={nome}>• {nome}</div>
      ))}
    </div>
  ))}
</div>
      <div style={cardStyle}>
        <h2>🍽️ Diete inserite</h2>
        <button onClick={svuotaDiete} style={redButton}>Svuota tutte le diete</button>

        {diete.map((dieta) => {
          const alimento = getAlimento(dieta.alimento_id);

          return (
            <div key={dieta.id} style={dietCard}>
              <p>Petauro: {nomePetauroDisplay(getPetauro(dieta.petauro_id))}</p>
              <p>Colonia: {nomeColoniaDisplay(getColonia(dieta.colonia_id))}</p>
              <p>Alimento: {nomeAlimento(dieta.alimento_id)}</p>

              {alimento?.Categoria === "Insetto" && (
                <p>🦗 Dose ENAPI: {alimento.DoseConsigliata} {alimento.UnitaMisura} per petauro</p>
              )}

              {alimento?.Categoria === "Integratore" && <p>🧪 {alimento.Posologia}</p>}

              <p>Grammi: {dieta.grammi}</p>
              <p>Data: {dieta.data}</p>
              <button onClick={() => eliminaDieta(dieta.id)} style={redButton}>Elimina</button>
            </div>
          );
        })}
      </div>
{false && (
  <div style={cardStyle}>
    <h2>🍎 Alimenti presenti</h2>

    {["Frutta", "Verdura", "Insetto", "Integratore", "Tossico"].map((categoria) => (
      <div key={categoria} style={{ marginBottom: "25px" }}>
        <h3>
          {categoria === "Frutta" && "🍎 Frutta"}
          {categoria === "Verdura" && "🥬 Verdura"}
          {categoria === "Insetto" && "🦗 Insetti"}
          {categoria === "Integratore" && "🧪 Integratori"}
          {categoria === "Tossico" && "☠️ Tossici"}
        </h3>

        {alimenti
          .filter((a) => a.Categoria === categoria)
          .sort((a, b) => a.Nome.localeCompare(b.Nome))
          .map((a) => (
            <div key={a.id} style={rowColumnStyle}>
              <strong>{a.Nome}</strong>
              <span>Ca: {a.Calcio} | P: {a.Fosforo}</span>
              <span>Rapporto Ca:P: {rapportoAlimento(a)}:1</span>
              {a.Note && <span>📝 {a.Note}</span>}
            </div>
          ))}
      </div>
    ))}
  </div>
)}

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
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999
};

const modalStyle = {
  backgroundColor: "white",
  padding: "25px",
  borderRadius: "20px",
  width: "90%",
  maxWidth: "450px",
  maxHeight: "90vh",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const closeButtonStyle = {
  alignSelf: "flex-end",
  border: "none",
  background: "none",
  fontSize: "24px",
  cursor: "pointer"
};