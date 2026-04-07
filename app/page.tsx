"use client";

import React, { useEffect, useRef, useState } from "react";
import { etiquetasPasos } from "./configuracion-formulario";
import { SeccionATS, SeccionDatosGenerales, SeccionEpp, SeccionFirmas, SeccionInterventores, SeccionMateriales } from "./secciones-formulario";

type Interventor = {
  documento: string;
  nombre: string;
  tipoDocumento: string;
  aptoAlturas: string;
  certificadoTsa: string;
  firma: string;
};

export default function Page() {
  const [activeSection, setActiveSection] = useState(1);

  const [interventorEnEdicion, setInterventorEnEdicion] = useState<Interventor>({
    documento: "",
    nombre: "",
    tipoDocumento: "CC",
    aptoAlturas: "Sí",
    certificadoTsa: "Sí",
    firma: "",
  });
  const [interventores, setInterventores] = useState<Interventor[]>([]);
  const [riesgosSeleccionados, setRiesgosSeleccionados] = useState<string[]>([]);
  const [elementosProteccionSeleccionados, setElementosProteccionSeleccionados] = useState<string[]>([]);
  const [sistemasAccesoSeleccionados, setSistemasAccesoSeleccionados] = useState<string[]>([]);
  const [declaracionAceptada, setDeclaracionAceptada] = useState(false);
  const [firmaQuienAutoriza, setFirmaQuienAutoriza] = useState("");
  const [firmaResponsableArea, setFirmaResponsableArea] = useState("");
  const [avisoValidacion, setAvisoValidacion] = useState<string>("");
  const [erroresCampos, setErroresCampos] = useState<Record<string, string>>({});
  const totalSections = 6;
  const progress = (activeSection / totalSections) * 100;
  const stepTitle = etiquetasPasos[activeSection - 1];
  const limpiarErrorCampo = (label: string) => {
    setErroresCampos((current) => {
      if (!current[label]) return current;
      const next = { ...current };
      delete next[label];
      return next;
    });
    setAvisoValidacion((current) => (current.includes(label) ? "" : current));
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSection]);

  const nextSection = () => {
    const validateRequiredFields = (selector: string) => {
      const container = document.querySelector(selector);
      if (!container) return [] as string[];
      const inputs = Array.from(container.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea"));
      const missing: string[] = [];
      for (const field of inputs) {
        if (!field.required) continue;
        if (field instanceof HTMLInputElement && field.type === "checkbox") {
          if (!field.checked) {
            missing.push(field.getAttribute("data-label") || "un campo obligatorio");
          }
          continue;
        }
        if (!field.checkValidity()) {
          missing.push(field.getAttribute("data-label") || "un campo obligatorio");
        }
      }
      return missing;
    };

    const missingGeneral = validateRequiredFields("#datos-generales");
    const missingInterventor = validateRequiredFields("#interventores");
    const missingFinal = validateRequiredFields("#firmas");

    if (activeSection === 1 && missingGeneral.length) {
      setAvisoValidacion(`Falta completar: ${missingGeneral[0]}.`);
      setErroresCampos(Object.fromEntries(missingGeneral.map((label) => [label, `Falta completar: ${label}.`])));
      return;
    }
    if (activeSection === 2 && missingInterventor.length) {
      setAvisoValidacion(`Falta completar: ${missingInterventor[0]}.`);
      setErroresCampos(Object.fromEntries(missingInterventor.map((label) => [label, `Falta completar: ${label}.`])));
      return;
    }
    if (activeSection === 3 && riesgosSeleccionados.length === 0) {
      setErroresCampos({});
      setAvisoValidacion("Falta completar: selecciona al menos una condición de seguridad.");
      return;
    }
    const missingEpp = validateRequiredFields("#epp");
    if (activeSection === 4 && (missingEpp.length || elementosProteccionSeleccionados.length === 0 || sistemasAccesoSeleccionados.length === 0)) {
      setAvisoValidacion(
        missingEpp.length
          ? `Falta completar: ${missingEpp[0]}.`
          : "Falta completar: selecciona al menos un EPP y un sistema de acceso."
      );
      setErroresCampos({});
      return;
    }
    if (activeSection === 5 && !declaracionAceptada) {
      setErroresCampos({});
      setAvisoValidacion("Falta completar: debes aceptar la declaración para continuar.");
      return;
    }
    if (activeSection === 6 && (missingFinal.length || !firmaQuienAutoriza || !firmaResponsableArea)) {
      setAvisoValidacion(`Falta completar: ${missingFinal[0] || "las firmas finales"}.`);
      setErroresCampos(Object.fromEntries(missingFinal.map((label) => [label, `Falta completar: ${label}.`])));
      return;
    }
    setAvisoValidacion("");
    setErroresCampos({});
    setActiveSection((current) => Math.min(current + 1, totalSections));
  };
  const prevSection = () => setActiveSection((current) => Math.max(current - 1, 1));

  const addInterventor = () =>
    {
      const missing: string[] = [];
      if (!interventorEnEdicion.documento) missing.push("Número de documento");
      if (!interventorEnEdicion.nombre) missing.push("Nombre y apellido");
      if (!interventorEnEdicion.tipoDocumento) missing.push("Tipo de documento");
      if (!interventorEnEdicion.aptoAlturas) missing.push("Es apto para laborar en alturas");
      if (!interventorEnEdicion.certificadoTsa) missing.push("Está certificado para TSA");
      if (!interventorEnEdicion.firma) missing.push("Firma");
      if (missing.length) {
        setAvisoValidacion(`Falta completar: ${missing[0]}.`);
        setErroresCampos(Object.fromEntries(missing.map((label) => [label, `Falta completar: ${label}.`])));
        return;
      }
      setAvisoValidacion("");
      setErroresCampos({});
      setInterventores((current) => [
        ...current,
        { ...interventorEnEdicion },
      ]);
    };

  return (
    <main className="page-shell">
      <div className="page-frame">
        <section className="doc-top">
          <div className="doc-header-table">
            <div className="doc-header-logo">
              <div className="doc-logo-text">ROCA</div>
            </div>
            <div className="doc-header-center">
              <div className="doc-header-title-top">GESTION HSE</div>
              <div className="doc-header-title-main">PERMISO PARA TRABAJOS EN ALTURAS</div>
            </div>
            <div className="doc-header-meta">
              <div><strong>Codigo:</strong> HSE-F002</div>
              <div><strong>Fecha:</strong> 2026-04-06</div>
              <div><strong>Version:</strong> 01</div>
            </div>
          </div>
        </section>

        <div className="section-card stepper-card">
          <div className="stepper">
            <div className="stepper__meta">
              <div className="stepper__title">{stepTitle}</div>
              <div className="stepper__label">Paso {activeSection} de {totalSections}</div>
            </div>
            <div className="stepper__bar">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <form className="doc-form">
          {activeSection === 1 && <SeccionDatosGenerales erroresCampos={erroresCampos} limpiarErrorCampo={limpiarErrorCampo} />}
          {activeSection === 2 && (
            <SeccionInterventores
              erroresCampos={erroresCampos}
              limpiarErrorCampo={limpiarErrorCampo}
              interventorEnEdicion={interventorEnEdicion}
              setInterventorEnEdicion={setInterventorEnEdicion}
              agregarInterventor={addInterventor}
              interventores={interventores}
              setInterventores={setInterventores}
            />
          )}
          {activeSection === 3 && <SeccionMateriales riesgosSeleccionados={riesgosSeleccionados} setRiesgosSeleccionados={setRiesgosSeleccionados} />}
          {activeSection === 4 && (
            <SeccionEpp
              elementosProteccionSeleccionados={elementosProteccionSeleccionados}
              sistemasAccesoSeleccionados={sistemasAccesoSeleccionados}
              setElementosProteccionSeleccionados={setElementosProteccionSeleccionados}
              setSistemasAccesoSeleccionados={setSistemasAccesoSeleccionados}
            />
          )}
          {activeSection === 5 && (
            <SeccionATS declaracionAceptada={declaracionAceptada} setDeclaracionAceptada={setDeclaracionAceptada} avisoValidacion={avisoValidacion} />
          )}
          {activeSection === 6 && (
            <SeccionFirmas
              erroresCampos={erroresCampos}
              limpiarErrorCampo={limpiarErrorCampo}
              firmaQuienAutoriza={firmaQuienAutoriza}
              setFirmaQuienAutoriza={setFirmaQuienAutoriza}
              firmaResponsableArea={firmaResponsableArea}
              setFirmaResponsableArea={setFirmaResponsableArea}
              declaracionAceptada={declaracionAceptada}
              setDeclaracionAceptada={setDeclaracionAceptada}
            />
          )}

            <div className="wizard-actions">
              <button type="button" className="btn btn--ghost" onClick={prevSection} disabled={activeSection === 1}>
                Anterior
              </button>
                {activeSection < totalSections ? (
                <button type="button" className="btn btn--primary" onClick={nextSection} disabled={activeSection === 5 && !declaracionAceptada}>
                  Siguiente
                </button>
              ) : (
                <button type="button" className="btn btn--primary" disabled={!declaracionAceptada}>
                  Enviar formulario
                </button>
              )}
            </div>
            {avisoValidacion && activeSection === 6 ? <p className="field-helper field-helper--error">{avisoValidacion}</p> : null}
          </form>
      </div>
    </main>
  );
}
