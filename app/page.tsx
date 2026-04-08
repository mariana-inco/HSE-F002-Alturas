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
  firmaImagen?: string;
};

type PuntosFirma = Record<string, number[][]>;

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
  const [declaracionATS, setDeclaracionATS] = useState(false);
  const [declaracionFinal, setDeclaracionFinal] = useState(false);
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

  const leerCamposSeccion = (selector: string) => {
    const container = document.querySelector(selector);
    if (!container) return {};
    const campos = Array.from(container.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea"));
    return campos.reduce<Record<string, string | boolean>>((accumulator, campo) => {
      const etiqueta = campo.getAttribute("data-label") || campo.getAttribute("aria-label") || campo.name || campo.id || "campo";
      if (campo instanceof HTMLInputElement && campo.type === "checkbox") {
        accumulator[etiqueta] = campo.checked;
        return accumulator;
      }
      accumulator[etiqueta] = campo.value;
      return accumulator;
    }, {});
  };

  const resumirFirma = (firma: string, referencia: string) => ({
    registrado: Boolean(firma),
    enlace: firma ? referencia : "",
    puntos: firma ? firma.length : 0,
  });

  const convertirFirmaAImagen = (firma: string) => {
    if (!firma) return "";
    try {
      const puntos = JSON.parse(firma) as PuntosFirma;
      const rutas = Object.values(puntos)
        .filter((path) => path.length > 1)
        .map((path) => {
          const xs = path.map(([x]) => x);
          const ys = path.map(([, y]) => y);
          const minX = Math.min(...xs);
          const minY = Math.min(...ys);
          const maxX = Math.max(...xs);
          const maxY = Math.max(...ys);
          const ancho = Math.max(maxX - minX, 1);
          const alto = Math.max(maxY - minY, 1);
          const escala = Math.min(140 / ancho, 44 / alto);
          const puntosAjustados = path.map(([x, y]) => `${((x - minX) * escala + 5).toFixed(2)},${((y - minY) * escala + 8).toFixed(2)}`).join(" ");
          return `<polyline points="${puntosAjustados}" fill="none" stroke="#111827" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />`;
        });
      if (!rutas.length) return "";
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 60" width="150" height="60">${rutas.join("")}</svg>`;
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    } catch {
      return "";
    }
  };

  const tomarCampo = (campos: Record<string, string | boolean>, etiqueta: string) => {
    const valor = campos[etiqueta];
    return typeof valor === "boolean" ? valor : valor || "";
  };

  const construirJson = () => ({
    encabezado: {
      codigo: "HSE-F002",
      fecha: "2026-04-06",
      version: "11",
    },
    datosGenerales: (() => {
      const campos = leerCamposSeccion("#datos-generales");
      return {
        tipoTrabajo: tomarCampo(campos, "Tipo de trabajo"),
        centroOperacion: tomarCampo(campos, "Centro de operación"),
        ciudad: tomarCampo(campos, "Ciudad"),
        fechaInicioTrabajo: tomarCampo(campos, "Fecha de inicio del trabajo"),
        horaInicioTrabajo: tomarCampo(campos, "Hora de inicio del trabajo"),
        fechaTerminacionTrabajo: tomarCampo(campos, "Fecha de terminación del trabajo"),
        horaFinalizacionTrabajo: tomarCampo(campos, "Hora de finalización del trabajo"),
        responsableArea: tomarCampo(campos, "Responsable del área"),
        responsableDiligenciarPermiso: tomarCampo(campos, "Responsable de diligenciar el permiso"),
        alturaTrabajoMetros: tomarCampo(campos, "Altura del trabajo (metros)"),
        lugarTrabajo: tomarCampo(campos, "Lugar donde se realizará el trabajo"),
        descripcionProcedimiento: tomarCampo(campos, "Descripción y procedimiento del trabajo"),
      };
    })(),
    interventores: interventores.map((interventor) => ({
      documento: interventor.documento,
      nombre: interventor.nombre,
      tipoDocumento: interventor.tipoDocumento,
      aptoAlturas: interventor.aptoAlturas,
      certificadoTsa: interventor.certificadoTsa,
      firma: resumirFirma(interventor.firma, `firma://interventor-${interventor.documento || interventor.nombre}`),
    })),
    materialesYSeguridad: {
      identificacionMaterialesHerramientas: tomarCampo(leerCamposSeccion("#riesgos"), "Identificación de los materiales y/o herramientas que se van a emplear"),
      consideracionesSeguridad: riesgosSeleccionados,
    },
    eppYAccesos: {
      elementosProteccionPersonal: elementosProteccionSeleccionados,
      sistemasAccesosSeguros: sistemasAccesoSeleccionados,
      observaciones: tomarCampo(leerCamposSeccion("#epp"), "Observaciones"),
    },
    ats: {
      declaracionAceptada: declaracionATS,
      tabla: {
        pasoAPasoDelTrabajo: "Diligenciamiento de permiso de trabajo y ATS, inspección de los elementos de protección personal y equipos, traslado e inspección al sitio de trabajo con equipos y herramientas, instalación de EPCC para trabajos en alturas, inicio de la actividad, orden y aseo del sitio, cierre del permiso y término de la actividad.",
        identificarPeligros: "Caídas a distinto nivel, caídas de objetos, proyección de partículas, exposición a material particulado y humos metálicos, sobreesfuerzos, posturas inadecuadas, movimientos repetitivos, exposición a ruido, exposición a radiaciones por temperaturas extremas, condiciones de la tarea y fenómenos naturales.",
        accionesYControles: "Entrenamiento en trabajo en alturas, señalización del área, plan de emergencias, permisos de trabajo, uso de EPPs y equipos de protección contra caídas, charlas de seguridad, capacitaciones en trabajos en alturas y caliente, inspección al sitio de trabajo y mecanismos de anclaje, inspección a equipos de soldadura y oxicorte.",
      },
    },
    firmasYAprobacion: {
      nombrePersonaAutorizaTrabajo: tomarCampo(leerCamposSeccion("#firmas"), "Nombre de la persona que autoriza el trabajo"),
      firmaPersonaAutorizaTrabajo: resumirFirma(firmaQuienAutoriza, "firma://persona-autoriza"),
      cedulaCiudadaniaResponsableArea: tomarCampo(leerCamposSeccion("#firmas"), "Cédula de ciudadanía del responsable del área"),
      nombreResponsableArea: tomarCampo(leerCamposSeccion("#firmas"), "Nombre del responsable de área"),
      firmaResponsableArea: resumirFirma(firmaResponsableArea, "firma://responsable-area"),
      declaracionAceptada: declaracionFinal,
    },
  });

  const descargarJson = () => {
    const json = construirJson();
    console.log("JSON del formulario:", JSON.stringify(json, null, 2));
    window.alert("Formulario enviado correctamente");
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSection]);

  useEffect(() => {
    setDeclaracionATS(false);
    setDeclaracionFinal(false);
  }, []);

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
    const missingFinal = validateRequiredFields("#firmas");

    if (activeSection === 1 && missingGeneral.length) {
      setAvisoValidacion(`Falta completar: ${missingGeneral[0]}.`);
      setErroresCampos(Object.fromEntries(missingGeneral.map((label) => [label, `Falta completar: ${label}.`])));
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
    if (activeSection === 5 && !declaracionATS) {
      setErroresCampos({});
      setAvisoValidacion("Falta completar: debes aceptar la declaración para continuar.");
      return;
    }
    if (activeSection === 6 && (missingFinal.length || !firmaQuienAutoriza || !firmaResponsableArea || !declaracionFinal)) {
      setAvisoValidacion(`Falta completar: ${missingFinal[0] || "las firmas finales"}.`);
      setErroresCampos(Object.fromEntries(missingFinal.map((label) => [label, `Falta completar: ${label}.`])));
      return;
    }
    setAvisoValidacion("");
    setErroresCampos({});
    setActiveSection((current) => Math.min(current + 1, totalSections));
  };
  const prevSection = () => {
    setDeclaracionATS(false);
    setDeclaracionFinal(false);
    setActiveSection((current) => Math.max(current - 1, 1));
  };

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
        { ...interventorEnEdicion, firmaImagen: convertirFirmaAImagen(interventorEnEdicion.firma) },
      ]);
      setInterventorEnEdicion({
        documento: "",
        nombre: "",
        tipoDocumento: "CC",
        aptoAlturas: "Sí",
        certificadoTsa: "Sí",
        firma: "",
      });
      setAvisoValidacion("");
      setErroresCampos({});
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
              <div><strong>Version:</strong> 11</div>
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
            <SeccionATS declaracionAceptada={declaracionATS} setDeclaracionAceptada={setDeclaracionATS} avisoValidacion={avisoValidacion} />
          )}
          {activeSection === 6 && (
            <SeccionFirmas
              erroresCampos={erroresCampos}
              limpiarErrorCampo={limpiarErrorCampo}
              firmaQuienAutoriza={firmaQuienAutoriza}
              setFirmaQuienAutoriza={setFirmaQuienAutoriza}
              firmaResponsableArea={firmaResponsableArea}
              setFirmaResponsableArea={setFirmaResponsableArea}
              declaracionAceptada={declaracionFinal}
              setDeclaracionAceptada={setDeclaracionFinal}
            />
          )}

            <div className="wizard-actions">
              <button type="button" className="btn btn--ghost" onClick={prevSection} disabled={activeSection === 1}>
                Anterior
              </button>
                {activeSection < totalSections ? (
                <button type="button" className="btn btn--primary" onClick={nextSection} disabled={activeSection === 5 && !declaracionATS}>
                  Siguiente
                </button>
              ) : (
                <button type="button" className="btn btn--primary" onClick={descargarJson} disabled={!declaracionFinal}>
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
