import React from "react";
import { CheckboxGrid, SeccionDocumento, SelectField, TextArea, TextInput } from "./componentes-formulario";
import { FirmaCanvas, VistaFirma } from "./firma-canvas";
import { opcionesAccesos, opcionesEpp, listaHoras, listaMinutos, opcionesRiesgos, opcionesSiNo, opcionesTipoDocumento, opcionesTipoTrabajo, horaActual, minutoActual } from "./configuracion-formulario";

type Interventor = {
  documento: string;
  nombre: string;
  tipoDocumento: string;
  aptoAlturas: string;
  certificadoTsa: string;
  firma: string;
  firmaImagen?: string;
};

function BloqueSeleccionHora({
  label,
  dataLabel,
  horario,
  minutosLista,
}: {
  label: string;
  dataLabel: string;
  horario: string;
  minutosLista: string;
}) {
  return (
    <div className="field">
      <span className="field__label">{label}</span>
      <div className="time-pair">
        <select className="field__input" defaultValue={horario} data-label={dataLabel} required aria-label={label}>
          <option value="">HH</option>
          {listaHoras.map((hour: string) => <option key={hour} value={hour}>{hour}</option>)}
        </select>
        <select className="field__input" defaultValue={minutosLista} data-label={`Minutos de ${dataLabel.toLowerCase()}`} required aria-label={`Minutos de ${label.toLowerCase()}`}>
          <option value="">MM</option>
          {listaMinutos.map((minute: string) => <option key={minute} value={minute}>{minute}</option>)}
        </select>
      </div>
    </div>
  );
}

function TarjetaFirmaResponsable({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="card final-signature-card">{children}</div>;
}

export function SeccionDatosGenerales({
  erroresCampos,
  limpiarErrorCampo,
}: {
  erroresCampos: Record<string, string>;
  limpiarErrorCampo: (label: string) => void;
}) {
  return (
    <SeccionDocumento id="datos-generales" sectionRef={{ current: null }}>
      <div className="stack">
        <div className="card">
          <div className="subsection-title">Ubicación y fechas</div>
          <p className="subsection-description">Completa primero el lugar y las fechas del permiso.</p>
          <div className="grid grid--2">
            <TextInput label="Ciudad" type="text" required error={erroresCampos["Ciudad"]} onFieldChange={limpiarErrorCampo} />
            <TextInput label="Fecha de inicio del trabajo" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required error={erroresCampos["Fecha de inicio del trabajo"]} onFieldChange={limpiarErrorCampo} />
            <BloqueSeleccionHora label="Hora de inicio del trabajo" dataLabel="Hora de inicio del trabajo" horario={horaActual} minutosLista={minutoActual} />
            <TextInput label="Fecha de terminación del trabajo" type="date" required error={erroresCampos["Fecha de terminación del trabajo"]} onFieldChange={limpiarErrorCampo} />
            <BloqueSeleccionHora label="Hora de finalización del trabajo" dataLabel="Hora de finalización del trabajo" horario={horaActual} minutosLista={minutoActual} />
          </div>
        </div>

        <div className="card">
          <div className="subsection-title">Persona y operación</div>
          <p className="subsection-description">Identifica a quién se concede el permiso y dónde se ejecutará.</p>
          <div className="grid grid--2">
            <SelectField label="Tipo de trabajo" defaultValue="" required error={erroresCampos["Tipo de trabajo"]} onFieldChange={limpiarErrorCampo}>
              <option value="" disabled>Seleccione...</option>
              {opcionesTipoTrabajo.map((item: string) => <option key={item}>{item}</option>)}
            </SelectField>
            <TextInput label="Centro de operación" type="text" required error={erroresCampos["Centro de operación"]} onFieldChange={limpiarErrorCampo} />
            <TextInput label="Responsable del área" type="text" required error={erroresCampos["Responsable del área"]} onFieldChange={limpiarErrorCampo} />
            <TextInput label="Responsable de diligenciar el permiso" type="text" required error={erroresCampos["Responsable de diligenciar el permiso"]} onFieldChange={limpiarErrorCampo} />
          </div>
        </div>

        <div className="card">
          <div className="subsection-title">Detalles del trabajo</div>
          <p className="subsection-description">Describe la actividad y las condiciones necesarias para ejecutarla.</p>
          <div className="grid grid--2">
            <TextInput
              label="Altura del trabajo (metros)"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={5}
              required
              error={erroresCampos["Altura del trabajo (metros)"]}
              onFieldChange={limpiarErrorCampo}
              sanitize={(value) => value.replace(/\D/g, "")}
            />
            <TextInput label="Lugar donde se realizará el trabajo" type="text" wrapperClassName="field--full" required error={erroresCampos["Lugar donde se realizará el trabajo"]} onFieldChange={limpiarErrorCampo} />
            <TextArea label="Descripción y procedimiento del trabajo" rows={5} required error={erroresCampos["Descripción y procedimiento del trabajo"]} onFieldChange={limpiarErrorCampo} />
          </div>
        </div>
      </div>
    </SeccionDocumento>
  );
}

export function SeccionInterventores({
  erroresCampos,
  limpiarErrorCampo,
  interventorEnEdicion,
  setInterventorEnEdicion,
  agregarInterventor,
  interventores,
  setInterventores,
}: {
  erroresCampos: Record<string, string>;
  limpiarErrorCampo: (label: string) => void;
  interventorEnEdicion: Interventor;
  setInterventorEnEdicion: React.Dispatch<React.SetStateAction<Interventor>>;
  agregarInterventor: () => void;
  interventores: Interventor[];
  setInterventores: React.Dispatch<React.SetStateAction<Interventor[]>>;
}) {
  return (
    <SeccionDocumento id="interventores" sectionRef={{ current: null }}>
      <div className="section-note section-note--accent">
        RELACIONE CON NOMBRE Y NÚMERO DE CÉDULA A LAS PERSONAS QUE INTERVIENEN EN EL PERMISO Y EJECUCIÓN DEL TRABAJO
      </div>
      <div className="worker-actions">
        <div className="grid grid--2">
          <TextInput label="Número de documento" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={15} value={interventorEnEdicion.documento} onChange={(e) => setInterventorEnEdicion((current) => ({ ...current, documento: e.target.value.replace(/\D/g, "") }))} required error={erroresCampos["Número de documento"]} onFieldChange={limpiarErrorCampo} />
          <TextInput label="Nombre y apellido" type="text" maxLength={80} value={interventorEnEdicion.nombre} onChange={(e) => setInterventorEnEdicion((current) => ({ ...current, nombre: e.target.value.replace(/[0-9]/g, "") }))} required error={erroresCampos["Nombre y apellido"]} onFieldChange={limpiarErrorCampo} />
          <SelectField label="Tipo de documento" value={interventorEnEdicion.tipoDocumento} onChange={(e) => setInterventorEnEdicion((current) => ({ ...current, tipoDocumento: e.target.value }))} required error={erroresCampos["Tipo de documento"]} onFieldChange={limpiarErrorCampo}>
            {opcionesTipoDocumento.map((item: string) => <option key={item}>{item}</option>)}
          </SelectField>
          <SelectField label="Es apto para laborar en alturas" value={interventorEnEdicion.aptoAlturas} onChange={(e) => setInterventorEnEdicion((current) => ({ ...current, aptoAlturas: e.target.value }))} required error={erroresCampos["Es apto para laborar en alturas"]} onFieldChange={limpiarErrorCampo}>
            {opcionesSiNo.map((item: string) => <option key={item}>{item}</option>)}
          </SelectField>
          <SelectField label="Está certificado para TSA" value={interventorEnEdicion.certificadoTsa} onChange={(e) => setInterventorEnEdicion((current) => ({ ...current, certificadoTsa: e.target.value }))} required error={erroresCampos["Está certificado para TSA"]} onFieldChange={limpiarErrorCampo}>
            {opcionesSiNo.map((item: string) => <option key={item}>{item}</option>)}
          </SelectField>
        </div>
        <FirmaCanvas
          label="Firma"
          value={interventorEnEdicion.firma}
          onChange={(value) => setInterventorEnEdicion((current) => ({ ...current, firma: value }))}
          onImageChange={(value) => setInterventorEnEdicion((current) => ({ ...current, firmaImagen: value }))}
        />
        <button type="button" className="btn btn--primary" onClick={agregarInterventor} style={{ width: "fit-content", alignSelf: "center", marginTop: "16px", whiteSpace: "nowrap" }}>
          AGREGAR INTERVENTOR
        </button>
        <p className="section-note section-note--soft">Si no vas a agregar más interventores, puedes continuar con el botón Siguiente.</p>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>NOMBRE</th>
              <th>TIPO DE DOCUMENTO</th>
              <th>NÚMERO DE DOCUMENTO</th>
              <th>APTO PARA LABORAR EN ALTURAS</th>
              <th>¿ESTÁ CERTIFICADO PARA TSA?</th>
              <th>FIRMA</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {interventores.length === 0 ? (
              <tr><td colSpan={7} className="table-empty">Sin interventores agregados</td></tr>
            ) : (
              interventores.map((interventor, index) => (
                <tr key={`${interventor.documento}-${index}`}>
                  <td>{interventor.nombre}</td>
                  <td>{interventor.tipoDocumento}</td>
                  <td>{interventor.documento}</td>
                  <td>{interventor.aptoAlturas}</td>
                  <td>{interventor.certificadoTsa}</td>
                  <td>
                    <div className="firma-tabla">
                      {interventor.firmaImagen ? <img src={interventor.firmaImagen} alt={`Firma de ${interventor.nombre}`} className="firma-tabla-visual" /> : null}
                    </div>
                  </td>
                  <td>
                    <button type="button" className="btn btn--delete" style={{ background: "#dc2626", color: "#fff", borderColor: "#dc2626" }} onClick={() => setInterventores((current) => current.filter((_, currentIndex) => currentIndex !== index))}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </SeccionDocumento>
  );
}

export function SeccionMateriales({
  riesgosSeleccionados,
  setRiesgosSeleccionados,
}: {
  riesgosSeleccionados: string[];
  setRiesgosSeleccionados: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  return (
    <SeccionDocumento id="riesgos" sectionRef={{ current: null }}>
      <div className="grid grid--1">
        <TextArea label="Identificación de los materiales y/o herramientas que se van a emplear" rows={4} />
      </div>
      <div className="subsection-title">CONSIDERACIONES DE SEGURIDAD</div>
      <CheckboxGrid options={opcionesRiesgos} value={riesgosSeleccionados} onChange={setRiesgosSeleccionados} />
    </SeccionDocumento>
  );
}

export function SeccionEpp({
  elementosProteccionSeleccionados,
  sistemasAccesoSeleccionados,
  setElementosProteccionSeleccionados,
  setSistemasAccesoSeleccionados,
}: {
  elementosProteccionSeleccionados: string[];
  sistemasAccesoSeleccionados: string[];
  setElementosProteccionSeleccionados: React.Dispatch<React.SetStateAction<string[]>>;
  setSistemasAccesoSeleccionados: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  return (
    <SeccionDocumento id="epp" sectionRef={{ current: null }}>
      <div className="two-blocks">
        <div className="card">
          <div className="subsection-title">ELEMENTOS DE PROTECCIÓN PERSONAL</div>
          <CheckboxGrid options={opcionesEpp} value={elementosProteccionSeleccionados} onChange={setElementosProteccionSeleccionados} />
        </div>
        <div className="card">
          <div className="subsection-title">SISTEMAS DE ACCESOS SEGUROS</div>
          <CheckboxGrid options={opcionesAccesos} value={sistemasAccesoSeleccionados} onChange={setSistemasAccesoSeleccionados} />
        </div>
      </div>
      <br />
      <div className="card signature-note-card">
        <TextArea label="Observaciones" rows={4} />
      </div>
    </SeccionDocumento>
  );
}

export function SeccionATS({
  declaracionAceptada,
  setDeclaracionAceptada,
  avisoValidacion,
}: {
  declaracionAceptada: boolean;
  setDeclaracionAceptada: React.Dispatch<React.SetStateAction<boolean>>;
  avisoValidacion: string;
}) {
  return (
    <SeccionDocumento id="ats" sectionRef={{ current: null }}>
      <div className="alert-box">
        <div className="alert-box__strong">Este permiso NO debe otorgarse si alguna de las anteriores condiciones no se está cumpliendo</div>
        <div className="alert-box__note">En caso de tormentas, lloviznas suaves y/o vientos fuertes, se deben suspender los trabajos.</div>
      </div>
      <div className="ats-head">ANÁLISIS DE TRABAJO SEGURO</div>
      <div className="ats-head ats-head--small">DESCRIBA EL PASO A PASO DE SU ACTIVIDAD A REALIZAR IDENTIFICANDO SUS RIESGOS Y MEDIDAS DE CONTROL</div>
      <div className="ats-table">
        <div className="ats-table__head">
          <div>1. PASO A PASO DEL TRABAJO / DESCRIPCIÓN DE LA TAREA</div>
          <div>2. IDENTIFICAR PELIGROS / CONSECUENCIAS PRODUCTO DEL TRABAJO, QUE PUEDE FALLAR</div>
          <div>3. ACCIONES / CONTROLES O PROCEDIMIENTOS RECOMENDADOS / PARA MINIMIZAR EL PELIGRO AL QUE SE VA A EXPONER</div>
        </div>
        <div className="ats-table__row">
          <div className="ats-fixed-cell">Diligenciamiento de permiso de trabajo y ATS, inspección de los elementos de protección personal y equipos, traslado e inspección al sitio de trabajo con equipos y herramientas, instalación de EPCC para trabajos en alturas, inicio de la actividad, orden y aseo del sitio, cierre del permiso y término de la actividad.</div>
          <div className="ats-fixed-cell">Caídas a distinto nivel, caídas de objetos, proyección de partículas, exposición a material particulado y humos metálicos, sobreesfuerzos, posturas inadecuadas, movimientos repetitivos, exposición a ruido, exposición a radiaciones por temperaturas extremas, condiciones de la tarea y fenómenos naturales.</div>
          <div className="ats-fixed-cell">Entrenamiento en trabajo en alturas, señalización del área, plan de emergencias, permisos de trabajo, uso de EPPs y equipos de protección contra caídas, charlas de seguridad, capacitaciones en trabajos en alturas y caliente, inspección al sitio de trabajo y mecanismos de anclaje, inspección a equipos de soldadura y oxicorte.</div>
        </div>
      </div>
      <div className="declaration-box">
        <span>DECLARO QUE SOMOS CONSCIENTES DE LA RESPONSABILIDAD Y DESPUÉS DE TENER EVALUADOS LOS PELIGROS INHERENTES AL TRABAJO A SER REALIZADO AUTORIZO SU EJECUCIÓN SIEMPRE SEGUIDO DE LAS PRECAUCIONES Y DEFINICIONES ACORDADAS EN CONJUNTO CON EL TRABAJADOR(ES) QUE EJECUTAN LA TAREA. (CONSTATO QUE HE VERIFICADO QUE TODAS LAS RECOMENDACIONES DE SEGURIDAD AQUÍ CONTEMPLADAS CUMPLEN CON LOS REQUISITOS ESTABLECIDOS) ACATAREMOS LAS NORMAS, PROCEDIMIENTOS Y RECOMENDACIONES MENCIONADOS POR EL PERSONAL HSE, PARA EL SEGURO DESARROLLO DE LA LABOR.</span>
        <label className="declaration-check declaration-check--end">
          <input type="checkbox" checked={declaracionAceptada} onChange={(event) => setDeclaracionAceptada(event.target.checked)} />
          <span>DECLARO</span>
        </label>
      </div>
      {avisoValidacion ? <p className="field-helper field-helper--error">{avisoValidacion}</p> : null}
    </SeccionDocumento>
  );
}

export function SeccionFirmas({
  erroresCampos,
  limpiarErrorCampo,
  firmaQuienAutoriza,
  setFirmaQuienAutoriza,
  firmaResponsableArea,
  setFirmaResponsableArea,
  declaracionAceptada,
  setDeclaracionAceptada,
}: {
  erroresCampos: Record<string, string>;
  limpiarErrorCampo: (label: string) => void;
  firmaQuienAutoriza: string;
  setFirmaQuienAutoriza: React.Dispatch<React.SetStateAction<string>>;
  firmaResponsableArea: string;
  setFirmaResponsableArea: React.Dispatch<React.SetStateAction<string>>;
  declaracionAceptada: boolean;
  setDeclaracionAceptada: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <SeccionDocumento id="firmas" sectionRef={{ current: null }}>
      <div className="final-signature-stack">
        <TarjetaFirmaResponsable>
          <TextInput label="Nombre de la persona que autoriza el trabajo" type="text" required error={erroresCampos["Nombre de la persona que autoriza el trabajo"]} onFieldChange={limpiarErrorCampo} sanitize={(value) => value.replace(/[0-9]/g, "")} />
          <FirmaCanvas label="Firma" value={firmaQuienAutoriza} onChange={setFirmaQuienAutoriza} />
        </TarjetaFirmaResponsable>
        <TarjetaFirmaResponsable>
          <TextInput label="Cédula de ciudadanía del responsable del área" type="text" inputMode="numeric" required error={erroresCampos["Cédula de ciudadanía del responsable del área"]} onFieldChange={limpiarErrorCampo} sanitize={(value) => value.replace(/\D/g, "")} />
          <TextInput label="Nombre del responsable de área" type="text" required error={erroresCampos["Nombre del responsable de área"]} onFieldChange={limpiarErrorCampo} sanitize={(value) => value.replace(/[0-9]/g, "")} />
          <FirmaCanvas label="Firma del responsable del área" value={firmaResponsableArea} onChange={setFirmaResponsableArea} />
        </TarjetaFirmaResponsable>
      </div>
      <div className="declaration-box declaration-box--full">
        <span>DECLARO QUE HE LEÍDO, ENTENDIDO Y ME COMPROMETO A CUMPLIR LAS CONDICIONES DE SEGURIDAD AQUÍ ESTABLECIDAS.</span>
        <label className="declaration-check declaration-check--end">
          <input type="checkbox" checked={declaracionAceptada} onChange={(event) => setDeclaracionAceptada(event.target.checked)} />
          <span>DECLARO</span>
        </label>
      </div>
    </SeccionDocumento>
  );
}
