
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
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
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
  const oggiISO = new Date().toISOString().split("T")[0];
  const [dataDieta, setDataDieta] = useState(oggiISO);

  const [csvFile, setCsvFile] = useState(null);

  const [settimanaNome, setSettimanaNome] = useState("");
  const [giornoSettimana, setGiornoSettimana] = useState("Lunedi");
  const [settimanaDaApplicare, setSettimanaDaApplicare] = useState("");
  const [dataInizioSettimana, setDataInizioSettimana] = useState("");
const [settimanaApplicazioneAperta, setSettimanaApplicazioneAperta] = useState("");
  const [giornoReplicaAperto, setGiornoReplicaAperto] = useState("");
const [dataReplica, setDataReplica] = useState("");
const [dietaAutomatica, setDietaAutomatica] = useState(null);
const [nomeDietaAutomatica, setNomeDietaAutomatica] = useState("");
const [dataDietaAutomaticaGiornaliera, setDataDietaAutomaticaGiornaliera] = useState("");
const [petauroSchedaId, setPetauroSchedaId] = useState("");
const [petauroEdit, setPetauroEdit] = useState(null);
const [pesoScheda, setPesoScheda] = useState("");
const [dataPesoScheda, setDataPesoScheda] = useState("");
const [coloniaSchedaId, setColoniaSchedaId] = useState("");
const [documentiPetauro, setDocumentiPetauro] = useState([]);
const [documentoNome, setDocumentoNome] = useState("");
const [documentoTipo, setDocumentoTipo] = useState("Veterinario");
const [documentoFile, setDocumentoFile] = useState(null);
const [fotoPetauroCaricamento, setFotoPetauroCaricamento] = useState(false);
const [storicoDataDa, setStoricoDataDa] = useState("");
const [storicoDataA, setStoricoDataA] = useState("");
const [storicoPetauroId, setStoricoPetauroId] = useState("");
const [storicoColoniaId, setStoricoColoniaId] = useState("");
const [storicoCategoria, setStoricoCategoria] = useState("");
const [adminAlimentoId, setAdminAlimentoId] = useState("");
const [adminAlimentoEdit, setAdminAlimentoEdit] = useState(null); 
const [authUser, setAuthUser] = useState(null);
const [loginEmail, setLoginEmail] = useState("");
const [loginPassword, setLoginPassword] = useState("");
const [authMessaggio, setAuthMessaggio] = useState("");
const [authModalita, setAuthModalita] = useState("login");
const [isAdmin, setIsAdmin] = useState(false);
const [sezioneAttiva, setSezioneAttiva] = useState("home");
const [stepDietauroAperto, setStepDietauroAperto] = useState("destinatario");
useEffect(() => {
  inizializzaApp();

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    setAuthUser(session?.user || null);
    controllaAdmin();
  });

  return () => {
    data.subscription.unsubscribe();
  };
}, []);

async function inizializzaApp() {
  const { data } = await supabase.auth.getSession();
  setAuthUser(data?.session?.user || null);
  await loadAll();
}

async function loadAll() {
  await Promise.all([
    loadPetauri(),
    loadColonie(),
    loadPesi(),
    loadAlimenti(),
    loadDiete(),
    loadSettimane(),
    loadGiorniDB(),
    controllaAdmin()
  ]);
}

async function controllaAdmin() {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  if (!user) {
    setIsAdmin(false);
    return;
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    setIsAdmin(false);
    return;
  }

  setIsAdmin(true);
}
async function loginUtente() {
  if (!loginEmail || !loginPassword) {
    setAuthMessaggio("Inserisci email e password.");
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password: loginPassword
  });

  if (error) {
    setAuthMessaggio("Errore login: " + error.message);
    return;
  }

  setAuthMessaggio("Login effettuato.");
  setLoginPassword("");
  await controllaAdmin();
  await loadAll();
}
async function registraUtente() {
  if (!loginEmail || !loginPassword) {
    setAuthMessaggio("Inserisci email e password.");
    return;
  }

  if (loginPassword.length < 6) {
    setAuthMessaggio("La password deve avere almeno 6 caratteri.");
    return;
  }

  const { error } = await supabase.auth.signUp({
    email: loginEmail,
    password: loginPassword
  });

  if (error) {
    setAuthMessaggio("Errore registrazione: " + error.message);
    return;
  }

  setAuthMessaggio("Registrazione effettuata. Controlla la tua email se Supabase richiede conferma.");
  setLoginPassword("");
}
async function recuperaPassword() {
  if (!loginEmail) {
    setAuthMessaggio("Inserisci l'email per recuperare la password.");
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, {
    redirectTo: window.location.origin
  });

  if (error) {
    setAuthMessaggio("Errore recupero password: " + error.message);
    return;
  }

  setAuthMessaggio("Email di recupero password inviata.");
}
async function logoutUtente() {
  await supabase.auth.signOut();
  setAuthUser(null);
  setIsAdmin(false);
  setAuthMessaggio("Logout effettuato.");
}
async function getUserIdCorrente() {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id || null;
}
async function loadPetauri() {
  const userId = await getUserIdCorrente();

  if (!userId) {
    setPetauri([]);
    return;
  }

  const { data, error } = await supabase
    .from("petauri")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    alert("ERRORE PETAURI: " + error.message);
    return;
  }

  setPetauri(data || []);
}

  async function loadColonie() {
  const userId = await getUserIdCorrente();

  if (!userId) {
    setColonie([]);
    return;
  }

  const { data, error } = await supabase
    .from("colonie")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    alert("ERRORE COLONIE: " + error.message);
    return;
  }

  setColonie(data || []);
}

 async function loadPesi() {
  const userId = await getUserIdCorrente();

  if (!userId) {
    setPesi([]);
    return;
  }

  const { data, error } = await supabase
    .from("pesi")
    .select("*")
    .eq("user_id", userId)
    .order("data", { ascending: true });

  if (error) {
    alert("ERRORE PESI: " + error.message);
    return;
  }

  setPesi(data || []);
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
  const userId = await getUserIdCorrente();

  if (!userId) {
    setDiete([]);
    return;
  }

  const { data, error } = await supabase
    .from("diete")
    .select("*")
    .eq("user_id", userId)
    .order("data", { ascending: false });

  if (error) {
    alert("ERRORE DIETE: " + error.message);
    return;
  }

  setDiete(data || []);
} 

 async function loadSettimane() {
  const userId = await getUserIdCorrente();

  if (!userId) {
    setSettimane([]);
    return;
  }

  const { data, error } = await supabase
    .from("settimane_dieta")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    alert("ERRORE SETTIMANE: " + error.message);
    return;
  }

  setSettimane(data || []);
}

 async function loadGiorniDB() {
  const userId = await getUserIdCorrente();

  if (!userId) {
    setGiorniDB([]);
    return;
  }

  const { data, error } = await supabase
    .from("settimane_dieta_giorni")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    alert("ERRORE GIORNI SETTIMANA: " + error.message);
    return;
  }

  setGiorniDB(data || []);
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
function apriSchedaPetauro(id) {
  const petauro = getPetauro(id);
  if (!petauro) return;

  setPetauroSchedaId(String(id));
  setPetauroEdit({
    Nome: petauro.Nome || petauro.nome || "",
    Sesso: petauro.Sesso || "",
    Peso: petauro.Peso || "",
    Colonia: petauro.Colonia || "",
    Stato: petauro.Stato || "",
    Note: petauro.Note || "",
    Foto: petauro.Foto || "",
    DataNascita: petauro["Data di nascita"] || "",
    Castrato: petauro.Castrato || "",
    Provenienza: petauro.Provenienza || "",
    Veterinario: petauro.Veterinario || "",
    colonia_id: petauro.colonia_id || ""
  });
  loadDocumentiPetauro(id);
}

function chiudiSchedaPetauro() {
  setPetauroSchedaId("");
  setPetauroEdit(null);
  setDocumentiPetauro([]);
  setDocumentoNome("");
  setDocumentoTipo("Veterinario");
  setDocumentoFile(null);
  setFotoPetauroCaricamento(false);
}

function aggiornaPetauroEdit(campo, valore) {
  setPetauroEdit((precedente) => ({
    ...precedente,
    [campo]: valore
  }));
}

async function salvaSchedaPetauro() {
  if (!petauroSchedaId || !petauroEdit) return;

  const aggiornamento = {
    Nome: petauroEdit.Nome,
    Sesso: petauroEdit.Sesso,
    Peso: petauroEdit.Peso ? Number(petauroEdit.Peso) : null,
    Colonia: petauroEdit.Colonia,
    Stato: petauroEdit.Stato,
    Note: petauroEdit.Note,
    Foto: petauroEdit.Foto,
    "Data di nascita": petauroEdit.DataNascita,
    Castrato: petauroEdit.Castrato,
    Provenienza: petauroEdit.Provenienza,
    Veterinario: petauroEdit.Veterinario,
    colonia_id: petauroEdit.colonia_id ? Number(petauroEdit.colonia_id) : null
  };

  const { error } = await supabase
    .from("petauri")
    .update(aggiornamento)
    .eq("id", Number(petauroSchedaId));

  if (error) {
    alert("Errore salvataggio petauro: " + error.message);
    return;
  }

  await loadPetauri();
  chiudiSchedaPetauro();
}
async function loadDocumentiPetauro(idPetauro) {
  if (!idPetauro) {
    setDocumentiPetauro([]);
    return;
  }

  const { data, error } = await supabase
    .from("documenti_petauro")
    .select("*")
    .eq("petauro_id", Number(idPetauro))
    .order("created_at", { ascending: false });

  if (error) {
    setDocumentiPetauro([]);
    return;
  }

  setDocumentiPetauro(data || []);
}

function pulisciNomeFile(nomeFile) {
  return String(nomeFile || "documento")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function caricaFotoPetauro(file) {
  if (!petauroSchedaId || !file) return;

  if (!String(file.type || "").startsWith("image/")) {
    alert("Seleziona un file immagine.");
    return;
  }

  setFotoPetauroCaricamento(true);

  const nomeFilePulito = pulisciNomeFile(file.name);
  const filePath = `${petauroSchedaId}/${Date.now()}-${nomeFilePulito}`;

  const { error: uploadError } = await supabase.storage
    .from("foto-petauri")
    .upload(filePath, file, { upsert: false });

  if (uploadError) {
    setFotoPetauroCaricamento(false);
    alert("Errore caricamento foto: " + uploadError.message);
    return;
  }

  const { data } = supabase.storage
    .from("foto-petauri")
    .getPublicUrl(filePath);

  const fotoUrl = data.publicUrl;

  const { error: updateError } = await supabase
    .from("petauri")
    .update({ Foto: fotoUrl })
    .eq("id", Number(petauroSchedaId));

  if (updateError) {
    setFotoPetauroCaricamento(false);
    alert("Errore salvataggio foto petauro: " + updateError.message);
    return;
  }

  aggiornaPetauroEdit("Foto", fotoUrl);
  await loadPetauri();
  setFotoPetauroCaricamento(false);
}

async function caricaDocumentoPetauro() {
  if (!petauroSchedaId) {
    alert("Apri prima la scheda di un petauro.");
    return;
  }

  if (!documentoFile) {
    alert("Seleziona un documento da caricare.");
    return;
  }

  const nomeFilePulito = pulisciNomeFile(documentoFile.name);
  const filePath = `${petauroSchedaId}/${Date.now()}-${nomeFilePulito}`;

  const { error: uploadError } = await supabase.storage
    .from("documenti-petauri")
    .upload(filePath, documentoFile, { upsert: false });

  if (uploadError) {
    alert("Errore caricamento documento: " + uploadError.message);
    return;
  }

  const { error: insertError } = await supabase
    .from("documenti_petauro")
    .insert([
      {
        petauro_id: Number(petauroSchedaId),
        nome: documentoNome.trim() || documentoFile.name,
        tipo: documentoTipo,
        file_name: documentoFile.name,
        file_path: filePath,
        mime_type: documentoFile.type || null,
        size: documentoFile.size || null
      }
    ]);

  if (insertError) {
    await supabase.storage.from("documenti-petauri").remove([filePath]);
    alert("Errore salvataggio documento: " + insertError.message);
    return;
  }

  setDocumentoNome("");
  setDocumentoTipo("Veterinario");
  setDocumentoFile(null);
  await loadDocumentiPetauro(petauroSchedaId);
}

async function apriDocumentoPetauro(documento) {
  if (!documento?.file_path) {
    alert("Documento non disponibile.");
    return;
  }

  const { data, error } = await supabase.storage
    .from("documenti-petauri")
    .createSignedUrl(documento.file_path, 600);

  if (error) {
    alert("Errore apertura documento: " + error.message);
    return;
  }

  window.open(data.signedUrl, "_blank");
}

async function eliminaDocumentoPetauro(documento) {
  const conferma = confirm("Eliminare questo documento dalla scheda petauro?");
  if (!conferma) return;

  const { error } = await supabase
    .from("documenti_petauro")
    .delete()
    .eq("id", Number(documento.id));

  if (error) {
    alert("Errore eliminazione documento: " + error.message);
    return;
  }

  if (documento.file_path) {
    await supabase.storage.from("documenti-petauri").remove([documento.file_path]);
  }

  setDocumentiPetauro((precedenti) =>
    precedenti.filter((item) => String(item.id) !== String(documento.id))
  );
}
  function getColonia(id) {
    return colonie.find((c) => String(c.id) === String(id));
  }
function petauroAppartieneAColonia(petauro, idColonia) {
  if (!idColonia) return false;

  const colonia = getColonia(idColonia);
  const nomeColonia = String(colonia?.Nome || colonia?.nome || "").trim();

  return (
    String(petauro.colonia_id || "") === String(idColonia) ||
    (nomeColonia && String(petauro.Colonia || "").trim() === nomeColonia)
  );
}
function apriSchedaColonia(id) {
  if (!id) return;
  setColoniaSchedaId(String(id));
}

function chiudiSchedaColonia() {
  setColoniaSchedaId("");
}
  function getAlimento(id) {
    return alimenti.find((a) => String(a.id) === String(id));
  }

  function nomeAlimento(id) {
    const alimento = getAlimento(id);
    return alimento ? alimento.Nome : "-";
  }
function linkAcquistoAlimento(alimento) {
  return (
    alimento?.link_acquisto ||
    alimento?.LinkAcquisto ||
    alimento?.amazon_url ||
    alimento?.AmazonUrl ||
    ""
  );
}
function apriAlimentoAdmin(id) {
  const alimento = getAlimento(id);
  if (!alimento) return;

  setAdminAlimentoId(String(id));
  setAdminAlimentoEdit({
    Nome: alimento.Nome || "",
    Categoria: alimento.Categoria || "",
    Calcio: alimento.Calcio || "",
    Fosforo: alimento.Fosforo || "",
    Note: alimento.Note || "",
    FotoUrl: alimento.FotoUrl || "",
    link_acquisto: alimento.link_acquisto || alimento.LinkAcquisto || alimento.amazon_url || alimento.AmazonUrl || "",
    DoseConsigliata: alimento.DoseConsigliata || "",
    UnitaMisura: alimento.UnitaMisura || "",
    Posologia: alimento.Posologia || ""
  });
}

function aggiornaAlimentoAdmin(campo, valore) {
  setAdminAlimentoEdit((precedente) => ({
    ...precedente,
    [campo]: valore
  }));
}

async function salvaAlimentoAdmin() {
  if (!adminAlimentoId || !adminAlimentoEdit) {
    alert("Seleziona un alimento da modificare.");
    return;
  }

  const aggiornamento = {
    Nome: adminAlimentoEdit.Nome,
    Categoria: adminAlimentoEdit.Categoria,
    Calcio: adminAlimentoEdit.Calcio ? Number(adminAlimentoEdit.Calcio) : 0,
    Fosforo: adminAlimentoEdit.Fosforo ? Number(adminAlimentoEdit.Fosforo) : 0,
    Note: adminAlimentoEdit.Note,
    FotoUrl: adminAlimentoEdit.FotoUrl,
    link_acquisto: adminAlimentoEdit.link_acquisto,
    DoseConsigliata: adminAlimentoEdit.DoseConsigliata,
    UnitaMisura: adminAlimentoEdit.UnitaMisura,
    Posologia: adminAlimentoEdit.Posologia
  };

  const { error } = await supabase
    .from("alimenti")
    .update(aggiornamento)
    .eq("id", Number(adminAlimentoId));

  if (error) {
    alert("Errore salvataggio alimento: " + error.message);
    return;
  }

  alert("Alimento aggiornato.");
  await loadAlimenti();
}
function ordinaPesiDalPiuRecente(a, b) {
  const dataA = a.data ? new Date(a.data).getTime() : 0;
  const dataB = b.data ? new Date(b.data).getTime() : 0;

  if (dataB !== dataA) return dataB - dataA;

  return Number(b.id || 0) - Number(a.id || 0);
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
async function salvaPesoDaScheda() {
  if (!petauroSchedaId || !pesoScheda || !dataPesoScheda) {
    alert("Inserisci peso e data della pesata.");
    return;
  }

  const userId = await getUserIdCorrente();

  if (!userId) {
    alert("Devi effettuare l'accesso per salvare una pesata.");
    return;
  }

  const { error } = await supabase.from("pesi").insert([
    {
      petauro_id: Number(petauroSchedaId),
      peso: Number(pesoScheda),
      data: dataPesoScheda,
      user_id: userId
    }
  ]);

  if (error) {
    alert("Errore salvataggio pesata: " + error.message);
    return;
  }

  setPesoScheda("");
  setDataPesoScheda("");
  await loadPesi();
}
 async function aggiungiColonia() {
  if (!nomeColonia) {
    alert("Inserisci il nome della colonia");
    return;
  }

  const userId = await getUserIdCorrente();

  if (!userId) {
    alert("Devi effettuare l'accesso per creare una colonia.");
    return;
  }

  const { error } = await supabase.from("colonie").insert([
    {
      Nome: nomeColonia,
      user_id: userId
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

  const userId = await getUserIdCorrente();

  if (!userId) {
    alert("Devi effettuare l'accesso per creare un petauro.");
    return;
  }

  const nuovoPetauro = {
    Nome: nomePetauro,
    user_id: userId
  };

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

  const userId = await getUserIdCorrente();

  if (!userId) {
    alert("Devi effettuare l'accesso per salvare una pesata.");
    return;
  }

  const { error } = await supabase.from("pesi").insert([
    {
      petauro_id: Number(petauroId),
      peso: Number(peso),
      data: dataPeso,
      user_id: userId
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

  const userId = await getUserIdCorrente();

  if (!userId) {
    alert("Devi effettuare l'accesso per salvare una dieta.");
    return;
  }

  const alimento = getAlimento(alimentoId);
  if (!alimento) {
    alert("Alimento non trovato");
    return;
  }

  const isInsetto = alimento.Categoria === "Insetto";
  const isIntegratore = alimento.Categoria === "Integratore";

  let quantitaDaSalvare = grammi ? Number(grammi) : 0;

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

    const membriColoniaDieta = petauri.filter((p) =>
      petauroAppartieneAColonia(p, coloniaId)
    );

    const numeroPetauri =
      modalita === "colonia"
        ? membriColoniaDieta.length
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
        data: dataDieta,
        user_id: userId
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

    const membri = petauri.filter((p) =>
      petauroAppartieneAColonia(p, coloniaId)
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
      data: dataDieta,
      user_id: userId
    }));

    const { error } = await supabase.from("diete").insert(records);

    if (error) {
      alert(error.message);
      return;
    }
  }

  setAlimentoId("");
  setGrammi("");
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
async function eliminaSettimanaSalvata(settimana) {
  const nomeSettimana = settimana.Nome || settimana.nome || "questa settimana";
  const settimanaId = Number(settimana.id);

  if (!settimanaId) {
    alert("ID settimana non valido.");
    return;
  }

  const conferma = confirm(`Eliminare "${nomeSettimana}" dalle settimane salvate?`);
  if (!conferma) return;

  const { data: giorniEliminati, error: errorGiorni } = await supabase
    .from("settimane_dieta_giorni")
    .delete()
    .eq("settimana_id", settimanaId)
    .select("id");

  if (errorGiorni) {
    alert("Errore eliminazione giorni settimana: " + errorGiorni.message);
    return;
  }

  const { data: settimaneEliminate, error } = await supabase
    .from("settimane_dieta")
    .delete()
    .eq("id", settimanaId)
    .select("id");

  if (error) {
    alert("Errore eliminazione settimana: " + error.message);
    return;
  }

  if (!settimaneEliminate || settimaneEliminate.length === 0) {
    alert(
      "La settimana non è stata eliminata. Probabile policy DELETE mancante su Supabase per settimane_dieta."
    );
    return;
  }

  setSettimane((precedenti) =>
    precedenti.filter((s) => String(s.id) !== String(settimanaId))
  );

  setGiorniDB((precedenti) =>
    precedenti.filter((g) => String(g.settimana_id) !== String(settimanaId))
  );

  alert(`Settimana eliminata. Giorni eliminati: ${giorniEliminati?.length || 0}.`);

  await loadSettimane();
  await loadGiorniDB();
}
async function eliminaGiornataDieta(giorno) {
  const conferma = confirm("Eliminare questa dieta salvata?");
  if (!conferma) return;

  const ids = giorno.records.map((record) => record.id).filter(Boolean);

  if (ids.length === 0) {
    alert("Nessuna dieta da eliminare.");
    return;
  }

  const { error } = await supabase
    .from("diete")
    .delete()
    .in("id", ids);

  if (error) {
    alert("Errore eliminazione dieta: " + error.message);
    return;
  }

  await loadDiete();
}
async function replicaGiornata(giorno, nuovaData) {
  if (!nuovaData) {
    alert("Seleziona una data per replicare la dieta.");
    return;
  }

  const userId = await getUserIdCorrente();

  if (!userId) {
    alert("Devi effettuare l'accesso per replicare una dieta.");
    return;
  }

  const recordsDaInserire = giorno.records.map((record) => ({
    petauro_id: record.petauro_id ? Number(record.petauro_id) : null,
    colonia_id: record.colonia_id ? Number(record.colonia_id) : null,
    alimento_id: Number(leggiAlimentoId(record)),
    grammi: Number(record.grammi || 0),
    data: nuovaData,
    user_id: userId
  }));

  if (recordsDaInserire.length === 0) {
    alert("Nessuna dieta da replicare.");
    return;
  }

  const { error } = await supabase
    .from("diete")
    .insert(recordsDaInserire);

  if (error) {
    alert("Errore replica dieta: " + error.message);
    return;
  }

  alert("Dieta replicata correttamente.");
  setGiornoReplicaAperto("");
  setDataReplica("");
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


function leggiGiornoNome(record) {
  return record.giorno_nome || record.giorno || record.Giorno || record.NomeGiorno || "Giorno";
}

function leggiGiornoNumero(record) {
  const nome = leggiGiornoNome(record);
  const giornoDaNome = giorniSettimana.find((g) => g.nome === nome);

  return Number(
    record.giorno_numero ||
    record.numero_giorno ||
    record.NumeroGiorno ||
    record.GiornoNumero ||
    giornoDaNome?.numero ||
    1
  );
}

function leggiAlimentoId(record) {
  return record.alimento_id || record.AlimentoId || record.alimentoId || record.AlimentoID;
}

async function inserisciGiorniSettimana(recordsBase) {
  const userId = await getUserIdCorrente();

  if (!userId) {
    return { message: "Utente non autenticato." };
  }

  const recordsConUserId = recordsBase.map((record) => ({
    ...record,
    user_id: record.user_id || userId
  }));

  const tentativi = [
    (r) => ({
      settimana_id: r.settimana_id,
      giorno_nome: r.giornoNome,
      giorno_numero: r.giornoNumero,
      alimento_id: r.alimentoId,
      grammi: r.grammi,
      user_id: r.user_id
    }),
    (r) => ({
      settimana_id: r.settimana_id,
      giorno: r.giornoNome,
      giorno_numero: r.giornoNumero,
      alimento_id: r.alimentoId,
      grammi: r.grammi,
      user_id: r.user_id
    }),
    (r) => ({
      settimana_id: r.settimana_id,
      giorno: r.giornoNome,
      numero_giorno: r.giornoNumero,
      alimento_id: r.alimentoId,
      grammi: r.grammi,
      user_id: r.user_id
    }),
    (r) => ({
      settimana_id: r.settimana_id,
      Giorno: r.giornoNome,
      NumeroGiorno: r.giornoNumero,
      AlimentoId: r.alimentoId,
      grammi: r.grammi,
      user_id: r.user_id
    })
  ];

  let ultimoErrore = null;

  for (const creaRecord of tentativi) {
    const { error } = await supabase
      .from("settimane_dieta_giorni")
      .insert(recordsConUserId.map(creaRecord));

    if (!error) return null;

    ultimoErrore = error;
  }

  return ultimoErrore;
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

  const userId = await getUserIdCorrente();

  if (!userId) {
    alert("Devi effettuare l'accesso per salvare una settimana.");
    return;
  }

  const { data, error } = await supabase
    .from("settimane_dieta")
    .insert([
      {
        nome: settimanaNome,
        user_id: userId
      }
    ])
    .select()
    .single();

  if (error) {
    alert(error.message);
    return;
  }

  const giornoObj =
    giorniSettimana.find((g) => g.nome === giornoSettimana) ||
    giorniSettimana[0];

  const records = diete.map((dieta) => ({
    settimana_id: data.id,
    giornoNome: giornoObj.nome,
    giornoNumero: giornoObj.numero,
    alimentoId: Number(dieta.alimento_id),
    grammi: Number(dieta.grammi || 0),
    user_id: userId
  }));

  const errorGiorni = await inserisciGiorniSettimana(records);

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

  const userId = await getUserIdCorrente();

  if (!userId) {
    alert("Devi effettuare l'accesso per applicare una settimana.");
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
    nuovaData.setDate(base.getDate() + leggiGiornoNumero(record) - 1);
    const dataFinale = nuovaData.toISOString().split("T")[0];

    if (modalita === "petauro") {
      recordsFinali.push({
        petauro_id: Number(petauroId),
        colonia_id: null,
        alimento_id: Number(leggiAlimentoId(record)),
        grammi: Number(record.grammi),
        data: dataFinale,
        user_id: userId
      });
    } else {
      const membri = petauri.filter((p) =>
        petauroAppartieneAColonia(p, coloniaId)
      );

      membri.forEach((p) => {
        recordsFinali.push({
          petauro_id: Number(p.id),
          colonia_id: Number(coloniaId),
          alimento_id: Number(leggiAlimentoId(record)),
          grammi: Number(record.grammi),
          data: dataFinale,
          user_id: userId
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

  alert("Settimana applicata allo storico diete");
  setSettimanaApplicazioneAperta("");
  setSettimanaDaApplicare("");
  setDataInizioSettimana("");
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
  const oggi = new Date();

  return petauri
    .flatMap((petauro) => {
      const storico = pesi
        .filter((p) => String(p.petauro_id) === String(petauro.id))
        .sort(ordinaPesiDalPiuRecente)

      const alerts = [];
      const nome = nomePetauroDisplay(petauro);

      if (storico.length === 0) {
        alerts.push({
          tipo: "peso_mancante",
          livello: "warning",
          nome,
          testo: `${nome} non ha ancora pesate registrate.`
        });

        return alerts;
      }

      const ultimo = storico[0];
      const precedente = storico[1];

      const ultimoPeso = Number(ultimo.peso || 0);
      const dataUltimoPeso = ultimo.data ? new Date(ultimo.data) : null;

      if (dataUltimoPeso) {
        const giorniDaUltimaPesata =
          (oggi - dataUltimoPeso) / (1000 * 60 * 60 * 24);

        if (giorniDaUltimaPesata > 30) {
          alerts.push({
            tipo: "pesata_vecchia",
            livello: "warning",
            nome,
            testo: `${nome} non viene pesato da ${Math.floor(giorniDaUltimaPesata)} giorni.`
          });
        }
      }

      if (precedente) {
        const pesoPrecedente = Number(precedente.peso || 0);
        const differenza = ultimoPeso - pesoPrecedente;

        if (differenza <= -5) {
          alerts.push({
            tipo: "calo_peso",
            livello: "danger",
            nome,
            testo: `${nome} ha perso ${Math.abs(differenza)} g dall'ultima pesata.`
          });
        }

        if (differenza >= 5) {
          alerts.push({
            tipo: "aumento_peso",
            livello: "warning",
            nome,
            testo: `${nome} ha preso ${differenza} g dall'ultima pesata.`
          });
        }
      }

      return alerts;
    });
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

    const tipo = dieta.colonia_id ? "colonia" : "petauro";
    const idRiferimento = dieta.colonia_id || dieta.petauro_id || "senza-id";
    const chiave = `${data}-${tipo}-${idRiferimento}`;

    if (!gruppi[chiave]) {
      gruppi[chiave] = {
        data,
        tipo,
        idRiferimento,
        records: []
      };
    }

    gruppi[chiave].records.push(dieta);
  });

  return Object.values(gruppi)
    .map((gruppo) => {
      const records = gruppo.records;

      const nomeSoggetto =
        gruppo.tipo === "colonia"
          ? nomeColoniaDisplay(getColonia(gruppo.idRiferimento))
          : nomePetauroDisplay(getPetauro(gruppo.idRiferimento));

      const nomiPerCategoria = (categoria) => [
        ...new Set(
          records
            .map((record) => getAlimento(leggiAlimentoId(record)))
            .filter((alimento) => alimento?.Categoria === categoria)
            .map((alimento) => alimento.Nome)
        )
      ];

      const frutti = nomiPerCategoria("Frutta");
      const verdure = nomiPerCategoria("Verdura");
      const insetti = nomiPerCategoria("Insetto");
      const integratori = nomiPerCategoria("Integratore");

      let calcioVegetale = 0;
      let fosforoVegetale = 0;
      let grammiFruttaVerdura = 0;

      records.forEach((record) => {
        const alimento = getAlimento(record.alimento_id);
        if (!alimento) return;

        const grammiRecord = Number(record.grammi || 0);

        if (alimento.Categoria === "Frutta" || alimento.Categoria === "Verdura") {
          grammiFruttaVerdura += grammiRecord;

          calcioVegetale += (Number(alimento.Calcio || 0) / 100) * grammiRecord;
          fosforoVegetale += (Number(alimento.Fosforo || 0) / 100) * grammiRecord;
        }
      });

      const rapportoVegetale =
        fosforoVegetale > 0 ? calcioVegetale / fosforoVegetale : 0;

      const calcioNecessario = fosforoVegetale * 2;
      const calcioDaAggiungere =
        calcioVegetale < calcioNecessario
          ? calcioNecessario - calcioVegetale
          : 0;

      return {
        ...gruppo,
        nomeSoggetto,
        frutti,
        verdure,
        insetti,
        integratori,
        grammiFruttaVerdura,
        rapportoVegetale,
        calcioDaAggiungere
      };
    })
    .filter((gruppo) => {
      if ((storicoDataDa || storicoDataA) && !/^\d{4}-\d{2}-\d{2}$/.test(gruppo.data)) {
        return false;
      }

      if (storicoDataDa && gruppo.data < storicoDataDa) return false;
      if (storicoDataA && gruppo.data > storicoDataA) return false;

      if (storicoPetauroId) {
        const includePetauro = gruppo.records.some(
          (record) => String(record.petauro_id || "") === String(storicoPetauroId)
        );
        if (!includePetauro) return false;
      }

      if (storicoColoniaId) {
        const includeColonia =
          String(gruppo.tipo) === "colonia" &&
          String(gruppo.idRiferimento || "") === String(storicoColoniaId);

        if (!includeColonia) return false;
      }

      if (storicoCategoria) {
        const includeCategoria = gruppo.records.some((record) => {
          const alimento = getAlimento(leggiAlimentoId(record));
          return alimento?.Categoria === storicoCategoria;
        });

        if (!includeCategoria) return false;
      }

      return true;
    })
    .sort(ordinaPesiDalPiuRecente)
}, [
  diete,
  alimenti,
  petauri,
  colonie,
  storicoDataDa,
  storicoDataA,
  storicoPetauroId,
  storicoColoniaId,
  storicoCategoria
]);

const filtriStoricoAttivi =
  storicoDataDa ||
  storicoDataA ||
  storicoPetauroId ||
  storicoColoniaId ||
  storicoCategoria;

function azzeraFiltriStorico() {
  setStoricoDataDa("");
  setStoricoDataA("");
  setStoricoPetauroId("");
  setStoricoColoniaId("");
  setStoricoCategoria("");
}
const settimaneRiepilogo = useMemo(() => {
  return settimane.map((settimana) => {
    const giorni = giorniDB
      .filter((g) => String(g.settimana_id) === String(settimana.id))
      .sort((a, b) => leggiGiornoNumero(a) - leggiGiornoNumero(b));

    const gruppiGiorno = {};

    giorni.forEach((record) => {
      const nomeGiorno = leggiGiornoNome(record);
      if (!gruppiGiorno[nomeGiorno]) gruppiGiorno[nomeGiorno] = [];
      gruppiGiorno[nomeGiorno].push(record);
    });

    const riepilogoGiorni = Object.entries(gruppiGiorno).map(([nomeGiorno, records]) => {
      const elementi = records
        .map((record) => ({
          record,
          alimento: getAlimento(leggiAlimentoId(record)),
          grammi: Number(record.grammi || 0)
        }))
        .filter((item) => item.alimento);

      const elementiPerCategoria = (categoria) =>
        elementi
          .filter((item) => item.alimento.Categoria === categoria)
          .map((item) => {
            const unita = categoria === "Insetto" ? item.alimento.UnitaMisura || "pz" : "g";
            return item.grammi > 0
              ? `${item.alimento.Nome} (${item.grammi.toFixed(1)} ${unita})`
              : item.alimento.Nome;
          });

      let grammiFruttaVerdura = 0;
      let calcioVegetale = 0;
      let fosforoVegetale = 0;

      elementi.forEach((item) => {
        const alimento = item.alimento;
        const grammi = item.grammi;

        if (alimento.Categoria === "Frutta" || alimento.Categoria === "Verdura") {
          grammiFruttaVerdura += grammi;
          calcioVegetale += (Number(alimento.Calcio || 0) / 100) * grammi;
          fosforoVegetale += (Number(alimento.Fosforo || 0) / 100) * grammi;
        }
      });

      const rapportoVegetale = fosforoVegetale > 0 ? calcioVegetale / fosforoVegetale : 0;
      const calcioNecessario = fosforoVegetale * 2;
      const calcioDaAggiungere =
        calcioVegetale < calcioNecessario ? calcioNecessario - calcioVegetale : 0;

      return {
        nomeGiorno,
        records,
        frutti: elementiPerCategoria("Frutta"),
        verdure: elementiPerCategoria("Verdura"),
        insetti: elementiPerCategoria("Insetto"),
        integratori: elementiPerCategoria("Integratore"),
        grammiFruttaVerdura,
        rapportoVegetale,
        calcioDaAggiungere
      };
    });

    return {
      ...settimana,
      giorni: riepilogoGiorni
    };
  });
}, [settimane, giorniDB, alimenti]);
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
    ? petauri.filter((p) => petauroAppartieneAColonia(p, coloniaId))
    : [];
   const coloniaScheda = getColonia(coloniaSchedaId);

const membriColoniaScheda = coloniaScheda
  ? petauri.filter((p) => petauroAppartieneAColonia(p, coloniaSchedaId))
  : [];

const riepilogoColoniaScheda = useMemo(() => {
  const membri = membriColoniaScheda.map((petauro) => {
    const storico = pesi
      .filter((p) => String(p.petauro_id) === String(petauro.id))
      .sort(ordinaPesiDalPiuRecente);

    const ultimo = storico[0];
    const precedente = storico[1];

    const pesoAttuale = ultimo ? Number(ultimo.peso || 0) : Number(petauro.Peso || 0) || null;
    const dataUltimoPeso = ultimo?.data || "";
    const differenza =
      ultimo && precedente ? Number(ultimo.peso || 0) - Number(precedente.peso || 0) : null;

    return {
      id: petauro.id,
      nome: nomePetauroDisplay(petauro),
      sesso: petauro.Sesso || "",
      pesoAttuale,
      dataUltimoPeso,
      differenza
    };
  });

  const pesoTotale = membri.reduce(
    (totale, petauro) => totale + Number(petauro.pesoAttuale || 0),
    0
  );

  const petauriSenzaPeso = membri
    .filter((petauro) => !petauro.pesoAttuale)
    .map((petauro) => petauro.nome);

  return {
    membri,
    pesoTotale,
    petauriSenzaPeso
  };
}, [membriColoniaScheda, pesi]); 
const datiGraficoColoniaScheda = useMemo(() => {
  if (!membriColoniaScheda.length) return [];

  const datiPerData = {};

  membriColoniaScheda.forEach((petauro) => {
    const nome = nomePetauroDisplay(petauro);

    pesi
      .filter((peso) => String(peso.petauro_id) === String(petauro.id))
      .forEach((peso) => {
        const data = peso.data || "Senza data";

        if (!datiPerData[data]) {
          datiPerData[data] = { data };
        }

        datiPerData[data][nome] = Number(peso.peso || 0);
      });
  });

  return Object.values(datiPerData).sort(
    (a, b) => new Date(a.data) - new Date(b.data)
  );
}, [membriColoniaScheda, pesi]);
  let records = [];
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

  const grammiFruttaVerdura = recordsGiorno.reduce((totale, record) => {
    const alimento = alimentoDaRecord(record);
    if (!alimento) return totale;

    if (alimento.Categoria === "Frutta" || alimento.Categoria === "Verdura") {
      return totale + Number(record.grammi || 0);
    }

    return totale;
  }, 0);

  const ultimoPesoPetauro = (idPetauro) => {
    const storico = pesi
      .filter((p) => String(p.petauro_id) === String(idPetauro))
      .sort(ordinaPesiDalPiuRecente)

    if (storico.length === 0) return null;

    return Number(storico[0].peso || 0);
  };

  let pesoTotale = 0;
  let pesoDisponibile = true;
  let petauriSenzaPeso = [];

  if (modalita === "petauro") {
    const pesoPetauro = ultimoPesoPetauro(petauroId);

    if (!pesoPetauro) {
      pesoDisponibile = false;
      petauriSenzaPeso = [nomePetauroDisplay(getPetauro(petauroId))];
    } else {
      pesoTotale = pesoPetauro;
    }
  }

  if (modalita === "colonia") {
    membriColonia.forEach((petauro) => {
      const pesoPetauro = ultimoPesoPetauro(petauro.id);

      if (!pesoPetauro) {
        pesoDisponibile = false;
        petauriSenzaPeso.push(nomePetauroDisplay(petauro));
        return;
      }

      pesoTotale += pesoPetauro;
    });

    if (membriColonia.length === 0) {
      pesoDisponibile = false;
    }
  }

  const grammiConsigliati = pesoDisponibile
    ? pesoTotale * 0.3
    : 0;

  const differenzaGrammi = pesoDisponibile
    ? grammiFruttaVerdura - grammiConsigliati
    : 0;

  const quantitaSufficiente = pesoDisponibile
    ? grammiFruttaVerdura >= grammiConsigliati
    : false;

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

    pesoTotale,
    pesoDisponibile,
    petauriSenzaPeso,
    grammiFruttaVerdura,
    grammiConsigliati,
    differenzaGrammi,
    quantitaSufficiente,

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
  dataDieta,
  pesi
]);
function calcolaDosePraticaCalcio(rapportoInput, grammiVegetaliInput) {
  const grammiVegetali = Number(grammiVegetaliInput || 0);
  const rapporto = Number(rapportoInput || 0);

  if (grammiVegetali <= 0) {
    return {
      icona: "🟠",
      titolo: "Dose indicativa",
      dose: "1 cucchiaino di calcio senza D3",
      testo: "Non sono stati inseriti i grammi della frutta e della verdura: la posologia è indicativa.",
      backgroundColor: "#fff3e0",
      borderColor: "#ffb74d",
      color: "#8a4b00"
    };
  }

  if (rapporto > 2) {
    return {
      icona: "🟢",
      titolo: "Rapporto favorevole",
      dose: "⅓ di cucchiaino di calcio senza D3",
      testo: "Il rapporto Ca:P è favorevole. Si consiglia solo una piccola integrazione prudenziale.",
      backgroundColor: "#e8f5e9",
      borderColor: "#81c784",
      color: "#1b5e20"
    };
  }

  if (rapporto >= 1.5) {
    return {
      icona: "🟡",
      titolo: "Piccola correzione",
      dose: "½ cucchiaino di calcio senza D3",
      testo: "Il rapporto Ca:P è vicino al valore consigliato, ma richiede una piccola integrazione.",
      backgroundColor: "#fffde7",
      borderColor: "#fdd835",
      color: "#7a5d00"
    };
  }

  if (rapporto >= 1) {
    return {
      icona: "🟠",
      titolo: "Correzione media",
      dose: "1 cucchiaino di calcio senza D3",
      testo: "Il rapporto Ca:P è sotto il valore consigliato e richiede una correzione più evidente.",
      backgroundColor: "#fff3e0",
      borderColor: "#ffb74d",
      color: "#8a4b00"
    };
  }

  return {
    icona: "🔴",
    titolo: "Correzione alta",
    dose: "1 cucchiaino e ½ di calcio senza D3",
    testo: "Il rapporto Ca:P è molto sfavorevole: oltre alla dose pratica, valuta anche gli alimenti scelti.",
    backgroundColor: "#ffebee",
    borderColor: "#ef9a9a",
    color: "#b00020"
  };
}

const dosePraticaCalcio = useMemo(() => {
  return calcolaDosePraticaCalcio(
    calcoloDieta.rapportoVegetale,
    verificaEnapi.grammiFruttaVerdura
  );
}, [verificaEnapi.grammiFruttaVerdura, calcoloDieta.rapportoVegetale]);
const petauriRiepilogo = useMemo(() => {
  return petauri.map((petauro) => {
    const storico = pesi
      .filter((p) => String(p.petauro_id) === String(petauro.id))
      .sort(ordinaPesiDalPiuRecente)

    const ultimo = storico[0];
    const precedente = storico[1];

    const pesoAttuale = ultimo ? Number(ultimo.peso) : Number(petauro.Peso || 0) || null;
    const dataUltimoPeso = ultimo?.data || null;
    const differenza =
      ultimo && precedente ? Number(ultimo.peso) - Number(precedente.peso) : null;

    const colonia = colonie.find(
      (c) =>
        String(c.id) === String(petauro.colonia_id || "") ||
        String(c.Nome || c.nome || "").trim() === String(petauro.Colonia || "").trim()
    );

    return {
      id: petauro.id,
      nome: nomePetauroDisplay(petauro),
      sesso: petauro.Sesso || "",
      stato: petauro.Stato || "",
      note: petauro.Note || "",
      foto: petauro.Foto || "",
      dataNascita: petauro["Data di nascita"] || "",
      castrato: petauro.Castrato || "",
      provenienza: petauro.Provenienza || "",
      veterinario: petauro.Veterinario || "",
      colonia: colonia ? nomeColoniaDisplay(colonia) : petauro.Colonia || "Nessuna colonia",
      pesoAttuale,
      dataUltimoPeso,
      differenza,
      storico: storico.length
    };
  });
}, [petauri, pesi, colonie]);

const petauroSelezionatoInfo = petauriRiepilogo.find(
  (p) => String(p.id) === String(petauroId)
);
function calcolaCaPAlimenti(listaAlimenti, grammiPerAlimento) {
  let calcio = 0;
  let fosforo = 0;

  listaAlimenti.forEach((alimento) => {
    calcio += (Number(alimento.Calcio || 0) / 100) * grammiPerAlimento;
    fosforo += (Number(alimento.Fosforo || 0) / 100) * grammiPerAlimento;
  });

  const rapporto = fosforo > 0 ? calcio / fosforo : 0;
  const calcioNecessario = fosforo * 2;
  const calcioDaAggiungere = calcio < calcioNecessario ? calcioNecessario - calcio : 0;

  return {
    calcio,
    fosforo,
    rapporto,
    calcioDaAggiungere
  };
}

function preparaDatiDietaAutomatica() {
  const normalizzaNome = (testo) =>
    String(testo || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const fruttiBase = [
    "mela",
    "pera",
    "banana",
    "melone",
    "anguria",
    "pesca",
    "albicocca",
    "mango",
    "papaya",
    "mirtillo",
    "lampone",
    "fragola",
    "uva"
  ];

  const verdureBase = [
    "carota",
    "zucchina",
    "finocchio",
    "cetriolo",
    "sedano",
    "radicchio",
    "indivia",
    "scarola",
    "lattuga romana",
    "peperone",
    "fagiolino",
    "piselli",
    "pisello",
    "okra",
    "fiori di zucca",
    "cicoria",
    "rucola",
    "valeriana",
    "catalogna"
  ];

  const alimentoInLista = (alimento, lista) =>
    lista.some((nome) => normalizzaNome(alimento.Nome).includes(nome));

  const frutti = alimenti
    .filter((a) => a.Categoria === "Frutta")
    .filter((a) => alimentoInLista(a, fruttiBase))
    .sort((a, b) => Number(rapportoAlimento(b)) - Number(rapportoAlimento(a)));

  const verdure = alimenti
    .filter((a) => a.Categoria === "Verdura")
    .filter((a) => alimentoInLista(a, verdureBase))
    .sort((a, b) => normalizzaNome(a.Nome).localeCompare(normalizzaNome(b.Nome)));

  const insetti = alimenti
    .filter((a) => a.Categoria === "Insetto")
    .sort((a, b) => a.Nome.localeCompare(b.Nome));

  const integratori = alimenti
    .filter((a) => a.Categoria === "Integratore");

  if (frutti.length < 2 || verdure.length < 3 || insetti.length < 1) {
    alert("Servono almeno 2 frutti base, 3 verdure base e 1 insetto nel database alimenti.");
    return;
  }

  const ultimoPesoPetauro = (idPetauro) => {
    const storico = pesi
      .filter((p) => String(p.petauro_id) === String(idPetauro))
      .sort(ordinaPesiDalPiuRecente);

    if (storico.length === 0) return null;
    return Number(storico[0].peso || 0);
  };

  let pesoTotale = 0;
  let pesoDisponibile = true;
  let numeroPetauri = 1;
  let selezioneMancante = false;

  if (modalita === "petauro") {
    if (!petauroId) {
      const conferma = confirm(
        "Non hai selezionato nessun petauro. Vuoi generare comunque una dieta automatica indicativa? Potrai usare l'anteprima e la lista spesa, ma per salvarla nello storico dovrai scegliere un petauro."
      );

      if (!conferma) return;

      pesoDisponibile = false;
      selezioneMancante = true;
      numeroPetauri = 1;
    } else {
      const pesoPetauro = ultimoPesoPetauro(petauroId);

      if (!pesoPetauro) {
        pesoDisponibile = false;
      } else {
        pesoTotale = pesoPetauro;
      }

      numeroPetauri = 1;
    }
  }

  if (modalita === "colonia") {
    if (!coloniaId) {
      const conferma = confirm(
        "Non hai selezionato nessuna colonia. Vuoi generare comunque una dieta automatica indicativa per 1 petauro? Potrai usare l'anteprima e la lista spesa, ma per salvarla nello storico dovrai scegliere una colonia."
      );

      if (!conferma) return;

      pesoDisponibile = false;
      selezioneMancante = true;
      numeroPetauri = 1;
    } else {
      if (membriColonia.length === 0) {
        const conferma = confirm(
          "La colonia selezionata non ha petauri collegati. Vuoi generare comunque una dieta automatica indicativa per 1 petauro?"
        );

        if (!conferma) return;

        pesoDisponibile = false;
        numeroPetauri = 1;
      } else {
        numeroPetauri = membriColonia.length;

        membriColonia.forEach((petauro) => {
          const pesoPetauro = ultimoPesoPetauro(petauro.id);

          if (!pesoPetauro) {
            pesoDisponibile = false;
            return;
          }

          pesoTotale += pesoPetauro;
        });
      }
    }
  }

  const quantitaTotale = pesoDisponibile ? pesoTotale * 0.3 : 50;
  const grammiPerAlimento = Number((quantitaTotale / 5).toFixed(1));

  const trovaIntegratore = (testo) =>
    integratori.find((a) =>
      String(a.Nome || "").toLowerCase().includes(testo.toLowerCase())
    );

  const polline = trovaIntegratore("polline");
  const lori = trovaIntegratore("lori");
  const gomma = integratori.find((a) => {
    const nome = String(a.Nome || "").toLowerCase();
    return nome.includes("gomma") || nome.includes("arabica");
  });

  return {
    frutti,
    verdure,
    insetti,
    pesoDisponibile,
    pesoTotale,
    quantitaTotale,
    grammiPerAlimento,
    numeroPetauri,
    selezioneMancante,
    polline,
    lori,
    gomma
  };
}

function creaGiornoDietaAutomatica(giorno, index, base) {
  const fruttiGiorno = [
    base.frutti[index % base.frutti.length],
    base.frutti[(index + 3) % base.frutti.length]
  ];

  const verdureGiorno = [
    base.verdure[index % base.verdure.length],
    base.verdure[(index + 2) % base.verdure.length],
    base.verdure[(index + 5) % base.verdure.length]
  ];

  const insettoGiorno = base.insetti[index % base.insetti.length];

  const doseInsettoSingola = Number(
    String(insettoGiorno.DoseConsigliata || "")
      .replace(",", ".")
      .match(/\d+(\.\d+)?/)?.[0] || 0
  );

  const quantitaInsetti = doseInsettoSingola * base.numeroPetauri;
  const unitaInsetti = insettoGiorno.UnitaMisura || "";

  const integratoriGiorno = [];

  if (index === 0 && base.polline) integratoriGiorno.push(base.polline);
  if (index === 2 && base.lori) integratoriGiorno.push(base.lori);
  if (index === 6 && base.gomma) integratoriGiorno.push(base.gomma);

  const vegetali = [...fruttiGiorno, ...verdureGiorno];
  const calcolo = calcolaCaPAlimenti(vegetali, base.grammiPerAlimento);

  return {
    giorno: giorno.nome,
    frutti: fruttiGiorno,
    verdure: verdureGiorno,
    insetto: insettoGiorno,
    quantitaInsetti,
    doseInsettoSingola,
    unitaInsetti,
    numeroPetauri: base.numeroPetauri,
    integratori: integratoriGiorno,
    quantitaTotale: base.quantitaTotale,
    grammiPerAlimento: base.grammiPerAlimento,
    rapportoVegetale: calcolo.rapporto,
    calcioDaAggiungere: calcolo.calcioDaAggiungere
  };
}

function generaDietaAutomaticaSettimanale() {
  const base = preparaDatiDietaAutomatica();
  if (!base) return;

  const giorniGenerati = giorniSettimana.map((giorno, index) =>
    creaGiornoDietaAutomatica(giorno, index, base)
  );

  setDietaAutomatica({
    tipo: "settimanale",
    pesoDisponibile: base.pesoDisponibile,
    pesoTotale: base.pesoTotale,
    quantitaTotale: base.quantitaTotale,
    giorni: giorniGenerati
  });
}

function generaDietaAutomaticaGiornaliera() {
  const base = preparaDatiDietaAutomatica();
  if (!base) return;

  const dataScelta =
    dataDietaAutomaticaGiornaliera || new Date().toISOString().split("T")[0];
  const giornoIndex = (new Date(dataScelta).getDay() + 6) % 7;
  const giorno = giorniSettimana[giornoIndex] || giorniSettimana[0];
  const giornoGenerato = creaGiornoDietaAutomatica(giorno, giornoIndex, base);

  setDataDietaAutomaticaGiornaliera(dataScelta);
  setDietaAutomatica({
    tipo: "giornaliera",
    data: dataScelta,
    pesoDisponibile: base.pesoDisponibile,
    pesoTotale: base.pesoTotale,
    quantitaTotale: base.quantitaTotale,
    giorni: [giornoGenerato]
  });
}
const listaSpesaDietaAutomatica = useMemo(() => {
  if (!dietaAutomatica) return [];

  const totale = {};

  const aggiungi = (alimento, quantita) => {
    if (!alimento) return;

    const nome = alimento.Nome;

    if (!totale[nome]) {
      totale[nome] = {
        nome,
        quantita: 0,
        unita: "g"
      };
    }

    totale[nome].quantita += Number(quantita || 0);
  };

  dietaAutomatica.giorni.forEach((giorno) => {
    [...giorno.frutti, ...giorno.verdure].forEach((alimento) => {
      aggiungi(alimento, giorno.grammiPerAlimento);
    });
  });

  return Object.values(totale).sort((a, b) => a.nome.localeCompare(b.nome));
}, [dietaAutomatica]);
function apriWhatsAppListaSpesaAutomatica() {
  if (listaSpesaDietaAutomatica.length === 0) {
    alert("Genera prima una dieta automatica.");
    return;
  }

  const righe = listaSpesaDietaAutomatica.map(
  (item) => `- ${item.nome} (circa ${Number(item.quantita).toFixed(0)} ${item.unita} previsti)`
);

  const testo = [
    "Lista spesa Pesauro - dieta automatica",
    "",
    ...righe
  ].join("\n");

  const url = `https://wa.me/?text=${encodeURIComponent(testo)}`;
  window.open(url, "_blank");
}

async function salvaDietaAutomaticaSettimanale() {
  if (!dietaAutomatica) {
    alert("Genera prima una dieta automatica.");
    return;
  }

  const userId = await getUserIdCorrente();

  if (!userId) {
    alert("Devi effettuare l'accesso per salvare una dieta automatica.");
    return;
  }

  const nomeSettimana =
    nomeDietaAutomatica.trim() ||
    `Dieta automatica ${new Date().toLocaleDateString("it-IT")}`;

  const { data, error } = await supabase
    .from("settimane_dieta")
    .insert([
      {
        nome: nomeSettimana,
        user_id: userId
      }
    ])
    .select()
    .single();

  if (error) {
    alert("Errore salvataggio settimana: " + error.message);
    return;
  }

  const records = dietaAutomatica.giorni.flatMap((giorno, index) => {
    const giornoNumero = index + 1;
    const giornoNome = giorno.giorno;

    const grammiVegetaleDaSalvare =
      modalita === "colonia" && coloniaId
        ? Number(giorno.grammiPerAlimento || 0) / Number(giorno.numeroPetauri || 1)
        : Number(giorno.grammiPerAlimento || 0);

    const vegetali = [...giorno.frutti, ...giorno.verdure].map((alimento) => ({
      settimana_id: data.id,
      giornoNome,
      giornoNumero,
      alimentoId: Number(alimento.id),
      grammi: grammiVegetaleDaSalvare,
      user_id: userId
    }));

    const insetto = {
      settimana_id: data.id,
      giornoNome,
      giornoNumero,
      alimentoId: Number(giorno.insetto.id),
      grammi: Number(giorno.doseInsettoSingola || 0),
      user_id: userId
    };

    const integratori = giorno.integratori.map((integratore) => ({
      settimana_id: data.id,
      giornoNome,
      giornoNumero,
      alimentoId: Number(integratore.id),
      grammi: 0,
      user_id: userId
    }));

    return [...vegetali, insetto, ...integratori];
  });

  const errorGiorni = await inserisciGiorniSettimana(records);

  if (errorGiorni) {
    alert("Errore salvataggio giorni: " + errorGiorni.message);
    return;
  }

  alert("Dieta automatica salvata nelle settimane alimentari.");
  setNomeDietaAutomatica("");
  await loadSettimane();
  await loadGiorniDB();
}
async function salvaDietaAutomaticaGiornaliera() {
  if (!dietaAutomatica || dietaAutomatica.tipo !== "giornaliera") {
    alert("Genera prima una dieta automatica giornaliera.");
    return;
  }

  if (!dataDietaAutomaticaGiornaliera) {
    alert("Seleziona la data della dieta giornaliera.");
    return;
  }

  const userId = await getUserIdCorrente();

  if (!userId) {
    alert("Devi effettuare l'accesso per salvare una dieta automatica.");
    return;
  }

  if (modalita === "petauro" && !petauroId) {
    alert("Per salvare la dieta giornaliera nello storico devi selezionare un petauro.");
    return;
  }

  if (modalita === "colonia" && !coloniaId) {
    alert("Per salvare la dieta giornaliera nello storico devi selezionare una colonia.");
    return;
  }

  const giorno = dietaAutomatica.giorni[0];
  if (!giorno) {
    alert("Dieta giornaliera non disponibile.");
    return;
  }

  const vegetali = [...giorno.frutti, ...giorno.verdure].map((alimento) => ({
    alimento,
    grammi:
      modalita === "colonia"
        ? Number(giorno.grammiPerAlimento || 0) / Number(giorno.numeroPetauri || 1)
        : Number(giorno.grammiPerAlimento || 0)
  }));

  const elementi = [
    ...vegetali,
    {
      alimento: giorno.insetto,
      grammi: Number(giorno.doseInsettoSingola || 0)
    },
    ...giorno.integratori.map((integratore) => ({
      alimento: integratore,
      grammi: 0
    }))
  ];

  let records = [];

  if (modalita === "petauro") {
    records = elementi.map((item) => ({
      petauro_id: Number(petauroId),
      colonia_id: null,
      alimento_id: Number(item.alimento.id),
      grammi: Number(item.grammi || 0),
      data: dataDietaAutomaticaGiornaliera,
      user_id: userId
    }));
  }

  if (modalita === "colonia") {
    if (membriColonia.length === 0) {
      alert("La colonia selezionata non ha petauri collegati.");
      return;
    }

    records = membriColonia.flatMap((petauro) =>
      elementi.map((item) => ({
        petauro_id: Number(petauro.id),
        colonia_id: Number(coloniaId),
        alimento_id: Number(item.alimento.id),
        grammi: Number(item.grammi || 0),
        data: dataDietaAutomaticaGiornaliera,
        user_id: userId
      }))
    );
  }

  if (records.length === 0) {
    alert("Nessuna dieta da salvare.");
    return;
  }

  const { error } = await supabase.from("diete").insert(records);

  if (error) {
    alert("Errore salvataggio dieta giornaliera: " + error.message);
    return;
  }

  alert("Dieta automatica giornaliera salvata nello storico.");
  await loadDiete();
}
const calcioSenzaD3 = alimenti.find((a) => {
  const nome = String(a.Nome || "").toLowerCase();
  return nome.includes("calcio") && nome.includes("d3");
});

const linkCalcioSenzaD3 = linkAcquistoAlimento(calcioSenzaD3);
const prodottoPolline = alimenti.find((a) =>
  String(a.Nome || "").toLowerCase().includes("polline")
);

const prodottoGommaArabica = alimenti.find((a) => {
  const nome = String(a.Nome || "").toLowerCase();
  return nome.includes("gomma") || nome.includes("arabica");
});

const prodottoLori = alimenti.find((a) =>
  String(a.Nome || "").toLowerCase().includes("lori")
);

const prodottiUtili = [
  {
    categoria: "Integratori",
    nome: "Calcio senza D3",
    descrizione: "Utile per correggere il rapporto calcio/fosforo quando la dieta lo richiede.",
    link: linkCalcioSenzaD3
  },
  {
    categoria: "Integratori",
    nome: "Polline",
    descrizione: "Integrazione settimanale utile come complemento nutrizionale.",
    link: linkAcquistoAlimento(prodottoPolline)
  },
  {
    categoria: "Integratori",
    nome: "Gomma arabica",
    descrizione: "Aiuta la digestione e riproduce un elemento presente nella dieta naturale.",
    link: linkAcquistoAlimento(prodottoGommaArabica)
  },
  {
    categoria: "Integratori",
    nome: "Lori",
    descrizione: "Complemento da usare secondo frequenza ENAPI.",
    link: linkAcquistoAlimento(prodottoLori)
  },
  {
    categoria: "Pesatura",
    nome: "Bilancia di precisione",
    descrizione: "Consigliata per monitorare il peso dei petauri e aggiornare correttamente la dieta.",
    link: ""
  },
  {
    categoria: "Gestione quotidiana",
    nome: "Ciotole basse e lavabili",
    descrizione: "Utili per servire alimenti freschi e integratori in modo ordinato.",
    link: ""
  }
];
const alimentoSelezionato = getAlimento(alimentoId);
function toggleStepDietauro(step) {
  setStepDietauroAperto((stepAttuale) =>
    stepAttuale === step ? "" : step
  );
}
function HomeIcon({ tipo }) {
  if (tipo === "dietauro") {
    return (
      <div style={homeIconStyle}>
        <svg viewBox="0 0 160 160" style={homeSvgStyle}>
          <defs>
            <radialGradient id="dietBg" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#f8f1dc" />
              <stop offset="100%" stopColor="#dfe8c9" />
            </radialGradient>
            <linearGradient id="bowl" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#8fa36a" />
              <stop offset="100%" stopColor="#315c37" />
            </linearGradient>
            <linearGradient id="leaf" x1="0" x2="1">
              <stop offset="0%" stopColor="#9fb77a" />
              <stop offset="100%" stopColor="#365f37" />
            </linearGradient>
            <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#234b2d" floodOpacity="0.22" />
            </filter>
          </defs>

          <circle cx="80" cy="80" r="66" fill="url(#dietBg)" />

          <g filter="url(#softShadow)">
            <path
              d="M38 82c5 30 23 47 43 47s38-17 43-47H38z"
              fill="url(#bowl)"
              stroke="#234b2d"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <path
              d="M43 82h76"
              stroke="#17351f"
              strokeWidth="6"
              strokeLinecap="round"
            />

            <path
              d="M66 69c-20-14-25-34-9-51 18 9 23 30 9 51z"
              fill="url(#leaf)"
              stroke="#234b2d"
              strokeWidth="4"
            />
            <path
              d="M86 70c8-25 28-34 49-22-11 22-31 31-49 22z"
              fill="#91a85f"
              stroke="#234b2d"
              strokeWidth="4"
            />
            <path
              d="M55 78c-18-7-25-20-19-34 17 2 27 16 19 34z"
              fill="#6f8b50"
              stroke="#234b2d"
              strokeWidth="4"
            />

            <circle cx="77" cy="76" r="13" fill="#c47a3a" stroke="#8b5e34" strokeWidth="4" />
            <circle cx="98" cy="78" r="10" fill="#d9a94a" stroke="#8b5e34" strokeWidth="3" />
          </g>
        </svg>
      </div>
    );
  }

  if (tipo === "pesauro") {
    return (
      <div style={homeIconStyle}>
        <svg viewBox="0 0 160 160" style={homeSvgStyle}>
          <defs>
            <radialGradient id="pesoBg" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#f8f1dc" />
              <stop offset="100%" stopColor="#dfe8c9" />
            </radialGradient>
            <linearGradient id="scaleGreen" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#9caf72" />
              <stop offset="100%" stopColor="#315c37" />
            </linearGradient>
            <filter id="scaleShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="8" stdDeviation="5" floodColor="#234b2d" floodOpacity="0.24" />
            </filter>
          </defs>

          <circle cx="80" cy="80" r="66" fill="url(#pesoBg)" />

          <g filter="url(#scaleShadow)">
            <rect x="45" y="34" width="70" height="18" rx="9" fill="#6f7f3f" stroke="#234b2d" strokeWidth="5" />
            <rect x="59" y="50" width="42" height="19" rx="7" fill="#8fa36a" stroke="#234b2d" strokeWidth="4" />

            <path
              d="M43 75c0-10 8-18 18-18h38c10 0 18 8 18 18v35c0 10-8 18-18 18H61c-10 0-18-8-18-18V75z"
              fill="url(#scaleGreen)"
              stroke="#234b2d"
              strokeWidth="5"
            />

            <circle cx="80" cy="93" r="27" fill="#fffaf0" stroke="#17351f" strokeWidth="5" />
            <path d="M80 93l15-17" stroke="#234b2d" strokeWidth="5" strokeLinecap="round" />
            <circle cx="80" cy="93" r="5" fill="#234b2d" />

            <path d="M61 128h38" stroke="#8b5e34" strokeWidth="8" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div style={homeIconStyle}>
      <svg viewBox="0 0 160 160" style={homeSvgStyle}>
        <defs>
          <radialGradient id="bookBg" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#f8f1dc" />
            <stop offset="100%" stopColor="#dfe8c9" />
          </radialGradient>
          <filter id="bookShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="5" floodColor="#234b2d" floodOpacity="0.22" />
          </filter>
        </defs>

        <circle cx="80" cy="80" r="66" fill="url(#bookBg)" />

        <g filter="url(#bookShadow)">
          <path
            d="M36 44c19-7 34-2 44 11v74c-11-11-26-15-44-9V44z"
            fill="#fffaf0"
            stroke="#234b2d"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path
            d="M124 44c-19-7-34-2-44 11v74c11-11 26-15 44-9V44z"
            fill="#f2ead6"
            stroke="#234b2d"
            strokeWidth="5"
            strokeLinejoin="round"
          />

          <path d="M53 64h16M53 78h16M53 92h13" stroke="#8b5e34" strokeWidth="4" strokeLinecap="round" />
          <path d="M92 64h16M92 78h16M94 92h12" stroke="#8b5e34" strokeWidth="4" strokeLinecap="round" />

          <path
            d="M91 118c10-24 30-29 46-14-14 17-32 22-46 14z"
            fill="#8fa36a"
            stroke="#234b2d"
            strokeWidth="4"
          />
          <path
            d="M70 122c-8-18-22-23-37-13 10 16 25 21 37 13z"
            fill="#9caf72"
            stroke="#234b2d"
            strokeWidth="4"
          />
        </g>
      </svg>
    </div>
  );
}
  return (
    <div style={pageStyle}>
     <header style={heroHeaderStyle}>
  <img
    src="/logo.jpg"
    alt="Logo Pesauro ENAPI"
    style={logoStyle}
  />

  <div>
    <h1 style={heroTitleStyle}>Pesauro ENAPI</h1>
    <p style={heroSubtitleStyle}>
      Gestionale per dieta, pesi e benessere del petauro dello zucchero
    </p>
  </div>
</header>
<div style={accessCardStyle}>
<div style={sectionTitleStyle}>
  <div style={accessHeaderIconStyle}>🔐</div>
  <h2>Accesso</h2>
  <p>Entra nel tuo spazio personale Pesauro ENAPI.</p>
</div>  
  {authUser ? (
    <div style={miniPanelStyle}>
      <strong>Accesso effettuato</strong>
      <span>{authUser.email}</span>

      {isAdmin && (
        <span style={adminBadgeStyle}>
          Admin
        </span>
      )}

      <button onClick={logoutUtente} style={redButton}>
        Esci
      </button>
    </div>
  ) : (
    <div style={miniPanelStyle}>
      <div style={authTabsStyle}>
        <button
          type="button"
          onClick={() => setAuthModalita("login")}
          style={authModalita === "login" ? authTabActiveStyle : authTabStyle}
        >
          Accedi
        </button>

        <button
          type="button"
          onClick={() => setAuthModalita("registrazione")}
          style={authModalita === "registrazione" ? authTabActiveStyle : authTabStyle}
        >
          Registrati
        </button>

        <button
          type="button"
          onClick={() => setAuthModalita("recupero")}
          style={authModalita === "recupero" ? authTabActiveStyle : authTabStyle}
        >
          Password dimenticata
        </button>
      </div>

      <input
        type="email"
        placeholder="Email"
        value={loginEmail}
        onChange={(e) => setLoginEmail(e.target.value)}
        style={inputStyle}
      />

      {authModalita !== "recupero" && (
        <input
          type="password"
          placeholder="Password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          style={inputStyle}
        />
      )}

      {authModalita === "login" && (
        <button onClick={loginUtente} style={greenButton}>
          Accedi
        </button>
      )}

      {authModalita === "registrazione" && (
        <button onClick={registraUtente} style={greenButton}>
          Crea account
        </button>
      )}

      {authModalita === "recupero" && (
        <button onClick={recuperaPassword} style={greenButton}>
          Invia email recupero password
        </button>
      )}
    </div>
  )}

  {authMessaggio && (
    <div style={infoBoxStyle}>
      {authMessaggio}
    </div>
  )}
</div>

{authUser && sezioneAttiva === "home" && (
  <div style={cardStyle}>
    <div style={sectionTitleStyle}>
      <h2>🌿 Cosa vuoi fare?</h2>
      <p>Scegli la sezione dell'app che vuoi utilizzare.</p>
    </div>

   <div style={homeGridStyle}>
  <div style={homeCardStyle} onClick={() => setSezioneAttiva("dietauro")}>
    <img
  src="/icons/icon-dietauro.png"
  alt="Dietauro"
  style={homeImageIconStyle}
/>

    <div style={homeTitleStyle}>Dietauro</div>

    <div style={homeTextStyle}>
      Crea e verifica diete bilanciate secondo lo standard ENAPI.
    </div>

    <div style={homeActionStyle}>
      Inizia <span>›</span>
    </div>
  </div>

  <div style={homeCardStyle} onClick={() => setSezioneAttiva("pesauro")}>
    <img
  src="/icons/icon-pesauro.png"
  alt="Pesauro"
  style={homeImageIconStyle}
/>

    <div style={homeTitleStyle}>Pesauro</div>

    <div style={homeTextStyle}>
      Monitora i pesi, controlla l'andamento e il benessere.
    </div>

    <div style={homeActionStyle}>
      Inizia <span>›</span>
    </div>
  </div>

  <div style={homeCardStyle} onClick={() => setSezioneAttiva("risorse")}>
    <img
  src="/icons/icon-risorse.png"
  alt="Risorse ENAPI"
  style={homeImageIconStyle}
/>

    <div style={homeTitleStyle}>Risorse ENAPI</div>

    <div style={homeTextStyle}>
      Linee guida, articoli, tabelle e materiali educativi.
    </div>

    <div style={homeActionStyle}>
      Esplora <span>›</span>
    </div>
  </div>
</div>
  </div>
)}

{authUser && sezioneAttiva !== "home" && (
  <>
    <button
      type="button"
      onClick={() => setSezioneAttiva("home")}
      style={backHomeButtonStyle}
    >
      ← Torna alla schermata principale
    </button>

{sezioneAttiva === "pesauro" && (
  <>

{alertPeso.length > 0 && (
  <div style={alertCard}>
    <h2>🚨 Alert peso</h2>

    {alertPeso.map((alert, index) => (
      <div
        key={index}
        style={{
          ...alertItemStyle,
          backgroundColor:
            alert.livello === "danger" ? "#ffebee" : "#fff8e1",
          color:
            alert.livello === "danger" ? "#b00020" : "#f57f17",
          borderColor:
            alert.livello === "danger" ? "#ef9a9a" : "#eadb9c"
        }}
      >
        {alert.livello === "danger" ? "🚨" : "⚠️"} {alert.testo}
      </div>
    ))}
  </div>
)}

      <div style={cardStyle}>
  <div style={sectionTitleStyle}>
    <h2>⚖️ Pesauro - petauri e pesi</h2>
    <p>Gestisci petauri, colonie e pesate. I pesi salvati vengono usati anche per il calcolo della dieta al 30%.</p>
  </div>

  <div style={formGridStyle}>
    <div style={miniPanelStyle}>
      <h3>Modalità dieta</h3>

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

      {petauroSelezionatoInfo && (
        <div style={summaryBoxStyle}>
          <strong>{petauroSelezionatoInfo.nome}</strong>
          <span>
            Ultimo peso:{" "}
            {petauroSelezionatoInfo.pesoAttuale
              ? `${petauroSelezionatoInfo.pesoAttuale} g`
              : "non disponibile"}
          </span>
          {petauroSelezionatoInfo.dataUltimoPeso && (
            <span>Data: {petauroSelezionatoInfo.dataUltimoPeso}</span>
          )}
        </div>
      )}
    </div>

    <div style={miniPanelStyle}>
      <h3>Aggiungi colonia</h3>
      <input
        type="text"
        placeholder="Nome colonia"
        value={nomeColonia}
        onChange={(e) => setNomeColonia(e.target.value)}
        style={inputStyle}
      />
      <button onClick={aggiungiColonia} style={greenButton}>Salva colonia</button>
    </div>

    <div style={miniPanelStyle}>
      <h3>Aggiungi petauro</h3>
      <input
        type="text"
        placeholder="Nome petauro"
        value={nomePetauro}
        onChange={(e) => setNomePetauro(e.target.value)}
        style={inputStyle}
      />
      <button onClick={aggiungiPetauro} style={greenButton}>Salva petauro</button>
    </div>

    <div style={miniPanelStyle}>
      <h3>Inserisci peso</h3>
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
      <button onClick={salvaPeso} style={greenButton}>Salva peso</button>
    </div>
  </div>

  <h3>I miei petauri</h3>

  {petauriRiepilogo.length === 0 && (
    <p>Nessun petauro registrato.</p>
  )}

  <div style={petauroGridStyle}>
    {petauriRiepilogo.map((petauro) => (
      <button
        key={petauro.id}
        type="button"
       onClick={() => apriSchedaPetauro(petauro.id)}
        style={{
          ...petauroCardStyle,
          border:
            String(petauroId) === String(petauro.id)
              ? "2px solid #234b2d"
              : "1px solid #d8ddcf"
        }}
      >
      {petauro.foto ? (
  <img
    src={petauro.foto}
    alt={petauro.nome}
    style={petauroPhotoStyle}
  />
) : (
  <div style={petauroPhotoPlaceholderStyle}>
    🐿️
  </div>
)}

<strong>{petauro.nome}</strong>

<span>{petauro.colonia}</span>

{petauro.sesso && <span>Sesso: {petauro.sesso}</span>}

<span>
  ⚖️{" "}
  {petauro.pesoAttuale
    ? `${petauro.pesoAttuale} g`
    : "peso non disponibile"}
</span>

{petauro.dataUltimoPeso && (
  <span>Ultima pesata: {petauro.dataUltimoPeso}</span>
)}


        {petauro.differenza !== null && (
          <span
            style={{
              color:
                petauro.differenza < -5
                  ? "#b00020"
                  : petauro.differenza > 5
                  ? "#f57f17"
                  : "#2e7d32",
              fontWeight: "bold"
            }}
          >
            {petauro.differenza > 0 ? "+" : ""}
            {petauro.differenza} g dall'ultima pesata
          </span>
        )}
      </button>
    ))}
  </div>

  {petauroId && datiGrafico.length > 0 && (
    <div style={chartPanelStyle}>
      <h3>📈 Andamento peso</h3>
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
    <div style={chartPanelStyle}>
      <h3>Colonia {coloniaSelezionata?.Nome}</h3>
      <p>Totale petauri: {membriColonia.length}</p>
<button onClick={() => apriSchedaColonia(coloniaId)} style={greenButton}>
  Apri scheda colonia
</button>
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
</div>
      <div style={cardStyle}>
 </div>

{petauroSchedaId && petauroEdit && (
  <div style={overlayStyle}>
    <div style={modalStyle}>
      <button onClick={chiudiSchedaPetauro} style={closeButtonStyle}>
        ✕
      </button>

      <h2 style={modalTitleStyle}>Scheda petauro</h2>

      {petauroEdit.Foto ? (
        <img
          src={petauroEdit.Foto}
          alt={petauroEdit.Nome}
          style={modalImageStyle}
        />
      ) : (
        <div style={modalImagePlaceholderStyle}>🐿️</div>
      )}

      <input
        type="text"
        placeholder="Nome"
        value={petauroEdit.Nome}
        onChange={(e) => aggiornaPetauroEdit("Nome", e.target.value)}
        style={inputStyle}
      />

      <div style={miniPanelStyle}>
        <h3>Foto petauro</h3>

        <input
          type="file"
          accept="image/*"
          disabled={fotoPetauroCaricamento}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) await caricaFotoPetauro(file);
            e.target.value = "";
          }}
          style={inputStyle}
        />

        {fotoPetauroCaricamento && (
          <span>Caricamento foto in corso...</span>
        )}
      </div>

      <select
        value={petauroEdit.Sesso}
        onChange={(e) => aggiornaPetauroEdit("Sesso", e.target.value)}
        style={inputStyle}
      >
        <option value="">Sesso non indicato</option>
        <option value="Maschio">Maschio</option>
        <option value="Femmina">Femmina</option>
      </select>

      <input
        type="text"
        placeholder="Data di nascita"
        value={petauroEdit.DataNascita}
        onChange={(e) => aggiornaPetauroEdit("DataNascita", e.target.value)}
        style={inputStyle}
      />

      <input
        type="number"
        placeholder="Peso indicativo"
        value={petauroEdit.Peso}
        onChange={(e) => aggiornaPetauroEdit("Peso", e.target.value)}
        style={inputStyle}
      />

      <select
        value={petauroEdit.colonia_id}
        onChange={(e) => aggiornaPetauroEdit("colonia_id", e.target.value)}
        style={inputStyle}
      >
        <option value="">Nessuna colonia collegata</option>
        {colonie.map((colonia) => (
          <option key={colonia.id} value={colonia.id}>
            {nomeColoniaDisplay(colonia)}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Colonia testuale"
        value={petauroEdit.Colonia}
        onChange={(e) => aggiornaPetauroEdit("Colonia", e.target.value)}
        style={inputStyle}
      />

      <select
        value={petauroEdit.Castrato}
        onChange={(e) => aggiornaPetauroEdit("Castrato", e.target.value)}
        style={inputStyle}
      >
        <option value="">Castrazione non indicata</option>
        <option value="Si">Si</option>
        <option value="No">No</option>
        <option value="Non applicabile">Non applicabile</option>
      </select>

      <input
        type="text"
        placeholder="Stato"
        value={petauroEdit.Stato}
        onChange={(e) => aggiornaPetauroEdit("Stato", e.target.value)}
        style={inputStyle}
      />

      <input
        type="text"
        placeholder="Provenienza"
        value={petauroEdit.Provenienza}
        onChange={(e) => aggiornaPetauroEdit("Provenienza", e.target.value)}
        style={inputStyle}
      />

      <input
        type="text"
        placeholder="Veterinario"
        value={petauroEdit.Veterinario}
        onChange={(e) => aggiornaPetauroEdit("Veterinario", e.target.value)}
        style={inputStyle}
      />

      <textarea
       
       placeholder="Note"
        value={petauroEdit.Note}
        onChange={(e) => aggiornaPetauroEdit("Note", e.target.value)}
        style={{ ...inputStyle, minHeight: "90px" }}
      />
<div style={miniPanelStyle}>
  <h3>Documenti petauro</h3>

  <input
    type="text"
    placeholder="Nome documento"
    value={documentoNome}
    onChange={(e) => setDocumentoNome(e.target.value)}
    style={inputStyle}
  />

  <select
    value={documentoTipo}
    onChange={(e) => setDocumentoTipo(e.target.value)}
    style={inputStyle}
  >
    <option value="Veterinario">Veterinario</option>
    <option value="Cessione">Cessione</option>
    <option value="Adozione">Adozione</option>
    <option value="CITES">CITES</option>
    <option value="Passaporto">Passaporto</option>
    <option value="Altro">Altro</option>
  </select>

  <input
    type="file"
    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
    onChange={(e) => setDocumentoFile(e.target.files?.[0] || null)}
    style={inputStyle}
  />

  <button onClick={caricaDocumentoPetauro} style={greenButton}>
    Carica documento
  </button>

  {documentiPetauro.length === 0 ? (
    <div style={emptyBoxStyle}>
      Nessun documento caricato per questo petauro.
    </div>
  ) : (
    <div style={rowColumnStyle}>
      {documentiPetauro.map((documento) => (
        <div key={documento.id} style={documentRowStyle}>
          <div>
            <strong>{documento.nome}</strong>
            <span>
              {documento.tipo || "Documento"}{" "}
              {documento.created_at
                ? `- ${new Date(documento.created_at).toLocaleDateString("it-IT")}`
                : ""}
            </span>
          </div>

          <div style={documentActionsStyle}>
            <button
              type="button"
              onClick={() => apriDocumentoPetauro(documento)}
              style={smallGreenButton}
            >
              Apri
            </button>

            <button
              type="button"
              onClick={() => eliminaDocumentoPetauro(documento)}
              style={smallRedButton}
            >
              Elimina
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
<div style={miniPanelStyle}>
  <h3>Nuova pesata</h3>

  <input
    type="number"
    placeholder="Peso in grammi"
    value={pesoScheda}
    onChange={(e) => setPesoScheda(e.target.value)}
    style={inputStyle}
  />

  <input
    type="date"
    value={dataPesoScheda}
    onChange={(e) => setDataPesoScheda(e.target.value)}
    style={inputStyle}
  />

  <button onClick={salvaPesoDaScheda} style={greenButton}>
    Salva nuova pesata
  </button>
</div>
      <button onClick={salvaSchedaPetauro} style={greenButton}>
        Salva scheda petauro
      </button>

      <button
        onClick={() => {
          setModalita("petauro");
          setPetauroId(String(petauroSchedaId));
          chiudiSchedaPetauro();
        }}
        style={greenButton}
      >
        Usa questo petauro per la dieta
      </button>
    </div>
  </div>
)}
{coloniaSchedaId && coloniaScheda && (
  <div style={overlayStyle}>
    <div style={modalStyle}>
      <button onClick={chiudiSchedaColonia} style={closeButtonStyle}>
        ✕
      </button>

      <h2 style={modalTitleStyle}>
        Scheda colonia {nomeColoniaDisplay(coloniaScheda)}
      </h2>

      <div style={infoBoxStyle}>
        <h3 style={{ marginTop: 0 }}>Riepilogo colonia</h3>

        <p>
          Totale petauri:{" "}
          <strong>{riepilogoColoniaScheda.membri.length}</strong>
        </p>

        <p>
          Peso totale registrato:{" "}
          <strong>{riepilogoColoniaScheda.pesoTotale.toFixed(1)} g</strong>
        </p>

        {riepilogoColoniaScheda.petauriSenzaPeso.length > 0 && (
          <p style={{ marginBottom: 0 }}>
            Petauri senza peso:{" "}
            <strong>{riepilogoColoniaScheda.petauriSenzaPeso.join(", ")}</strong>
          </p>
        )}
      </div>
{datiGraficoColoniaScheda.length > 0 && (
  <div style={chartPanelStyle}>
    <h3>📈 Andamento peso colonia</h3>

    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={datiGraficoColoniaScheda}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="data" />
          <YAxis />
          <Tooltip />

          {riepilogoColoniaScheda.membri.map((petauro, index) => (
            <Line
              key={petauro.id}
              type="monotone"
              dataKey={petauro.nome}
              stroke={
                ["#234b2d", "#6f7f3f", "#8b5e34", "#b00020", "#4a6fa5"][
                  index % 5
                ]
              }
              strokeWidth={3}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
)}
      <div style={miniPanelStyle}>
        <h3>Membri colonia</h3>

        {riepilogoColoniaScheda.membri.length === 0 ? (
          <div style={emptyBoxStyle}>
            Nessun petauro collegato a questa colonia.
          </div>
        ) : (
          riepilogoColoniaScheda.membri.map((petauro) => (
            <div key={petauro.id} style={colonyMemberStyle}>
              <strong>{petauro.nome}</strong>

              {petauro.sesso && <span>Sesso: {petauro.sesso}</span>}

              <span>
                Peso:{" "}
                {petauro.pesoAttuale
                  ? `${petauro.pesoAttuale} g`
                  : "non disponibile"}
              </span>

              {petauro.dataUltimoPeso && (
                <span>Ultima pesata: {petauro.dataUltimoPeso}</span>
              )}

              {petauro.differenza !== null && (
                <span
                  style={{
                    color:
                      petauro.differenza <= -5
                        ? "#b00020"
                        : petauro.differenza >= 5
                        ? "#f57f17"
                        : "#2e7d32",
                    fontWeight: "bold"
                  }}
                >
                  {petauro.differenza > 0 ? "+" : ""}
                  {petauro.differenza} g dall'ultima pesata
                </span>
              )}
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => {
          setModalita("colonia");
          setColoniaId(String(coloniaSchedaId));
          chiudiSchedaColonia();
        }}
        style={greenButton}
      >
        Usa questa colonia per la dieta
      </button>
    </div>
  </div>
)}
  </>
)}

{sezioneAttiva === "dietauro" && (
  <>

<div style={dietauroStepStyle}>
  <button
    type="button"
    onClick={() => toggleStepDietauro("destinatario")}
    style={dietauroStepHeaderStyle}
  >
    <span>
      1. Per chi prepari la dieta?
      <br />
      <span style={dietauroStepSummaryStyle}>
        {modalita === "petauro"
          ? petauroId
            ? `Petauro: ${nomePetauroDisplay(getPetauro(petauroId))}`
            : "Petauro singolo non selezionato"
          : coloniaId
          ? `Colonia: ${nomeColoniaDisplay(getColonia(coloniaId))}`
          : "Colonia non selezionata"}
      </span>
    </span>

    <span>
      {stepDietauroAperto === "destinatario" ? "▲" : "▼"}
    </span>
  </button>

  {stepDietauroAperto === "destinatario" && (
    <div style={dietauroStepBodyStyle}>
      <div style={sectionTitleStyle}>
        <h2>🍽️ Dietauro</h2>
        <p>Scegli se stai preparando la dieta per un singolo petauro o per una colonia.</p>
      </div>

      <div style={formGridStyle}>
    <div style={miniPanelStyle}>
      <h3>Modalità dieta</h3>

      <div style={authTabsStyle}>
        <button
          type="button"
          onClick={() => setModalita("petauro")}
          style={modalita === "petauro" ? authTabActiveStyle : authTabStyle}
        >
          🐿️ Petauro singolo
        </button>

        <button
          type="button"
          onClick={() => setModalita("colonia")}
          style={modalita === "colonia" ? authTabActiveStyle : authTabStyle}
        >
          👥 Colonia
        </button>
      </div>
    </div>

    {modalita === "petauro" ? (
      <div style={miniPanelStyle}>
        <h3>Seleziona petauro</h3>

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

        {petauroSelezionatoInfo && (
          <div style={summaryBoxStyle}>
            <strong>{petauroSelezionatoInfo.nome}</strong>
            <span>
              Ultimo peso:{" "}
              {petauroSelezionatoInfo.pesoAttuale
                ? `${petauroSelezionatoInfo.pesoAttuale} g`
                : "non disponibile"}
            </span>
            {petauroSelezionatoInfo.dataUltimoPeso && (
              <span>Data: {petauroSelezionatoInfo.dataUltimoPeso}</span>
            )}
          </div>
        )}
      </div>
    ) : (
      <div style={miniPanelStyle}>
        <h3>Seleziona colonia</h3>

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

        {coloniaId && (
          <div style={summaryBoxStyle}>
            <strong>{nomeColoniaDisplay(getColonia(coloniaId))}</strong>
            <span>Petauri collegati: {membriColonia.length}</span>
          </div>
        )}
      </div>
    )}
      </div>
    </div>
  )}
</div>

<div style={dietauroStepStyle}>
  <button
    type="button"
    onClick={() => toggleStepDietauro("costruisci")}
    style={dietauroStepHeaderStyle}
  >
    <span>
      2. Costruisci la dieta
      <br />
      <span style={dietauroStepSummaryStyle}>
        Scegli frutta, verdura, insetti e integratori
      </span>
    </span>

    <span>
      {stepDietauroAperto === "costruisci" ? "▲" : "▼"}
    </span>
  </button>

  {stepDietauroAperto === "costruisci" && (
    <div style={dietauroStepBodyStyle}>
      <h2>🍽️ Costruisci la dieta</h2> 

        {["Frutta", "Verdura", "Insetto", "Integratore", "Tossico"].map((categoria) => (
          <div key={categoria} style={{ marginBottom: "25px" }}>
            <h3>
              {categoria === "Frutta" && "🍎 Frutta"}
              {categoria === "Verdura" && "🥬 Verdura"}
              {categoria === "Insetto" && "🦗 Insetti"}
              {categoria === "Integratore" && "🧪 Integratori"}
            {categoria === "Tossico" && "☠️ Tossici / non consigliati"}
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
    minHeight: "125px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: "#ffffff",
    fontFamily: "inherit",
    overflow: "hidden"
  }}
>
  {a.FotoUrl ? (
    <img
      src={a.FotoUrl}
      alt={a.Nome}
      style={{
        width: "58px",
        height: "58px",
        objectFit: "cover",
        borderRadius: "50%",
        marginBottom: "6px",
        border: "1px solid #ddd"
      }}
    />
  ) : (
    <div
      style={{
        width: "58px",
        height: "58px",
        borderRadius: "50%",
        marginBottom: "6px",
        backgroundColor: "#eef1ea",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "26px"
      }}
    >
      {a.Categoria === "Frutta" && "🍎"}
      {a.Categoria === "Verdura" && "🥬"}
      {a.Categoria === "Insetto" && "🦗"}
      {a.Categoria === "Integratore" && "🧪"}
      {a.Categoria === "Tossico" && "☠️"}
{a.Categoria === "Tossico" && "☠️"}
    </div>
  )}

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
  )}
</div>

{alimentoId && alimentoSelezionato && (() => {        
  const isInsetto = alimentoSelezionato.Categoria === "Insetto";
  const isIntegratore = alimentoSelezionato.Categoria === "Integratore";
  const isTossico = alimentoSelezionato.Categoria === "Tossico";

  const membriColoniaDieta = petauri.filter((p) =>
    petauroAppartieneAColonia(p, coloniaId)
  );

  const numeroPetauri =
    modalita === "colonia"
      ? membriColoniaDieta.length || 1
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

  const iconaCategoria =
    alimentoSelezionato.Categoria === "Frutta"
      ? "🍎"
      : alimentoSelezionato.Categoria === "Verdura"
      ? "🥬"
      : alimentoSelezionato.Categoria === "Insetto"
      ? "🦗"
      : alimentoSelezionato.Categoria === "Integratore"
      ? "🧪"
      : alimentoSelezionato.Categoria === "Tossico"
      ? "☠️"
      : "🌿";

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={() => setAlimentoId("")} style={closeButtonStyle}>
          ✕
        </button>

        {alimentoSelezionato.FotoUrl ? (
          <img
            src={alimentoSelezionato.FotoUrl}
            alt={alimentoSelezionato.Nome}
            style={modalImageStyle}
          />
        ) : (
          <div style={modalImagePlaceholderStyle}>
            {iconaCategoria}
          </div>
        )}

        <div style={modalHeaderStyle}>
          <div>
            <h2 style={modalTitleStyle}>
              {iconaCategoria} {nomeAlimento(alimentoId)}
            </h2>

            <p style={modalCategoryStyle}>
              Categoria: <strong>{alimentoSelezionato.Categoria}</strong>
            </p>
          </div>
        </div>

        {isTossico && (
          <div style={dangerBoxStyle}>
            <h3 style={{ marginTop: 0 }}>☠️ Alimento non somministrabile</h3>
            <p style={{ marginBottom: 0 }}>
              Questo alimento è indicato come tossico, non adatto o da evitare.
              Non può essere aggiunto alla dieta.
            </p>
          </div>
        )}

        {!isInsetto && !isIntegratore && !isTossico && (() => {
          const valutazione = valutazioneAlimento(alimentoSelezionato);

          return (
            <div
              style={{
                ...infoBoxStyle,
                backgroundColor: valutazione.coloreSfondo,
                color: valutazione.coloreTesto
              }}
            >
              <h3 style={{ marginTop: 0 }}>
                {valutazione.icona} {valutazione.titolo}
              </h3>

              <p>
                Rapporto Ca:P:{" "}
                <strong>{rapportoAlimento(alimentoSelezionato)}:1</strong>
              </p>

              <p style={{ marginBottom: 0 }}>
                {valutazione.testo}
              </p>
            </div>
          );
        })()}

        {isInsetto && (
          <div style={infoBoxStyle}>
            <h3 style={{ marginTop: 0 }}>🦗 Dose ENAPI</h3>

            <p>
              Dose per petauro:{" "}
              <strong>
                {alimentoSelezionato.DoseConsigliata} {unitaMisura}
              </strong>
            </p>

            {modalita === "colonia" ? (
              <p style={{ marginBottom: 0 }}>
                Totale per colonia:{" "}
                <strong>
                  {totaleInsetti} {unitaMisura}
                </strong>{" "}
                per {numeroPetauri} petauri
              </p>
            ) : (
              <p style={{ marginBottom: 0 }}>
                Totale da somministrare:{" "}
                <strong>
                  {totaleInsetti} {unitaMisura}
                </strong>
              </p>
            )}
          </div>
        )}

        {isIntegratore && (
          <div style={infoBoxStyle}>
            <h3 style={{ marginTop: 0 }}>🧪 Posologia</h3>

            {alimentoSelezionato.Posologia ? (
              <p>
                <strong>{alimentoSelezionato.Posologia}</strong>
              </p>
            ) : (
              <p>Posologia non ancora inserita.</p>
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
                  <p style={{ marginBottom: 0 }}>
                    Totale indicativo per colonia:{" "}
                    <strong>
                      {totaleIntegratore} {unitaMisura}
                    </strong>{" "}
                    per {numeroPetauri} petauri
                  </p>
                )}
              </>
            )}
            {linkAcquistoAlimento(alimentoSelezionato) && (
  <div style={affiliateBoxStyle}>
    <button
      type="button"
      onClick={() => window.open(linkAcquistoAlimento(alimentoSelezionato), "_blank")}
      style={amazonButtonStyle}
    >
      Acquista su Amazon
    </button>

    <p style={{ margin: 0, fontSize: "12px" }}>
      In qualità di Affiliati Amazon possiamo ricevere una commissione dagli acquisti idonei,
      senza costi aggiuntivi per chi acquista. Le eventuali commissioni saranno utilizzate
      per sostenere le attività dell’associazione.
    </p>
  </div>
)}
          </div>
        )}

        {alimentoSelezionato.Note && (
          <div style={noteBoxStyle}>
            <h3 style={{ marginTop: 0 }}>📝 Note alimento</h3>
            <p style={{ marginBottom: 0 }}>{alimentoSelezionato.Note}</p>
          </div>
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

        {!isTossico && (
          <>
            <input
              type="date"
              value={dataDieta}
              onChange={(e) => setDataDieta(e.target.value)}
              style={inputStyle}
            />

            <button onClick={salvaDieta} style={greenButton}>
              ➕ Aggiungi alla dieta
            </button>
          </>
        )}
      </div>
    </div>
  );
})()}

<div style={dietauroStepStyle}>
  <button
    type="button"
    onClick={() => toggleStepDietauro("verifica")}
    style={dietauroStepHeaderStyle}
  >
    <span>
      3. Verifica Dieta ENAPI
      <br />
      <span style={dietauroStepSummaryStyle}>
        {verificaEnapi.punteggio}/100 -{" "}
        {verificaEnapi.insetti > 0 ? "Insetti presenti" : "Insetti assenti"} -{" "}
        Ca:P {calcoloDieta.rapportoVegetale.toFixed(2)}:1
      </span>
    </span>

    <span>
      {stepDietauroAperto === "verifica" ? "▲" : "▼"}
    </span>
  </button>

  {stepDietauroAperto === "verifica" && (
    <div style={dietauroStepBodyStyle}>
  <div style={sectionTitleStyle}>
    <h2>📋 Verifica Dieta ENAPI</h2>
    <p>Controllo rapido di varietà, insetti, calcio, quantità e integratori.</p>
  </div>

  <div style={verificaGridStyle}>
    <div style={verificaPanelStyle}>
      <h3>Varietà giornaliera</h3>

      <div style={verificaRowStyle}>
        <span>🍎 Frutti diversi</span>
        <strong>{verificaEnapi.frutti} {verificaEnapi.frutti >= 2 ? "✅" : "⚠️"}</strong>
      </div>

      <div style={verificaRowStyle}>
        <span>🥬 Verdure diverse</span>
        <strong>{verificaEnapi.verdure} {verificaEnapi.verdure >= 3 ? "✅" : "⚠️"}</strong>
      </div>

      <div style={verificaRowStyle}>
        <span>🦗 Insetti</span>
        <strong>
          {verificaEnapi.insetti > 0
            ? `${verificaEnapi.insetti} varietà ✅`
            : "Assenti ⚠️"}
        </strong>
      </div>

      <div style={verificaRowStyle}>
        <span>📊 Varietà totale</span>
        <strong>{verificaEnapi.varietaTotale}</strong>
      </div>

      {verificaEnapi.insetti === 0 && (
        <div style={dangerBoxStyle}>
          ⚠️ Attenzione: nella dieta non è stato inserito nessun insetto.
          Gli insetti vivi sono obbligatori nella dieta ENAPI.
        </div>
      )}
    </div>

    <div style={verificaPanelStyle}>
      <h3>Calcio e Ca:P</h3>

      <div style={verificaRowStyle}>
        <span>⚖️ Ca:P vegetale</span>
        <strong>{calcoloDieta.rapportoVegetale.toFixed(2)}:1</strong>
      </div>
{verificaEnapi.calcioTotale > 0 && linkCalcioSenzaD3 && (
  <div style={affiliateBoxStyle}>
    <button
      type="button"
      onClick={() => window.open(linkCalcioSenzaD3, "_blank")}
      style={amazonButtonStyle}
    >
      Acquista calcio senza D3
    </button>

    <p style={{ margin: 0, fontSize: "12px" }}>
      In qualità di Affiliati Amazon possiamo ricevere una commissione dagli acquisti idonei,
      senza costi aggiuntivi per chi acquista. Le eventuali commissioni saranno utilizzate
      per sostenere le attività dell’associazione.
    </p>
  </div>
)}
      <div style={verificaRowStyle}>
        <span>⚖️ Ca:P totale</span>
        <strong>{calcoloDieta.rapportoTotale.toFixed(2)}:1</strong>
      </div>

      <div style={verificaRowStyle}>
        <span>🧪 Calcio da aggiungere</span>
        <strong>{verificaEnapi.calcioTotale.toFixed(2)} mg</strong>
      </div>

      {modalita === "colonia" && (
        <div style={verificaRowStyle}>
          <span>👥 Calcio per petauro</span>
          <strong>{verificaEnapi.calcioPerPetauro.toFixed(2)} mg</strong>
        </div>
      )}
            <div
        style={{
          backgroundColor: dosePraticaCalcio.backgroundColor,
          border: `1px solid ${dosePraticaCalcio.borderColor}`,
          color: dosePraticaCalcio.color,
          borderRadius: "14px",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        }}
      >
        <strong>
          {dosePraticaCalcio.icona} Dose pratica ENAPI: {dosePraticaCalcio.dose}
        </strong>

        <span>
          {dosePraticaCalcio.titolo} - {dosePraticaCalcio.testo}
        </span>

        <span style={{ fontSize: "12px" }}>
          Indicazione calcolata sulla dieta selezionata in modalità{" "}
          {modalita === "colonia" ? "colonia" : "petauro singolo"}.
          Se restano molti avanzi, l'assunzione reale di calcio può essere inferiore.
        </span>
      </div>
    </div>

    <div style={verificaPanelStyle}>
      <h3>Quantità frutta + verdura</h3>

      {verificaEnapi.pesoDisponibile ? (
        <>
          <div style={verificaRowStyle}>
            <span>Peso considerato</span>
            <strong>{verificaEnapi.pesoTotale.toFixed(1)} g</strong>
          </div>

          <div style={verificaRowStyle}>
            <span>Razione 30%</span>
            <strong>{verificaEnapi.grammiConsigliati.toFixed(1)} g</strong>
          </div>

          <div style={verificaRowStyle}>
            <span>Inseriti</span>
            <strong>{verificaEnapi.grammiFruttaVerdura.toFixed(1)} g</strong>
          </div>

          {verificaEnapi.quantitaSufficiente ? (
            <div style={successBoxStyle}>
              ✅ Quantità sufficiente per il peso registrato.
            </div>
          ) : (
            <div style={warningBoxStyle}>
              ⚠️ Mancano circa{" "}
              {Math.abs(verificaEnapi.differenzaGrammi).toFixed(1)} g di frutta/verdura
              per raggiungere il 30% del peso corporeo.
            </div>
          )}
        </>
      ) : (
        <div style={warningBoxStyle}>
          ⚠️ Peso non disponibile: calcolo quantità non effettuato.
          La dieta può comunque essere salvata.
          {verificaEnapi.petauriSenzaPeso?.length > 0 &&
            ` Petauri senza peso: ${verificaEnapi.petauriSenzaPeso.join(", ")}.`}
        </div>
      )}
    </div>

    <div style={verificaPanelStyle}>
      <h3>Integratori</h3>

      <div style={verificaRowStyle}>
        <span>🌼 Polline</span>
        <strong>{verificaEnapi.pollineOk ? "OK ✅" : "Da controllare ⚠️"}</strong>
      </div>

      {!verificaEnapi.pollineOk && (
        <div style={warningBoxStyle}>
          ⚠️ Il polline non risulta inserito negli ultimi 7 giorni.
        </div>
      )}

      <div style={verificaRowStyle}>
        <span>🦜 Lori</span>
        <strong>{verificaEnapi.loriOk ? "OK ✅" : "Da controllare ⚠️"}</strong>
      </div>

      {!verificaEnapi.loriOk && (
        <div style={warningBoxStyle}>
          ⚠️ Lori non risulta inserito negli ultimi 7 giorni.
        </div>
      )}

      <div style={verificaRowStyle}>
        <span>🌳 Gomma arabica</span>
        <strong>{verificaEnapi.gommaOk ? "OK ✅" : "Da controllare ⚠️"}</strong>
      </div>

      {!verificaEnapi.gommaOk && (
        <div style={warningBoxStyle}>
          ⚠️ La gomma arabica non risulta inserita negli ultimi 10 giorni.
        </div>
      )}
    </div>
  </div>

  <div
    style={{
      ...scoreBoxStyle,
      backgroundColor:
        verificaEnapi.punteggio >= 90
          ? "#e8f5e9"
          : verificaEnapi.punteggio >= 60
          ? "#fff8e1"
          : "#ffebee",
      color:
        verificaEnapi.punteggio >= 90
          ? "#2e7d32"
          : verificaEnapi.punteggio >= 60
          ? "#f57f17"
          : "#b00020"
    }}
  >
    <span>⭐ Punteggio ENAPI</span>
    <strong>{verificaEnapi.punteggio}/100</strong>
</div>
    </div>
  )}
</div>

<div style={dietauroStepStyle}>
  <button
    type="button"
    onClick={() => toggleStepDietauro("automatica")}
    style={dietauroStepHeaderStyle}
  >
    <span>
      4. Dieta automatica e lista spesa
      <br />
      <span style={dietauroStepSummaryStyle}>
        Genera dieta giornaliera o settimanale e prepara la lista spesa
      </span>
    </span>

    <span>
      {stepDietauroAperto === "automatica" ? "▲" : "▼"}
    </span>
  </button>

  {stepDietauroAperto === "automatica" && (
    <div style={dietauroStepBodyStyle}>
  <div style={sectionTitleStyle}>
    <h2>✨ Dieta automatica</h2>
    <p>Genera una dieta per un solo giorno oppure un'anteprima di 7 giorni con 2 frutti, 3 verdure, insetti e integratori secondo frequenza.</p>
  </div>
  <div style={miniPanelStyle}>
    <h3>Per chi vuoi generare la dieta?</h3>

    <div style={authTabsStyle}>
      <button
        type="button"
        onClick={() => setModalita("petauro")}
        style={modalita === "petauro" ? authTabActiveStyle : authTabStyle}
      >
        🐿️ Petauro singolo
      </button>

      <button
        type="button"
        onClick={() => setModalita("colonia")}
        style={modalita === "colonia" ? authTabActiveStyle : authTabStyle}
      >
        👥 Colonia
      </button>
    </div>

    {modalita === "petauro" ? (
      <select
        value={petauroId}
        onChange={(e) => setPetauroId(e.target.value)}
        style={inputStyle}
      >
        <option value="">Nessun petauro selezionato - dieta indicativa</option>
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
        <option value="">Nessuna colonia selezionata - dieta indicativa</option>
        {colonie.map((c) => (
          <option key={c.id} value={c.id}>
            {nomeColoniaDisplay(c)}
          </option>
        ))}
      </select>
    )}

    <div style={infoBoxStyle}>
      {modalita === "petauro" && petauroId && (
        <>
          Dieta calcolata per:{" "}
          <strong>{nomePetauroDisplay(getPetauro(petauroId))}</strong>
        </>
      )}

      {modalita === "colonia" && coloniaId && (
        <>
          Dieta calcolata per la colonia:{" "}
          <strong>{nomeColoniaDisplay(getColonia(coloniaId))}</strong>
          <br />
          Petauri collegati: <strong>{membriColonia.length}</strong>
        </>
      )}

      {modalita === "petauro" && !petauroId && (
        <>
          Nessun petauro selezionato: puoi generare una dieta indicativa, ma per salvarla nello storico dovrai scegliere un petauro.
        </>
      )}

      {modalita === "colonia" && !coloniaId && (
        <>
          Nessuna colonia selezionata: puoi generare una dieta indicativa, ma per salvarla nello storico dovrai scegliere una colonia.
        </>
      )}
    </div>
  </div>
  <div style={miniPanelStyle}>
    <h3>Dieta giornaliera</h3>

    <input
      type="date"
      value={dataDietaAutomaticaGiornaliera}
      onChange={(e) => setDataDietaAutomaticaGiornaliera(e.target.value)}
      style={inputStyle}
    />

    <button onClick={generaDietaAutomaticaGiornaliera} style={greenButton}>
      Genera dieta giornaliera
    </button>
  </div>

  <button onClick={generaDietaAutomaticaSettimanale} style={greenButton}>
    Genera dieta settimanale
  </button>

  {dietaAutomatica && (
    <div style={autoDietBoxStyle}>
      <div style={autoDietSummaryStyle}>
        <strong>
          Quantità frutta + verdura: {dietaAutomatica.quantitaTotale.toFixed(1)} g{" "}
          {dietaAutomatica.tipo === "giornaliera" ? "per il giorno" : "al giorno"}
        </strong>

        <span>
          {dietaAutomatica.pesoDisponibile
            ? `Calcolata sul 30% del peso registrato (${dietaAutomatica.pesoTotale.toFixed(1)} g).`
            : "Peso non disponibile: anteprima calcolata su quantità indicativa."}
        </span>
      </div>
      {dietaAutomatica.tipo === "giornaliera" ? (
        <div style={miniPanelStyle}>
          <h3>Salva dieta giornaliera</h3>

          <input
            type="date"
            value={dataDietaAutomaticaGiornaliera}
            onChange={(e) => setDataDietaAutomaticaGiornaliera(e.target.value)}
            style={inputStyle}
          />

          <button onClick={salvaDietaAutomaticaGiornaliera} style={greenButton}>
            Salva giornata nello storico
          </button>
        </div>
      ) : (
        <div style={miniPanelStyle}>
          <h3>Salva dieta automatica</h3>

          <input
            type="text"
            placeholder="Nome settimana automatica"
            value={nomeDietaAutomatica}
            onChange={(e) => setNomeDietaAutomatica(e.target.value)}
            style={inputStyle}
          />

          <button onClick={salvaDietaAutomaticaSettimanale} style={greenButton}>
            Salva settimana generata
          </button>
        </div>
      )}
      <div style={autoDietGridStyle}>
        {dietaAutomatica.giorni.map((giorno) => (
          <div key={giorno.giorno} style={autoDayCardStyle}>
            <h3>{giorno.giorno}</h3>

            {dietaAutomatica.tipo === "giornaliera" && dietaAutomatica.data && (
              <span style={dayPillStyle}>📅 {dietaAutomatica.data}</span>
            )}

            <span style={dayPillStyle}>
              🍎 {giorno.frutti.map((a) => a.Nome).join(", ")}
            </span>

            <span style={dayPillStyle}>
              🥬 {giorno.verdure.map((a) => a.Nome).join(", ")}
            </span>

           <span style={dayPillStyle}>
  🦗 {giorno.insetto.Nome} -{" "}
  {giorno.numeroPetauri > 1
    ? `${giorno.quantitaInsetti} ${giorno.unitaInsetti} totali (${giorno.doseInsettoSingola} ${giorno.unitaInsetti} per petauro)`
    : `${giorno.doseInsettoSingola} ${giorno.unitaInsetti}`}
</span>

            <span style={dayPillStyle}>
              🧪 {giorno.integratori.length > 0
                ? giorno.integratori.map((a) => a.Nome).join(", ")
                : "nessun integratore previsto"}
            </span>

            <div style={autoMetricStyle}>
              <span>Grammi per vegetale</span>
              <strong>{giorno.grammiPerAlimento} g</strong>
            </div>

            <div style={autoMetricStyle}>
              <span>Ca:P vegetale</span>
              <strong>{giorno.rapportoVegetale.toFixed(2)}:1</strong>
            </div>

           {(() => {
  const doseAutomatica = calcolaDosePraticaCalcio(
    giorno.rapportoVegetale,
    Number(giorno.grammiPerAlimento || 0) * 5
  );

  return (
    <div
      style={{
        backgroundColor: doseAutomatica.backgroundColor,
        border: `1px solid ${doseAutomatica.borderColor}`,
        color: doseAutomatica.color,
        borderRadius: "14px",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "6px"
      }}
    >
      <strong>
        {doseAutomatica.icona} Calcio: {doseAutomatica.dose}
      </strong>

      <span>
        {doseAutomatica.titolo} - {doseAutomatica.testo}
      </span>

      <span style={{ fontSize: "12px" }}>
        Ca:P vegetale: {giorno.rapportoVegetale.toFixed(2)}:1.
        Calcolo applicato alla dieta automatica generata.
      </span>
    </div>
  );
})()}
          </div>
        ))}
      </div>
    </div>
  )}

<div style={miniPanelStyle}>
  <h3>🛒 Lista spesa della dieta generata</h3>

  {listaSpesaDietaAutomatica.length === 0 ? (
    <div style={emptyBoxStyle}>
      Genera una dieta automatica per vedere la lista della spesa.
    </div>
  ) : (
    <div style={shoppingListStyle}>
      {listaSpesaDietaAutomatica.map((item) => (
        <div key={`${item.nome}-${item.unita}`} style={shoppingItemStyle}>
         <strong>{item.nome}</strong>
<span>
  circa {Number(item.quantita).toFixed(0)} {item.unita} previsti
</span>
        </div>
      ))}
    </div>
  )}
</div>

<button onClick={apriWhatsAppListaSpesaAutomatica} style={greenButton}>
  Invia lista spesa su WhatsApp
</button>
    </div>
  )}
</div>

<div style={dietauroStepStyle}>
  <button
    type="button"
    onClick={() => toggleStepDietauro("storico")}
    style={dietauroStepHeaderStyle}
  >
    <span>
      5. Settimane e storico
      <br />
      <span style={dietauroStepSummaryStyle}>
        {settimaneRiepilogo.length} settimane salvate - {dietePerData.length} diete nello storico
      </span>
    </span>

    <span>
      {stepDietauroAperto === "storico" ? "▲" : "▼"}
    </span>
  </button>

  {stepDietauroAperto === "storico" && (
  <div style={dietauroStepBodyStyle}>
      <div style={cardStyle}>
        <div style={sectionTitleStyle}>
          <h2>📅 Settimane salvate</h2> 
    <p>Qui trovi le settimane alimentari generate e salvate.</p>
  </div>

  {settimaneRiepilogo.length === 0 ? (
    <div style={emptyBoxStyle}>
      Nessuna settimana salvata.
    </div>
  ) : (
    <div style={weeksGridStyle}>
      {settimaneRiepilogo.map((settimana) => (
        <div key={settimana.id} style={weekCardStyle}>
         <div style={weekHeaderStyle}>
  <h3>📅 {settimana.Nome || settimana.nome}</h3>

  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <span>{settimana.giorni.length} giorni</span>

    <button
      type="button"
      onClick={() => eliminaSettimanaSalvata(settimana)}
      style={smallRedButton}
    >
      Elimina
    </button>
  </div>
</div>

          {settimana.giorni.length === 0 && (
            <p>Nessun alimento salvato in questa settimana.</p>
          )}
<button
  type="button"
  onClick={() => {
    setSettimanaApplicazioneAperta(String(settimana.id));
    setSettimanaDaApplicare(String(settimana.id));
    setDataInizioSettimana(new Date().toISOString().split("T")[0]);
  }}
  style={greenButton}
>
  Applica questa settimana
</button>

{settimanaApplicazioneAperta === String(settimana.id) && (
  <div style={replicaBoxStyle}>
    <p>
      Verrà applicata alla selezione attuale:{" "}
      <strong>{modalita === "colonia" ? "colonia" : "petauro"}</strong>
    </p>

    <input
      type="date"
      value={dataInizioSettimana}
      onChange={(e) => setDataInizioSettimana(e.target.value)}
      style={inputStyle}
    />

    <button onClick={applicaSettimana} style={greenButton}>
      Conferma applicazione
    </button>
  </div>
)}
          {settimana.giorni.map((giorno) => (
            <div key={`${settimana.id}-${giorno.nomeGiorno}`} style={daySummaryStyle}>
              <strong>{giorno.nomeGiorno}</strong>

              <div style={dayPillGridStyle}>
                <span style={dayPillStyle}>
                  🍎 {giorno.frutti.length > 0 ? giorno.frutti.join(", ") : "nessun frutto"}
                </span>

                <span style={dayPillStyle}>
                  🥬 {giorno.verdure.length > 0 ? giorno.verdure.join(", ") : "nessuna verdura"}
                </span>

                <span style={dayPillStyle}>
                  🦗 {giorno.insetti.length > 0 ? giorno.insetti.join(", ") : "insetti assenti"}
                </span>

                <span style={dayPillStyle}>
                  🧪 {giorno.integratori.length > 0
                    ? giorno.integratori.join(", ")
                    : "nessun integratore"}
                </span>
              </div>
             <div style={historyMetricGridStyle}>
  <div style={historyMetricStyle}>
    <span>Frutta + verdura</span>
    <strong>{giorno.grammiFruttaVerdura.toFixed(1)} g</strong>
  </div>

  <div style={historyMetricStyle}>
    <span>Ca:P vegetale</span>
    <strong>{giorno.rapportoVegetale.toFixed(2)}:1</strong>
  </div>

  <div style={historyMetricStyle}>
    <span>Calcio da aggiungere</span>
    <strong>{giorno.calcioDaAggiungere.toFixed(2)} mg</strong>
  </div>
</div> 
            </div>
          ))}
        </div>
      ))}
    </div>
  )}
</div>
  <div style={cardStyle}>
  <div style={sectionTitleStyle}>
    <h2>📅 Storico Diete</h2>
    {diete.length > 0 && (
  <button onClick={svuotaDiete} style={redButton}>
    Svuota tutte le diete salvate
  </button>
)}
    <p>Riepilogo delle diete salvate, con varietà, quantità, Ca:P e possibilità di replica.</p>
  </div>

  <div style={miniPanelStyle}>
    <h3>Filtra storico</h3>

    <div style={filterGridStyle}>
      <label style={filterFieldStyle}>
        <span>Da</span>
        <input
          type="date"
          value={storicoDataDa}
          onChange={(e) => setStoricoDataDa(e.target.value)}
          style={inputStyle}
        />
      </label>

      <label style={filterFieldStyle}>
        <span>A</span>
        <input
          type="date"
          value={storicoDataA}
          onChange={(e) => setStoricoDataA(e.target.value)}
          style={inputStyle}
        />
      </label>

      <label style={filterFieldStyle}>
        <span>Petauro</span>
        <select
          value={storicoPetauroId}
          onChange={(e) => setStoricoPetauroId(e.target.value)}
          style={inputStyle}
        >
          <option value="">Tutti i petauri</option>
          {petauri.map((petauro) => (
            <option key={petauro.id} value={petauro.id}>
              {nomePetauroDisplay(petauro)}
            </option>
          ))}
        </select>
      </label>

      <label style={filterFieldStyle}>
        <span>Colonia</span>
        <select
          value={storicoColoniaId}
          onChange={(e) => setStoricoColoniaId(e.target.value)}
          style={inputStyle}
        >
          <option value="">Tutte le colonie</option>
          {colonie.map((colonia) => (
            <option key={colonia.id} value={colonia.id}>
              {nomeColoniaDisplay(colonia)}
            </option>
          ))}
        </select>
      </label>

      <label style={filterFieldStyle}>
        <span>Categoria</span>
        <select
          value={storicoCategoria}
          onChange={(e) => setStoricoCategoria(e.target.value)}
          style={inputStyle}
        >
          <option value="">Tutte le categorie</option>
          <option value="Frutta">Frutta</option>
          <option value="Verdura">Verdura</option>
          <option value="Insetto">Insetto</option>
          <option value="Integratore">Integratore</option>
        </select>
      </label>
    </div>

    <div style={filterFooterStyle}>
      <span>
        Diete visualizzate: <strong>{dietePerData.length}</strong>
      </span>

      {filtriStoricoAttivi && (
        <button type="button" onClick={azzeraFiltriStorico} style={smallGreenButton}>
          Azzera filtri
        </button>
      )}
    </div>
  </div>

  {dietePerData.length === 0 ? (
    <div style={emptyBoxStyle}>
      {filtriStoricoAttivi
        ? "Nessuna dieta trovata con questi filtri."
        : "Nessuna dieta registrata."}
    </div>
  ) : (
    <div style={historyGridStyle}>
      {dietePerData.map((giorno) => (
        <div
          key={`${giorno.data}-${giorno.tipo}-${giorno.idRiferimento}`}
          style={historyCardStyle}
        >
          <div style={historyHeaderStyle}>
            <div>
              <h3>📅 {giorno.data}</h3>
              <p>
                {giorno.tipo === "colonia" ? "👥 Colonia:" : "🐿️ Petauro:"}{" "}
                <strong>{giorno.nomeSoggetto}</strong>
              </p>
            </div>
          </div>

          <div style={historyPillGridStyle}>
            <span style={historyPillStyle}>
              🍎 {giorno.frutti.length > 0 ? giorno.frutti.join(", ") : "nessun frutto"}
            </span>

            <span style={historyPillStyle}>
              🥬 {giorno.verdure.length > 0 ? giorno.verdure.join(", ") : "nessuna verdura"}
            </span>

            <span style={historyPillStyle}>
              🦗 {giorno.insetti.length > 0 ? giorno.insetti.join(", ") : "insetti assenti"}
            </span>

            <span style={historyPillStyle}>
              🧪 {giorno.integratori.length > 0
                ? giorno.integratori.join(", ")
                : "nessun integratore"}
            </span>
          </div>

          <div style={historyMetricGridStyle}>
            <div style={historyMetricStyle}>
              <span>Frutta + verdura</span>
              <strong>{giorno.grammiFruttaVerdura.toFixed(1)} g</strong>
            </div>

            <div style={historyMetricStyle}>
              <span>Ca:P vegetale</span>
              <strong>{giorno.rapportoVegetale.toFixed(2)}:1</strong>
            </div>

            <div style={historyMetricStyle}>
              <span>Calcio da aggiungere</span>
              <strong>{giorno.calcioDaAggiungere.toFixed(2)} mg</strong>
            </div>
          </div>

          <button
            onClick={() => {
              setGiornoReplicaAperto(
                `${giorno.data}-${giorno.tipo}-${giorno.idRiferimento}`
              );
              setDataReplica(new Date().toISOString().split("T")[0]);
            }}
            style={greenButton}
          >
            🔁 Replica questa dieta
          </button>
<button
  onClick={() => eliminaGiornataDieta(giorno)}
  style={redButton}
>
  Elimina questa dieta
</button>
          {giornoReplicaAperto ===
            `${giorno.data}-${giorno.tipo}-${giorno.idRiferimento}` && (
            <div style={replicaBoxStyle}>
              <p>Seleziona la nuova data:</p>

              <input
                type="date"
                value={dataReplica}
                onChange={(e) => setDataReplica(e.target.value)}
                style={inputStyle}
              />

              <button
                onClick={() => replicaGiornata(giorno, dataReplica)}
                style={greenButton}
              >
                ✅ Conferma replica
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )}
</div>
    </div>
  )}
</div>

  </>
)}

{sezioneAttiva === "risorse" && (
  <>
{isAdmin && ( 
<div style={cardStyle}>
  <div style={sectionTitleStyle}>
    <h2>⚙️ Admin alimenti</h2>
    <p>Modifica note, foto, valori nutrizionali, posologie e link acquisto.</p>
  </div>

  <select
    value={adminAlimentoId}
    onChange={(e) => apriAlimentoAdmin(e.target.value)}
    style={inputStyle}
  >
    <option value="">Seleziona alimento</option>
    {alimenti
      .slice()
      .sort((a, b) => String(a.Nome || "").localeCompare(String(b.Nome || "")))
      .map((alimento) => (
        <option key={alimento.id} value={alimento.id}>
          {alimento.Nome} - {alimento.Categoria}
        </option>
      ))}
  </select>

  {adminAlimentoEdit && (
    <div style={miniPanelStyle}>
      {adminAlimentoEdit.FotoUrl && (
        <img
          src={adminAlimentoEdit.FotoUrl}
          alt={adminAlimentoEdit.Nome}
          style={adminFoodImageStyle}
        />
      )}

      <input
        type="text"
        placeholder="Nome"
        value={adminAlimentoEdit.Nome}
        onChange={(e) => aggiornaAlimentoAdmin("Nome", e.target.value)}
        style={inputStyle}
      />

      <select
        value={adminAlimentoEdit.Categoria}
        onChange={(e) => aggiornaAlimentoAdmin("Categoria", e.target.value)}
        style={inputStyle}
      >
        <option value="">Categoria</option>
        <option value="Frutta">Frutta</option>
        <option value="Verdura">Verdura</option>
        <option value="Insetto">Insetto</option>
        <option value="Integratore">Integratore</option>
        <option value="Tossico">Tossico / non consigliato</option>
      </select>

      <input
        type="number"
        placeholder="Calcio"
        value={adminAlimentoEdit.Calcio}
        onChange={(e) => aggiornaAlimentoAdmin("Calcio", e.target.value)}
        style={inputStyle}
      />

      <input
        type="number"
        placeholder="Fosforo"
        value={adminAlimentoEdit.Fosforo}
        onChange={(e) => aggiornaAlimentoAdmin("Fosforo", e.target.value)}
        style={inputStyle}
      />

      <input
        type="text"
        placeholder="URL foto"
        value={adminAlimentoEdit.FotoUrl}
        onChange={(e) => aggiornaAlimentoAdmin("FotoUrl", e.target.value)}
        style={inputStyle}
      />

      <input
        type="text"
        placeholder="Link acquisto / Amazon"
        value={adminAlimentoEdit.link_acquisto}
        onChange={(e) => aggiornaAlimentoAdmin("link_acquisto", e.target.value)}
        style={inputStyle}
      />

      <input
        type="text"
        placeholder="Dose consigliata"
        value={adminAlimentoEdit.DoseConsigliata}
        onChange={(e) => aggiornaAlimentoAdmin("DoseConsigliata", e.target.value)}
        style={inputStyle}
      />

      <input
        type="text"
        placeholder="Unità misura"
        value={adminAlimentoEdit.UnitaMisura}
        onChange={(e) => aggiornaAlimentoAdmin("UnitaMisura", e.target.value)}
        style={inputStyle}
      />

      <textarea
        placeholder="Posologia"
        value={adminAlimentoEdit.Posologia}
        onChange={(e) => aggiornaAlimentoAdmin("Posologia", e.target.value)}
        style={{ ...inputStyle, minHeight: "80px" }}
      />

      <textarea
        placeholder="Note alimento"
        value={adminAlimentoEdit.Note}
        onChange={(e) => aggiornaAlimentoAdmin("Note", e.target.value)}
        style={{ ...inputStyle, minHeight: "100px" }}
      />

      <button onClick={salvaAlimentoAdmin} style={greenButton}>
        Salva modifiche alimento
      </button>
    </div>
  )}
</div>
)}
<div style={cardStyle}>
  <div style={sectionTitleStyle}>
    <h2>🛒 Prodotti utili consigliati</h2>
    <p>
      Integratori, strumenti e accessori utili per la gestione quotidiana dei petauri.
    </p>
  </div>

  <div style={affiliateNoticeStyle}>
    In qualità di Affiliati Amazon possiamo ricevere una commissione dagli acquisti idonei,
    senza costi aggiuntivi per chi acquista. Le eventuali commissioni saranno utilizzate
    per sostenere le attività dell'associazione.
  </div>

  <div style={productsGridStyle}>
    {prodottiUtili.map((prodotto) => (
      <div key={`${prodotto.categoria}-${prodotto.nome}`} style={productCardStyle}>
        <span style={productCategoryStyle}>{prodotto.categoria}</span>

        <h3>{prodotto.nome}</h3>

        <p>{prodotto.descrizione}</p>

        {prodotto.link ? (
          <button
            type="button"
            onClick={() => window.open(prodotto.link, "_blank")}
            style={greenButton}
          >
            Apri prodotto
          </button>
        ) : (
          <span style={emptyBoxStyle}>
            Link da inserire
          </span>
        )}
      </div>
    ))}
  </div>
</div>

  </>
)}

  </>
)}
    </div>
  );
}
const enapiColors = {
  panna: "#f6efdf",
  pannaChiaro: "#fffaf0",
  salvia: "#e8eddc",
  salviaChiaro: "#f3f5ec",
  bosco: "#234b2d",
  boscoScuro: "#17351f",
  oliva: "#6f7f3f",
  marrone: "#4a3b2a",
  marroneChiaro: "#6b5841",
  bordo: "#d8ddcf",
  oro: "#c9a646",
  bianco: "#fffdf7"
};
const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #f6efdf 0%, #eef1ea 48%, #f8f1e4 100%)",
  padding: "clamp(10px, 3vw, 24px)",
  fontFamily: "Arial, sans-serif",
  boxSizing: "border-box",
  color: enapiColors.marrone
};

const cardStyle = {
  backgroundColor: enapiColors.bianco,
  padding: "clamp(16px, 3vw, 24px)",
  borderRadius: "24px",
  marginBottom: "18px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  boxSizing: "border-box",
  border: `1px solid ${enapiColors.bordo}`,
  boxShadow: "0 10px 28px rgba(35, 75, 45, 0.08)"
};

const inputStyle = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "14px",
  border: `1px solid ${enapiColors.bordo}`,
  fontSize: "16px",
  boxSizing: "border-box",
  backgroundColor: enapiColors.bianco,
  color: enapiColors.marrone,
  outlineColor: enapiColors.oliva
};

const greenButton = {
  background: "linear-gradient(135deg, #234b2d 0%, #17351f 100%)",
  color: "white",
  border: "none",
  padding: "14px 18px",
  borderRadius: "999px",
  cursor: "pointer",
  minHeight: "46px",
  fontSize: "15px",
  fontWeight: "bold",
  boxShadow: "0 6px 14px rgba(35, 75, 45, 0.22)"
};

const redButton = {
  backgroundColor: "#b00020",
  color: "white",
  border: "none",
  padding: "12px",
  borderRadius: "10px",
  cursor: "pointer",
  minHeight: "44px",
  fontSize: "15px",
  fontWeight: "bold"
};
const smallRedButton = {
  backgroundColor: "#b00020",
  color: "white",
  border: "none",
  padding: "8px 10px",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "bold"
};
const smallGreenButton = {
  backgroundColor: "#234b2d",
  color: "white",
  border: "none",
  padding: "8px 10px",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "bold"
};
const documentRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
  alignItems: "center",
  padding: "10px",
  border: "1px solid #d8ddcf",
  borderRadius: "12px",
  backgroundColor: "#ffffff",
  flexWrap: "wrap"
};
const documentActionsStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap"
};
const filterGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "10px"
};
const filterFieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  fontWeight: "bold",
  color: "#234b2d"
};
const filterFooterStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap"
};
const alertCard = {
  backgroundColor: "#ffe5e5",
  color: "#9b1c1c",
  padding: "20px",
  borderRadius: "20px",
  marginBottom: "20px"
};
const alertItemStyle = {
  padding: "10px",
  borderRadius: "12px",
  border: "1px solid",
  fontWeight: "bold",
  marginTop: "8px"
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
  height: "100dvh",
  backgroundColor: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  zIndex: 9999,
  padding: "10px",
  overflowY: "auto",
  boxSizing: "border-box"
};

const modalStyle = {
  backgroundColor: "#fffaf0",
  padding: "clamp(14px, 3vw, 18px)",
  borderRadius: "18px",
  width: "100%",
  maxWidth: "520px",
  maxHeight: "calc(100dvh - 20px)",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
  border: "1px solid #d8ddcf",
  boxSizing: "border-box"
};

const closeButtonStyle = {
  alignSelf: "flex-end",
  border: "none",
  background: "#eef1ea",
  color: "#234b2d",
  fontSize: "22px",
  cursor: "pointer",
  borderRadius: "50%",
  width: "38px",
  height: "38px",
  lineHeight: "38px"
};

const modalImageStyle = {
  width: "100%",
  height: "170px",
  objectFit: "contain",
  borderRadius: "20px",
  border: "1px solid #d8ddcf",
  backgroundColor: "#eef1ea",
  padding: "10px"
};

const modalImagePlaceholderStyle = {
  width: "100%",
  height: "180px",
  borderRadius: "20px",
  backgroundColor: "#eef1ea",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "64px",
  border: "1px solid #d8ddcf"
};

const modalHeaderStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px"
};

const modalTitleStyle = {
  margin: 0,
  color: "#234b2d",
  fontSize: "26px",
  lineHeight: "1.2"
};

const modalCategoryStyle = {
  margin: 0,
  color: "#5d4b36",
  fontSize: "14px"
};

const infoBoxStyle = {
  backgroundColor: "#eef1ea",
  color: "#234b2d",
  padding: "14px",
  borderRadius: "16px",
  border: "1px solid #d8ddcf"
};

const noteBoxStyle = {
  backgroundColor: "#fff8e1",
  color: "#5d4b00",
  padding: "14px",
  borderRadius: "16px",
  border: "1px solid #eadb9c"
};

const dangerBoxStyle = {
  backgroundColor: "#ffebee",
  color: "#b00020",
  padding: "14px",
  borderRadius: "16px",
  border: "1px solid #ef9a9a",
  fontWeight: "bold"
};
const sectionTitleStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px"
};

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px"
};

const miniPanelStyle = {
  backgroundColor: enapiColors.salviaChiaro,
  border: `1px solid ${enapiColors.bordo}`,
  borderRadius: "20px",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  boxShadow: "0 6px 16px rgba(35, 75, 45, 0.05)"
};

const summaryBoxStyle = {
  backgroundColor: "#eef1ea",
  borderRadius: "12px",
  padding: "10px",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  color: "#234b2d"
};

const petauroGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "10px"
};

const petauroCardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "14px",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  textAlign: "left",
  cursor: "pointer",
  fontFamily: "inherit",
  color: "#234b2d"
};

const chartPanelStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #d8ddcf",
  borderRadius: "16px",
  padding: "14px",
  marginTop: "10px"
};
const verificaGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "12px"
};

const verificaPanelStyle = {
  backgroundColor: "#f7f8f3",
  border: "1px solid #d8ddcf",
  borderRadius: "16px",
  padding: "14px",
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const verificaRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  padding: "8px 0",
  borderBottom: "1px solid #e1e5d8"
};

const successBoxStyle = {
  backgroundColor: "#e8f5e9",
  color: "#2e7d32",
  padding: "10px",
  borderRadius: "12px",
  fontWeight: "bold"
};

const warningBoxStyle = {
  backgroundColor: "#fff8e1",
  color: "#f57f17",
  padding: "10px",
  borderRadius: "12px",
  fontWeight: "bold"
};

const scoreBoxStyle = {
  marginTop: "14px",
  padding: "16px",
  borderRadius: "16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  fontSize: "18px",
  fontWeight: "bold"
};
const weeksGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "12px"
};

const weekCardStyle = {
  backgroundColor: "#f7f8f3",
  border: "1px solid #d8ddcf",
  borderRadius: "16px",
  padding: "14px",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const weekHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "10px",
  color: "#234b2d"
};

const daySummaryStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "14px",
  padding: "12px",
  border: "1px solid #e1e5d8",
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const dayPillGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "6px"
};

const dayPillStyle = {
  backgroundColor: "#eef1ea",
  color: "#234b2d",
  borderRadius: "999px",
  padding: "7px 10px",
  fontSize: "13px",
  lineHeight: "1.3"
};
const emptyBoxStyle = {
  backgroundColor: "#f7f8f3",
  color: "#5d4b36",
  border: "1px solid #d8ddcf",
  borderRadius: "16px",
  padding: "14px"
};

const shoppingSummaryStyle = {
  backgroundColor: "#eef1ea",
  color: "#234b2d",
  borderRadius: "16px",
  padding: "14px",
  display: "flex",
  alignItems: "baseline",
  gap: "8px"
};

const shoppingListStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "8px"
};

const shoppingItemStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #d8ddcf",
  borderRadius: "14px",
  padding: "12px",
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
  color: "#234b2d"
};
const historyGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "12px"
};

const historyCardStyle = {
  backgroundColor: "#f7f8f3",
  border: "1px solid #d8ddcf",
  borderRadius: "16px",
  padding: "14px",
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const historyHeaderStyle = {
  color: "#234b2d"
};

const historyPillGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "6px"
};

const historyPillStyle = {
  backgroundColor: "#eef1ea",
  color: "#234b2d",
  borderRadius: "999px",
  padding: "7px 10px",
  fontSize: "13px",
  lineHeight: "1.3"
};

const historyMetricGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: "8px"
};

const historyMetricStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #d8ddcf",
  borderRadius: "14px",
  padding: "10px",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  color: "#234b2d"
};

const replicaBoxStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #d8ddcf",
  borderRadius: "14px",
  padding: "12px",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};
const autoDietBoxStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const autoDietSummaryStyle = {
  backgroundColor: "#eef1ea",
  color: "#234b2d",
  borderRadius: "16px",
  padding: "14px",
  display: "flex",
  flexDirection: "column",
  gap: "4px"
};

const autoDietGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "12px"
};

const autoDayCardStyle = {
  backgroundColor: "#f7f8f3",
  border: "1px solid #d8ddcf",
  borderRadius: "16px",
  padding: "14px",
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const autoMetricStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #d8ddcf",
  borderRadius: "14px",
  padding: "10px",
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
  color: "#234b2d"
};
const affiliateBoxStyle = {
  backgroundColor: "#fff8e1",
  border: "1px solid #eadb9c",
  borderRadius: "14px",
  padding: "12px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  color: "#5d4b00"
};

const amazonButtonStyle = {
  backgroundColor: "#234b2d",
  color: "white",
  border: "none",
  padding: "12px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "bold"
};
const heroHeaderStyle = {
  background:
    "linear-gradient(135deg, rgba(255,250,240,0.96) 0%, rgba(232,237,220,0.9) 100%)",
  border: `1px solid ${enapiColors.bordo}`,
  borderRadius: "30px",
  padding: "clamp(18px, 4vw, 30px)",
  marginBottom: "22px",
  display: "flex",
  alignItems: "center",
  gap: "18px",
  boxShadow: "0 14px 34px rgba(35, 75, 45, 0.10)"
};

const logoStyle = {
  width: "clamp(82px, 18vw, 120px)",
  height: "clamp(82px, 18vw, 120px)",
  objectFit: "contain",
  borderRadius: "50%",
  backgroundColor: "white",
  padding: "8px",
  flexShrink: 0,
  border: `1px solid ${enapiColors.bordo}`,
  boxShadow: "0 8px 20px rgba(35, 75, 45, 0.12)"
};

const heroTitleStyle = {
  margin: 0,
  color: enapiColors.bosco,
  fontSize: "clamp(34px, 7vw, 54px)",
  lineHeight: "1.02",
  fontWeight: "800",
  letterSpacing: "-0.03em"
};

const heroSubtitleStyle = {
  margin: "8px 0 0",
  color: enapiColors.marrone,
  fontSize: "clamp(16px, 3.5vw, 22px)",
  lineHeight: "1.35"
};

const petauroPhotoStyle = {
  width: "72px",
  height: "72px",
  objectFit: "cover",
  borderRadius: "50%",
  border: "1px solid #d8ddcf",
  backgroundColor: "#eef1ea"
};

const petauroPhotoPlaceholderStyle = {
  width: "72px",
  height: "72px",
  borderRadius: "50%",
  border: "1px solid #d8ddcf",
  backgroundColor: "#eef1ea",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "30px"
};

const petauroNoteStyle = {
  backgroundColor: "#fff8e1",
  color: "#5d4b00",
  borderRadius: "10px",
  padding: "8px",
  fontSize: "12px",
  lineHeight: "1.3"
};
const colonyMemberStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #d8ddcf",
  borderRadius: "14px",
  padding: "12px",
  display: "flex",
  flexDirection: "column",
  gap: "5px",
  color: "#234b2d"
};
const affiliateNoticeStyle = {
  backgroundColor: "#fff8e1",
  color: "#5d4b00",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #eadb9c",
  fontSize: "14px",
  lineHeight: "1.4"
};

const productsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px"
};

const productCardStyle = {
  backgroundColor: "#f7f8f3",
  border: "1px solid #d8ddcf",
  borderRadius: "16px",
  padding: "14px",
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const productCategoryStyle = {
  color: "#6f7f3f",
  fontWeight: "bold",
  fontSize: "13px"
};
const adminFoodImageStyle = {
  width: "100%",
  maxHeight: "180px",
  objectFit: "contain",
  borderRadius: "14px",
  border: "1px solid #d8ddcf",
  backgroundColor: "#ffffff",
  padding: "8px"
};
const adminBadgeStyle = {
  display: "inline-flex",
  width: "fit-content",
  backgroundColor: "#234b2d",
  color: "white",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: "bold"
};
const authTabsStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap"
};

const authTabStyle = {
  backgroundColor: enapiColors.bianco,
  color: enapiColors.bosco,
  border: `1px solid ${enapiColors.bordo}`,
  padding: "10px 14px",
  borderRadius: "999px",
  cursor: "pointer",
  fontWeight: "bold",
  boxShadow: "0 4px 10px rgba(35,75,45,0.05)"
};

const authTabActiveStyle = {
  ...authTabStyle,
  background: "linear-gradient(135deg, #234b2d 0%, #17351f 100%)",
  color: "white",
  border: "1px solid #234b2d"
};
const homeGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "18px",
  marginTop: "18px"
};

const homeCardStyle = {
  background:
    "linear-gradient(145deg, rgba(255,253,247,0.96) 0%, rgba(243,245,236,0.96) 100%)",
  border: `1px solid ${enapiColors.bordo}`,
  borderRadius: "26px",
  padding: "24px",
  cursor: "pointer",
  boxShadow: "0 12px 26px rgba(35, 75, 45, 0.10)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  minHeight: "250px",
  textAlign: "center",
  color: enapiColors.marrone,
  position: "relative",
  overflow: "hidden"
};

const homeIconStyle = {
  width: "132px",
  height: "132px",
  borderRadius: "50%",
  background:
    "radial-gradient(circle at 45% 35%, #f8f1dc 0%, #e8eddc 60%, #dfe8c9 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "inset 0 0 0 1px rgba(35,75,45,0.08), 0 10px 22px rgba(35,75,45,0.12)"
};

const homeTitleStyle = {
  fontSize: "clamp(25px, 4vw, 34px)",
  fontWeight: "800",
  color: enapiColors.bosco,
  lineHeight: "1.05"
};

const homeTextStyle = {
  fontSize: "15px",
  color: enapiColors.marrone,
  lineHeight: "1.45",
  maxWidth: "260px"
};

const homeActionStyle = {
  marginTop: "8px",
  background: "linear-gradient(135deg, #234b2d 0%, #17351f 100%)",
  color: "white",
  borderRadius: "999px",
  padding: "10px 18px",
  minWidth: "120px",
  fontWeight: "bold",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  boxShadow: "0 8px 18px rgba(35, 75, 45, 0.20)"
};

const backHomeButtonStyle = {
  marginBottom: "18px",
  backgroundColor: "#6f7f3f",
  color: "white",
  border: "none",
  borderRadius: "999px",
  padding: "10px 16px",
  cursor: "pointer",
  fontWeight: "bold"
};
const dietauroStepStyle = {
  background:
    "linear-gradient(145deg, rgba(255,253,247,0.98) 0%, rgba(243,245,236,0.96) 100%)",
  border: `1px solid ${enapiColors.bordo}`,
  borderRadius: "24px",
  marginBottom: "16px",
  overflow: "hidden",
  boxShadow: "0 12px 28px rgba(35, 75, 45, 0.09)"
};

const dietauroStepHeaderStyle = {
  width: "100%",
  border: "none",
  background:
    "linear-gradient(135deg, rgba(232,237,220,0.98) 0%, rgba(247,241,230,0.98) 100%)",
  color: enapiColors.bosco,
  padding: "18px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  cursor: "pointer",
  fontWeight: "800",
  fontSize: "18px",
  textAlign: "left",
  fontFamily: "inherit",
  borderBottom: `1px solid ${enapiColors.bordo}`
};

const dietauroStepBodyStyle = {
  padding: "clamp(14px, 3vw, 20px)",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  backgroundColor: "rgba(255,250,240,0.72)"
};

const dietauroStepSummaryStyle = {
  fontSize: "13px",
  color: enapiColors.marroneChiaro,
  fontWeight: "500",
  lineHeight: "1.35"
};
const homeSvgStyle = {
  width: "128px",
  height: "128px",
  display: "block"
};
const homeImageIconStyle = {
  width: "132px",
  height: "132px",
  objectFit: "contain",
  borderRadius: "50%",
  display: "block",
  filter: "drop-shadow(0 10px 16px rgba(35, 75, 45, 0.18))"
};
const accessCardStyle = {
  background:
    "linear-gradient(145deg, rgba(255,253,247,0.98) 0%, rgba(243,245,236,0.96) 100%)",
  padding: "clamp(18px, 4vw, 26px)",
  borderRadius: "28px",
  marginBottom: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  boxSizing: "border-box",
  border: `1px solid ${enapiColors.bordo}`,
  boxShadow: "0 14px 34px rgba(35, 75, 45, 0.10)",
  position: "relative",
  overflow: "hidden"
};

const accessHeaderIconStyle = {
  width: "46px",
  height: "46px",
  borderRadius: "50%",
  backgroundColor: enapiColors.salvia,
  color: enapiColors.bosco,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "22px",
  marginBottom: "4px"
};