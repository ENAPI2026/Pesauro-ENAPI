"use client";

<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

=======
import { useEffect, useState } from "react";

import { createClient } from "@supabase/supabase-js";

import Papa from "papaparse";

>>>>>>> c47327e507dc71fc3d0350c5c9e01943cd46bd15
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

<<<<<<< HEAD
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

  const [petauri, setPetauri] =
    useState([]);

  const [colonie, setColonie] =
    useState([]);

  const [alimenti, setAlimenti] =
    useState([]);

  const [diete, setDiete] =
    useState([]);

  const [pesi, setPesi] =
    useState([]);

  const [settimane, setSettimane] =
    useState([]);

  const [giorniSettimanaDB,
    setGiorniSettimanaDB] =
    useState([]);

  const [modalita,
    setModalita] =
    useState("petauro");

  const [petauroId,
    setPetauroId] =
    useState("");

  const [coloniaId,
    setColoniaId] =
    useState("");

  const [alimentoId,
    setAlimentoId] =
    useState("");

  const [grammi,
    setGrammi] =
    useState("");

  const [dataDieta,
    setDataDieta] =
    useState("");

  const [settimanaNome,
    setSettimanaNome] =
    useState("");

  const [giornoSettimana,
    setGiornoSettimana] =
    useState("Lunedi");

  const [settimanaDaApplicare,
    setSettimanaDaApplicare] =
    useState("");

  const [dataInizioSettimana,
    setDataInizioSettimana] =
    useState("");

  useEffect(() => {

    loadPetauri();
    loadColonie();
    loadAlimenti();
    loadDiete();
    loadPesi();
    loadSettimane();
    loadGiorniSettimana();

  }, []);

  async function loadPetauri() {

    const { data } =
      await supabase
        .from("petauri")
        .select("*");

    if (data)
      setPetauri(data);
  }

  async function loadColonie() {

    const { data } =
      await supabase
        .from("colonie")
        .select("*");

    if (data)
      setColonie(data);
  }

=======
export default function Home() {

  const [alimenti,
    setAlimenti] =
    useState([]);

  const [csvFile,
    setCsvFile] =
    useState(null);

  useEffect(() => {

    loadAlimenti();

  }, []);

>>>>>>> c47327e507dc71fc3d0350c5c9e01943cd46bd15
  async function loadAlimenti() {

    const { data } =
      await supabase
        .from("alimenti")
<<<<<<< HEAD
        .select("*");
=======
        .select("*")
        .order("Nome");
>>>>>>> c47327e507dc71fc3d0350c5c9e01943cd46bd15

    if (data)
      setAlimenti(data);
  }

<<<<<<< HEAD
  async function loadDiete() {

    const { data } =
      await supabase
        .from("diete")
        .select("*")
        .order("data", {
          ascending: false
        });

    if (data)
      setDiete(data);
  }

  async function loadPesi() {

    const { data } =
      await supabase
        .from("pesi")
        .select("*")
        .order("data", {
          ascending: false
        });

    if (data)
      setPesi(data);
  }

  async function loadSettimane() {

    const { data } =
      await supabase
        .from("settimane_dieta")
        .select("*");

    if (data)
      setSettimane(data);
  }

  async function loadGiorniSettimana() {

    const { data } =
      await supabase
        .from(
          "settimane_dieta_giorni"
        )
        .select("*");

    if (data)
      setGiorniSettimanaDB(data);
  }

  async function addDieta() {

    if (modalita === "petauro") {

      const { error } =
        await supabase
          .from("diete")
          .insert([
            {
              petauro_id:
                petauroId,

              colonia_id:
                null,

              alimento_id:
                alimentoId,

              grammi:
                Number(grammi),

              data:
                dataDieta
            }
          ]);

      if (error) {

        alert(error.message);

      } else {

        resetForm();
        loadDiete();
      }

    } else {

      const membriColonia =
        petauri.filter(
          (p) =>
            p.colonia_id ==
            coloniaId
        );

      const records =
        membriColonia.map(
          (p) => ({
            petauro_id: p.id,

            colonia_id:
              coloniaId,

            alimento_id:
              alimentoId,

            grammi:
              Number(grammi),

            data:
              dataDieta
          })
        );

      const { error } =
        await supabase
          .from("diete")
          .insert(records);

      if (error) {

        alert(error.message);

      } else {

        resetForm();
        loadDiete();
      }
    }
  }

  async function salvaSettimana() {

    const { data, error } =
      await supabase
        .from("settimane_dieta")
        .insert([
          {
            Nome:
              settimanaNome
          }
        ])
        .select()
        .single();

    if (error) {

      alert(error.message);
      return;
    }

    const giornoObj =
      giorniSettimana.find(
        (g) =>
          g.nome ===
          giornoSettimana
      );

    const records =
      diete.map((dieta) => ({

        settimana_id:
          data.id,

        giorno:
          giornoSettimana,

        giorno_numero:
          giornoObj.numero,

        alimento_id:
          dieta.alimento_id,

        grammi:
          dieta.grammi

      }));

    const { error: error2 } =
      await supabase
        .from(
          "settimane_dieta_giorni"
        )
        .insert(records);

    if (error2) {

      alert(error2.message);

    } else {

      alert(
        "Settimana salvata 😄"
      );

      loadSettimane();
      loadGiorniSettimana();
    }
  }

  async function applicaSettimana() {

    if (
      !settimanaDaApplicare ||
      !dataInizioSettimana
    ) {

      alert(
        "Completa i campi"
      );

      return;
    }

    const recordsSettimana =
      giorniSettimanaDB.filter(
        (g) =>
          g.settimana_id ==
          settimanaDaApplicare
      );

    const dataBase =
      new Date(
        dataInizioSettimana
      );

    let recordsFinali = [];

    for (const record of recordsSettimana) {

      const nuovaData =
        new Date(dataBase);

      nuovaData.setDate(
        dataBase.getDate() +
        (record.giorno_numero - 1)
      );

      const dataFinale =
        nuovaData
          .toISOString()
          .split("T")[0];

      if (modalita === "petauro") {

        recordsFinali.push({

          petauro_id:
            petauroId,

          colonia_id:
            null,

          alimento_id:
            record.alimento_id,

          grammi:
            record.grammi,

          data:
            dataFinale
        });

      } else {

        const membriColonia =
          petauri.filter(
            (p) =>
              p.colonia_id ==
              coloniaId
          );

        membriColonia.forEach(
          (p) => {

            recordsFinali.push({

              petauro_id:
                p.id,

              colonia_id:
                coloniaId,

              alimento_id:
                record.alimento_id,

              grammi:
                record.grammi,

              data:
                dataFinale
            });

          }
        );
      }
    }

    const { error } =
      await supabase
        .from("diete")
        .insert(recordsFinali);

    if (error) {

      alert(error.message);

    } else {

      alert(
        "Settimana applicata 😄"
      );

      loadDiete();
    }
  }

  function resetForm() {

    setPetauroId("");
    setColoniaId("");
    setAlimentoId("");
    setGrammi("");
    setDataDieta("");
  }

  function getAlimento(id) {

    return alimenti.find(
      (a) => a.id == id
    );
  }

  function getNomeAlimento(id) {

    const alimento =
      getAlimento(id);

    return alimento
      ? alimento.Nome
      : "-";
  }

  const listaSpesa =
    useMemo(() => {

      let totale = {};

      diete.forEach((dieta) => {

        const alimento =
          getAlimento(
            dieta.alimento_id
          );

        if (!alimento) return;

        if (
          !totale[
            alimento.Nome
          ]
        ) {

          totale[
            alimento.Nome
          ] = 0;
        }

        totale[
          alimento.Nome
        ] += Number(
          dieta.grammi
        );
      });

      return Object
        .entries(totale)
        .map(
          ([nome, grammi]) => ({

            nome,
            grammi

          })
        )
        .sort(
          (a, b) =>
            b.grammi -
            a.grammi
        );

    }, [diete, alimenti]);

  const analisiCategorie =
    useMemo(() => {

      const stats = {

        Frutta: 0,
        Verdura: 0,
        Insetto: 0,
        Integratore: 0

      };

      let conteggioAlimenti =
        {};

      diete.forEach((dieta) => {

        const alimento =
          getAlimento(
            dieta.alimento_id
          );

        if (!alimento) return;

        const categoria =
          alimento.Categoria ||
          "Altro";

        const g =
          Number(
            dieta.grammi
          );

        if (
          !stats[categoria]
        ) {

          stats[categoria] = 0;
        }

        stats[categoria] += g;

        if (
          !conteggioAlimenti[
            alimento.Nome
          ]
        ) {

          conteggioAlimenti[
            alimento.Nome
          ] = 0;
        }

        conteggioAlimenti[
          alimento.Nome
        ] += g;

      });

      const alimentoPiuUsato =
        Object.entries(
          conteggioAlimenti
        )
          .map(
            ([nome, grammi]) => ({

              nome,
              grammi

            })
          )
          .sort(
            (a, b) =>
              b.grammi -
              a.grammi
          )[0];

      return {

        stats,
        alimentoPiuUsato

      };

    }, [diete, alimenti]);

  const alertPeso =
    petauri
      .map((petauro) => {

        const pesiPetauro =
          pesi
            .filter(
              (p) =>
                p.petauro_id ==
                petauro.id
            )
            .sort(
              (a, b) =>
                new Date(
                  b.data
                ) -
                new Date(
                  a.data
                )
            );

        if (
          pesiPetauro.length < 2
        ) {

          return null;
        }

        const ultimo =
          Number(
            pesiPetauro[0]
              .peso
          );

        const precedente =
          Number(
            pesiPetauro[1]
              .peso
          );

        const differenza =
          ultimo -
          precedente;

        if (
          differenza <= -5
        ) {

          return {

            nome:
              petauro.Nome,

            differenza

          };
        }

        return null;

      })
      .filter(Boolean);

  return (
=======
  async function importCSV() {

    if (!csvFile) {

      alert("Seleziona un CSV");
      return;
    }

    Papa.parse(csvFile, {

      header: true,

      skipEmptyLines: true,

      complete: async function(results) {

        const records =
          results.data.map(
            (row) => ({

              Nome:
                row.Nome,

              Categoria:
                row.Categoria,

              Calcio:
                Number(row.Calcio),

              Fosforo:
                Number(row.Fosforo),

              Note:
                row.Note || ""

            })
          );

        const { error } =
          await supabase
            .from("alimenti")
            .insert(records);

        if (error) {

          alert(error.message);

        } else {

          alert(
            "Import completato 😄"
          );

          loadAlimenti();
        }
      }
    });
  }

  return (

>>>>>>> c47327e507dc71fc3d0350c5c9e01943cd46bd15
    <div
      style={{
        minHeight: "100vh",
        backgroundColor:
          "#eef1ea",

<<<<<<< HEAD
        padding: "20px",

        fontFamily:
          "Arial, sans-serif"
=======
        padding:
          "20px",

        fontFamily:
          "Arial"
>>>>>>> c47327e507dc71fc3d0350c5c9e01943cd46bd15
      }}
    >

      <h1
        style={{
<<<<<<< HEAD
          color: "#234b2d"
=======
          color:
            "#234b2d"
>>>>>>> c47327e507dc71fc3d0350c5c9e01943cd46bd15
        }}
      >
        Dietauro ENAPI
      </h1>

<<<<<<< HEAD
      {alertPeso.length > 0 && (

        <div
          style={{
            backgroundColor:
              "#ffe5e5",

            color:
              "#9b1c1c",

            padding:
              "20px",

            borderRadius:
              "20px",

            marginBottom:
              "20px"
          }}
        >

          <h2>
            🚨 Alert peso
          </h2>

          {alertPeso.map(
            (
              alert,
              index
            ) => (

              <p key={index}>

                ⚠️ {
                  alert.nome
                } ha perso{" "}

                {Math.abs(
                  alert.differenza
                )} g

              </p>

            )
          )}

        </div>

      )}

      <div style={cardStyle}>

        <h2>
          Modalità
        </h2>

        <select
          value={modalita}
          onChange={(e) =>
            setModalita(
              e.target.value
            )
          }
        >

          <option value="petauro">
            Singolo petauro
          </option>

          <option value="colonia">
            Colonia
          </option>

        </select>

        {modalita ===
        "petauro" ? (

          <select
            value={petauroId}
            onChange={(e) =>
              setPetauroId(
                e.target.value
              )
            }
          >

            <option value="">
              Seleziona petauro
            </option>

            {petauri.map(
              (petauro) => (

                <option
                  key={petauro.id}
                  value={petauro.id}
                >
                  {petauro.Nome}
                </option>

              )
            )}

          </select>

        ) : (

          <select
            value={coloniaId}
            onChange={(e) =>
              setColoniaId(
                e.target.value
              )
            }
          >

            <option value="">
              Seleziona colonia
            </option>

            {colonie.map(
              (colonia) => (

                <option
                  key={colonia.id}
                  value={colonia.id}
                >
                  {colonia.Nome}
                </option>

              )
            )}

          </select>

        )}

      </div>

      <div style={cardStyle}>

        <h2>
          Aggiungi alimento
        </h2>

        <select
          value={alimentoId}
          onChange={(e) =>
            setAlimentoId(
              e.target.value
            )
          }
        >

          <option value="">
            Seleziona alimento
          </option>

          {alimenti.map(
            (alimento) => (

              <option
                key={alimento.id}
                value={alimento.id}
              >
                {alimento.Nome}
              </option>

            )
          )}

        </select>

        <input
          type="number"
          placeholder="Grammi"
          value={grammi}
          onChange={(e) =>
            setGrammi(
              e.target.value
            )
          }
        />

        <input
          type="date"
          value={dataDieta}
          onChange={(e) =>
            setDataDieta(
              e.target.value
=======
      <div style={cardStyle}>

        <h2>
          📂 Import CSV alimenti
        </h2>

        <input
          type="file"
          accept=".csv"
          onChange={(e) =>
            setCsvFile(
              e.target.files[0]
>>>>>>> c47327e507dc71fc3d0350c5c9e01943cd46bd15
            )
          }
        />

        <button
<<<<<<< HEAD
          onClick={addDieta}
          style={greenButton}
        >
          Salva alimento
=======
          onClick={importCSV}
          style={greenButton}
        >
          Importa CSV
>>>>>>> c47327e507dc71fc3d0350c5c9e01943cd46bd15
        </button>

      </div>

      <div style={cardStyle}>

        <h2>
<<<<<<< HEAD
          Salva settimana
        </h2>

        <input
          type="text"
          placeholder="Nome settimana"
          value={settimanaNome}
          onChange={(e) =>
            setSettimanaNome(
              e.target.value
            )
          }
        />

        <select
          value={giornoSettimana}
          onChange={(e) =>
            setGiornoSettimana(
              e.target.value
            )
          }
        >

          {giorniSettimana.map(
            (giorno) => (

              <option
                key={
                  giorno.nome
                }
                value={
                  giorno.nome
                }
              >
                {giorno.nome}
              </option>

            )
          )}

        </select>

        <button
          onClick={
            salvaSettimana
          }
          style={greenButton}
        >
          Salva settimana
        </button>

      </div>

      <div style={cardStyle}>

        <h2>
          Applica settimana
        </h2>

        <select
          value={
            settimanaDaApplicare
          }
          onChange={(e) =>
            setSettimanaDaApplicare(
              e.target.value
            )
          }
        >

          <option value="">
            Seleziona settimana
          </option>

          {settimane.map(
            (settimana) => (

              <option
                key={
                  settimana.id
                }
                value={
                  settimana.id
                }
              >
                {
                  settimana.Nome
                }
              </option>

            )
          )}

        </select>

        <input
          type="date"
          value={
            dataInizioSettimana
          }
          onChange={(e) =>
            setDataInizioSettimana(
              e.target.value
            )
          }
        />

        <button
          onClick={
            applicaSettimana
          }
          style={greenButton}
        >
          Applica settimana
        </button>

      </div>

      <div style={cardStyle}>

        <h2>
          📊 Analisi automatica dieta
        </h2>

        <p>

          <strong>
            Alimento più usato:
          </strong>{" "}

          {
            analisiCategorie
              .alimentoPiuUsato
              ? `${analisiCategorie.alimentoPiuUsato.nome} (${analisiCategorie.alimentoPiuUsato.grammi} g)`
              : "-"
          }

        </p>

        <p>
          <strong>
            Frutta:
          </strong>{" "}

          {
            analisiCategorie
              .stats.Frutta || 0
          } g

        </p>

        <p>
          <strong>
            Verdura:
          </strong>{" "}

          {
            analisiCategorie
              .stats.Verdura || 0
          } g

        </p>

        <p>
          <strong>
            Insetti:
          </strong>{" "}

          {
            analisiCategorie
              .stats.Insetto || 0
          } g

        </p>

        <p>
          <strong>
            Integratori:
          </strong>{" "}

          {
            analisiCategorie
              .stats.Integratore || 0
          } g

        </p>

      </div>

      <div style={cardStyle}>

        <h2>
          🛒 Lista spesa automatica
        </h2>

        {listaSpesa.map(
          (item) => (

            <div
              key={item.nome}
              style={{
                display:
                  "flex",

                justifyContent:
                  "space-between",

=======
          🍎 Alimenti presenti
        </h2>

        {alimenti.map(
          (alimento) => (

            <div
              key={alimento.id}
              style={{
>>>>>>> c47327e507dc71fc3d0350c5c9e01943cd46bd15
                padding:
                  "10px 0",

                borderBottom:
                  "1px solid #ddd"
              }}
            >

              <strong>
<<<<<<< HEAD
                {item.nome}
              </strong>

              <span>
                {item.grammi} g
              </span>

            </div>

          )
        )}

      </div>

      <div
        style={{
          display: "flex",

          flexDirection:
            "column",

          gap: "15px"
        }}
      >

        {diete.map(
          (dieta) => (

            <div
              key={dieta.id}
              style={smallCard}
            >

              <p>

                <strong>
                  Alimento:
                </strong>{" "}

                {
                  getNomeAlimento(
                    dieta.alimento_id
                  )
                }

              </p>

              <p>

                <strong>
                  Grammi:
                </strong>{" "}

                {dieta.grammi}

              </p>

              <p>

                <strong>
                  Data:
                </strong>{" "}

                {dieta.data}

              </p>
=======
                {alimento.Nome}
              </strong>

              <br />

              Categoria:
              {" "}
              {
                alimento.Categoria
              }

              <br />

              Ca:
              {" "}
              {
                alimento.Calcio
              }

              {" "}|
              {" "}P:
              {" "}
              {
                alimento.Fosforo
              }
>>>>>>> c47327e507dc71fc3d0350c5c9e01943cd46bd15

            </div>

          )
        )}

      </div>

    </div>
  );
}

const cardStyle = {

  backgroundColor:
    "white",

  padding:
    "20px",

  borderRadius:
    "20px",

  marginBottom:
<<<<<<< HEAD
    "20px",

  display:
    "flex",

  flexDirection:
    "column",

  gap:
    "10px"
};

const smallCard = {

  backgroundColor:
    "white",

  padding:
    "20px",

  borderRadius:
=======
>>>>>>> c47327e507dc71fc3d0350c5c9e01943cd46bd15
    "20px"
};

const greenButton = {

  backgroundColor:
    "#234b2d",

  color:
    "white",

  border:
    "none",

  padding:
    "15px",

  borderRadius:
    "12px",

  cursor:
<<<<<<< HEAD
    "pointer"
=======
    "pointer",

  marginTop:
    "15px"
>>>>>>> c47327e507dc71fc3d0350c5c9e01943cd46bd15
};
