export const opcionesTipoTrabajo = ["Rutinario", "Ocasional"];
export const opcionesTipoDocumento = ["CC", "CE", "TI"];
export const opcionesSiNo = ["Sí", "No"];
export const listaHoras = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
export const listaMinutos = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));

const riesgosList = [
  "Lesiones osteomusculares",
  "Cambios bruscos de temperatura",
  "Electrocución",
  "Asfixia",
  "Explosión",
  "Frío",
  "Afectación de la flora",
  "Caídas de diferente nivel",
  "Cortaduras o punzonamientos",
  "Atrapamiento",
  "Incendio",
  "Vibraciones",
  "Alteración del aire",
  "Afectación de la fauna",
  "Caídas al mismo nivel",
  "Corrientes de aire",
  "Atropellamiento",
  "Infecciones",
  "Calor",
  "Alteración del suelo",
  "Otros ¿cuál?",
];

const eppList = [
  "Guantes",
  "Protección respiratoria",
  "Dotación",
  "Eslinga para detención de caídas",
  "Mosquetón",
  "Línea de vida portátil",
  "Protección auditiva",
  "Casco de seguridad con barbiquejo",
  "Eslinga de posicionamiento",
  "Anclajes portátiles (Tie off)",
  "Arrestador de caídas",
  "Línea de vida horizontal fija",
  "Gafas de seguridad",
  "Botas de seguridad",
  "Arnés de cuerpo completo",
  "Línea de vida vertical fija",
  "Anclajes fijos",
];

const accesosList = [
  "Andamios",
  "Escalera de tijera",
  "Plataformas fijas",
  "Escalera de extensión",
  "Escalera tipo gato",
  "Elevadores de personal",
  "Asistencia mecánica",
  "Pretales",
];

export const opcionesRiesgos = riesgosList;
export const opcionesEpp = eppList;
export const opcionesAccesos = accesosList;

const now = new Date();
export const horaActual = String(now.getHours()).padStart(2, "0");
export const minutoActual = String(now.getMinutes()).padStart(2, "0");

export const etiquetasPasos = [
  "Datos generales",
  "Interventores",
  "Materiales y seguridad",
  "EPP y accesos",
  "ATS",
  "Firmas y aprobación final",
] as const;
