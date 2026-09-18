/**
 * Catálogo de obligaciones evaluadas y motor de diagnóstico.
 *
 * Regla de esta capa: ninguna obligación entra sin norma citada, autoridad
 * competente y criterio de verificación que el propio usuario pueda comprobar.
 * Y ninguna produce un monto de sanción: el monto depende de la conducta, la
 * reincidencia y el criterio de la autoridad, y presentarlo como cálculo
 * automático sería una afirmación jurídica sin sustento.
 */

export type Eje = 'laboral' | 'convivencia' | 'datos' | 'digital' | 'sst';

export type Respuesta = 'si' | 'no' | 'parcial' | 'noAplica' | 'sinResponder';

export type Severidad = 'critica' | 'alta' | 'media';

export interface Obligacion {
  readonly id: string;
  readonly eje: Eje;
  readonly titulo: string;
  /** Pregunta de verificación, redactada para que se responda con un documento. */
  readonly pregunta: string;
  /** Qué documento o hecho demuestra el cumplimiento. */
  readonly evidencia: string;
  readonly norma: string;
  readonly autoridad: string;
  readonly severidad: Severidad;
  /** Días hábiles sugeridos para cerrar la brecha, si está incumplida. */
  readonly plazoCierre: number;
  /** Fecha límite legal ya vencida o vigente, si la norma la fija. */
  readonly plazoLegal?: string;
  /** Condición de aplicabilidad, cuando la obligación no es universal. */
  readonly aplicaSi?: (p: PerfilEmpresa) => boolean;
  readonly porQueImporta: string;
}

export interface PerfilEmpresa {
  readonly nombre: string;
  readonly empleados: number;
  readonly tratadatosPersonales: boolean;
  /** Activos totales expresados en salarios mínimos mensuales. */
  readonly activosEnSmmlv: number;
  readonly tieneTrabajoRemoto: boolean;
}

export const EJES: Record<Eje, { rotulo: string; descripcion: string }> = {
  laboral: {
    rotulo: 'Laboral',
    descripcion: 'Reglamento interno, jornada, recargos y debido proceso.',
  },
  convivencia: {
    rotulo: 'Convivencia y acoso',
    descripcion: 'Acoso laboral, acoso sexual y comité de convivencia.',
  },
  datos: {
    rotulo: 'Datos personales',
    descripcion: 'Tratamiento, autorización, política y registro ante la SIC.',
  },
  digital: {
    rotulo: 'Digital y probatorio',
    descripcion: 'Firma electrónica, trazabilidad y desconexión laboral.',
  },
  sst: {
    rotulo: 'Seguridad y salud',
    descripcion: 'Sistema de gestión, COPASST y exámenes ocupacionales.',
  },
};

/**
 * Las obligaciones se ordenan por severidad y por vencimiento del plazo legal:
 * lo que ya está vencido va primero, porque es exposición actual y no riesgo
 * futuro.
 */
export const OBLIGACIONES: readonly Obligacion[] = [
  {
    id: 'rit-2466',
    eje: 'laboral',
    titulo: 'Reglamento Interno de Trabajo actualizado',
    pregunta: '¿Su Reglamento Interno de Trabajo se actualizó después del 25 de junio de 2026?',
    evidencia: 'RIT con fecha posterior, acta de socialización y registro de asistencia.',
    norma: 'Ley 2466 de 2025 · CST arts. 104 a 125 · Circular MinTrabajo 0048 de 2026',
    autoridad: 'Ministerio del Trabajo',
    severidad: 'critica',
    plazoCierre: 10,
    plazoLegal: '2026-06-25',
    porQueImporta:
      'El plazo venció. La Circular 0048 de 2026 precisó que no haber actualizado el reglamento no justifica dejar de aplicar las garantías de debido proceso: la empresa queda obligada igual, pero sin el documento que le permite probarlo.',
  },
  {
    id: 'rit-socializacion',
    eje: 'laboral',
    titulo: 'Socialización del reglamento con evidencia',
    pregunta: '¿Tiene acta de socialización del reglamento con registro de asistencia?',
    evidencia: 'Acta firmada o acuse de lectura con sello de tiempo por cada trabajador.',
    norma: 'CST art. 120 · Ley 2466 de 2025',
    autoridad: 'Ministerio del Trabajo',
    severidad: 'alta',
    plazoCierre: 10,
    porQueImporta:
      'Un reglamento que nadie puede probar que conoció no es oponible al trabajador en un proceso disciplinario.',
  },
  {
    id: 'protocolo-2365',
    eje: 'convivencia',
    titulo: 'Protocolo de acoso sexual laboral',
    pregunta: '¿Tiene protocolo de prevención y atención del acoso sexual conforme a la Ley 2365?',
    evidencia:
      'Protocolo adoptado, ruta de atención publicada y canal de recepción con reserva de identidad.',
    norma: 'Ley 2365 de 2024 · Resolución MinTrabajo 2764 de 2022',
    autoridad: 'Ministerio del Trabajo',
    severidad: 'critica',
    plazoCierre: 15,
    porQueImporta:
      'La ley exige medidas de prevención, una ruta de atención y protección inmediata de la persona denunciante. Cubre contratistas, practicantes y entornos digitales, no solo a la planta de personal.',
  },
  {
    id: 'comite-convivencia',
    eje: 'convivencia',
    titulo: 'Comité de Convivencia Laboral conformado y sesionando',
    pregunta: '¿Su Comité de Convivencia Laboral está conformado y sesiona cada trimestre?',
    evidencia: 'Acta de conformación, designación de representantes y actas trimestrales.',
    norma: 'Ley 1010 de 2006 · Resolución 652 de 2012 · Resolución 1356 de 2012',
    autoridad: 'Ministerio del Trabajo',
    severidad: 'alta',
    plazoCierre: 20,
    porQueImporta:
      'La conformación es obligatoria con independencia del tamaño de la empresa. La periodicidad mínima de sesiones es trimestral y se prueba con actas.',
  },
  {
    id: 'politica-1010',
    eje: 'convivencia',
    titulo: 'Política de prevención del acoso laboral',
    pregunta: '¿Tiene una política de prevención del acoso laboral incorporada al reglamento?',
    evidencia: 'Capítulo del RIT o política independiente, con mecanismo de denuncia.',
    norma: 'Ley 1010 de 2006, arts. 9 y 10',
    autoridad: 'Ministerio del Trabajo',
    severidad: 'media',
    plazoCierre: 15,
    porQueImporta:
      'La ley exige que el reglamento prevea mecanismos de prevención y un procedimiento interno confidencial para superar las conductas de acoso.',
  },
  {
    id: 'politica-datos',
    eje: 'datos',
    titulo: 'Política de tratamiento de datos personales',
    pregunta: '¿Tiene una política de tratamiento de datos personales publicada y accesible?',
    evidencia: 'Política con finalidad, derechos del titular, canal de atención y responsable.',
    norma: 'Ley 1581 de 2012 · Decreto 1074 de 2015, art. 2.2.2.25.3.1',
    autoridad: 'Superintendencia de Industria y Comercio',
    severidad: 'alta',
    plazoCierre: 15,
    aplicaSi: (p) => p.tratadatosPersonales,
    porQueImporta:
      'Toda empresa que trate datos personales —y una empresa con nómina los trata— debe adoptarla. Sin ella, el propio formulario de contacto del sitio web está incumplido.',
  },
  {
    id: 'rnbd',
    eje: 'datos',
    titulo: 'Registro de bases de datos ante el RNBD',
    pregunta: '¿Registró sus bases de datos personales ante la SIC?',
    evidencia: 'Constancia de registro en el RNBD y actualización anual.',
    norma: 'Ley 1581 de 2012 · Circular Externa SIC 005 de 2017',
    autoridad: 'Superintendencia de Industria y Comercio',
    severidad: 'alta',
    plazoCierre: 20,
    aplicaSi: (p) => p.tratadatosPersonales && p.activosEnSmmlv >= 100_000,
    porQueImporta:
      'La obligación de registro recae sobre sociedades y entidades con activos superiores a 100 000 UVT o a 100 000 SMMLV, según el criterio de la Circular 005 de 2017. Verifique su caso antes de descartarla.',
  },
  {
    id: 'autorizacion-titular',
    eje: 'datos',
    titulo: 'Autorización expresa, previa e informada del titular',
    pregunta: '¿Recoge autorización expresa de los titulares antes de tratar sus datos?',
    evidencia: 'Formato de autorización con finalidad específica y prueba de su otorgamiento.',
    norma: 'Ley 1581 de 2012, arts. 9 y 12',
    autoridad: 'Superintendencia de Industria y Comercio',
    severidad: 'critica',
    plazoCierre: 10,
    aplicaSi: (p) => p.tratadatosPersonales,
    porQueImporta:
      'La autorización debe ser previa, expresa e informada, y la carga de probarla es del responsable. Si la finalidad incluye analítica o perfilamiento, debe decirlo.',
  },
  {
    id: 'canal-titulares',
    eje: 'datos',
    titulo: 'Canal de atención de derechos del titular',
    pregunta: '¿Tiene un canal operativo para consultas y reclamos de los titulares?',
    evidencia: 'Canal publicado, responsable asignado y registro de las solicitudes atendidas.',
    norma: 'Ley 1581 de 2012, arts. 14 y 15',
    autoridad: 'Superintendencia de Industria y Comercio',
    severidad: 'media',
    plazoCierre: 15,
    aplicaSi: (p) => p.tratadatosPersonales,
    porQueImporta:
      'Las consultas se atienden en 10 días hábiles y los reclamos en 15. Sin canal ni responsable, esos términos corren igual.',
  },
  {
    id: 'firma-electronica',
    eje: 'digital',
    titulo: 'Firma electrónica con trazabilidad probatoria',
    pregunta: '¿Sus firmas electrónicas dejan trazabilidad utilizable como prueba?',
    evidencia: 'Manifiesto con huella del documento, sello de tiempo y atribución al firmante.',
    norma: 'Ley 527 de 1999, arts. 6 a 12 · Decreto 2364 de 2012',
    autoridad: 'Juez laboral o civil, en sede probatoria',
    severidad: 'media',
    plazoCierre: 20,
    porQueImporta:
      'Una imagen de firma pegada en un PDF no acredita integridad ni atribución. Lo que se discute en un proceso es si el documento pudo alterarse después de firmado.',
  },
  {
    id: 'desconexion',
    eje: 'digital',
    titulo: 'Política de desconexión laboral',
    pregunta: '¿Adoptó una política de desconexión laboral?',
    evidencia: 'Política escrita, socializada e incorporada al reglamento.',
    norma: 'Ley 2191 de 2022',
    autoridad: 'Ministerio del Trabajo',
    severidad: 'media',
    plazoCierre: 15,
    aplicaSi: (p) => p.tieneTrabajoRemoto || p.empleados >= 10,
    porQueImporta:
      'La ley obliga a los empleadores a contar con una política que garantice el derecho a no atender comunicaciones fuera de la jornada, con procedimiento de queja.',
  },
  {
    id: 'sgsst',
    eje: 'sst',
    titulo: 'Sistema de Gestión de Seguridad y Salud en el Trabajo',
    pregunta: '¿Tiene implementado el SG-SST y hizo la autoevaluación de estándares mínimos?',
    evidencia: 'Autoevaluación anual, plan de mejora y plan anual de trabajo firmado.',
    norma: 'Decreto 1072 de 2015 · Resolución 0312 de 2019',
    autoridad: 'Ministerio del Trabajo',
    severidad: 'alta',
    plazoCierre: 30,
    porQueImporta:
      'Los estándares mínimos aplicables dependen del número de trabajadores y de la clase de riesgo, pero ninguna empresa con personal está exenta del sistema.',
  },
  {
    id: 'copasst',
    eje: 'sst',
    titulo: 'COPASST o vigía de seguridad y salud',
    pregunta: '¿Conformó el COPASST, o designó vigía si tiene menos de 10 trabajadores?',
    evidencia: 'Acta de conformación o designación y actas de reunión mensual.',
    norma: 'Decreto 1072 de 2015, art. 2.2.4.6.8 · Resolución 2013 de 1986',
    autoridad: 'Ministerio del Trabajo',
    severidad: 'media',
    plazoCierre: 20,
    porQueImporta:
      'Con diez o más trabajadores se conforma comité paritario; con menos, se designa un vigía. La obligación no desaparece con el tamaño.',
  },
  {
    id: 'examenes-ocupacionales',
    eje: 'sst',
    titulo: 'Exámenes médicos ocupacionales',
    pregunta: '¿Practica exámenes de ingreso, periódicos y de retiro?',
    evidencia: 'Certificados de aptitud y concepto médico, con custodia reservada.',
    norma: 'Resolución 2346 de 2007 · Resolución 0312 de 2019',
    autoridad: 'Ministerio del Trabajo',
    severidad: 'media',
    plazoCierre: 30,
    porQueImporta:
      'El examen de retiro protege al empleador frente a reclamaciones posteriores por enfermedad laboral. Su historia clínica es dato sensible y no puede reposar en el expediente ordinario.',
  },
] as const;

/* ══ Motor de diagnóstico ════════════════════════════════════════ */

export type EstadoBrecha = 'cumple' | 'parcial' | 'incumple' | 'noAplica' | 'sinEvaluar';

export interface Brecha {
  readonly obligacion: Obligacion;
  readonly respuesta: Respuesta;
  readonly estado: EstadoBrecha;
  /** Puntos de riesgo aportados: 0 cuando cumple o no aplica. */
  readonly riesgo: number;
  readonly vencido: boolean;
}

export interface Diagnostico {
  readonly perfil: PerfilEmpresa;
  readonly fecha: string;
  readonly brechas: readonly Brecha[];
  readonly aplicables: number;
  readonly evaluadas: number;
  readonly cumplidas: number;
  readonly incumplidas: number;
  readonly parciales: number;
  /** 0 a 100. 100 es cumplimiento pleno de lo evaluado. */
  readonly indice: number;
  readonly nivel: 'critico' | 'deficiente' | 'aceptable' | 'solido';
  readonly avisos: readonly string[];
}

const PESO_SEVERIDAD: Record<Severidad, number> = { critica: 5, alta: 3, media: 1 };

export function aplica(o: Obligacion, perfil: PerfilEmpresa): boolean {
  return o.aplicaSi ? o.aplicaSi(perfil) : true;
}

function estadoDe(r: Respuesta): EstadoBrecha {
  switch (r) {
    case 'si':
      return 'cumple';
    case 'parcial':
      return 'parcial';
    case 'no':
      return 'incumple';
    case 'noAplica':
      return 'noAplica';
    default:
      return 'sinEvaluar';
  }
}

export function evaluar(
  perfil: PerfilEmpresa,
  respuestas: Readonly<Record<string, Respuesta>>,
  hoy: string,
): Diagnostico {
  const brechas: Brecha[] = [];

  for (const o of OBLIGACIONES) {
    const respuesta = aplica(o, perfil) ? (respuestas[o.id] ?? 'sinResponder') : 'noAplica';
    const estado = estadoDe(respuesta);
    const peso = PESO_SEVERIDAD[o.severidad];
    const riesgo = estado === 'incumple' ? peso : estado === 'parcial' ? peso / 2 : 0;
    brechas.push({
      obligacion: o,
      respuesta,
      estado,
      riesgo,
      vencido: Boolean(o.plazoLegal && o.plazoLegal < hoy && estado !== 'cumple'),
    });
  }

  // Lo vencido primero, luego por severidad, luego por estado.
  const orden: Record<EstadoBrecha, number> = {
    incumple: 0,
    parcial: 1,
    sinEvaluar: 2,
    cumple: 3,
    noAplica: 4,
  };
  brechas.sort(
    (a, b) =>
      Number(b.vencido) - Number(a.vencido) ||
      orden[a.estado] - orden[b.estado] ||
      PESO_SEVERIDAD[b.obligacion.severidad] - PESO_SEVERIDAD[a.obligacion.severidad],
  );

  const aplicables = brechas.filter((b) => b.estado !== 'noAplica');
  const evaluadas = aplicables.filter((b) => b.estado !== 'sinEvaluar');
  const cumplidas = evaluadas.filter((b) => b.estado === 'cumple').length;
  const parciales = evaluadas.filter((b) => b.estado === 'parcial').length;
  const incumplidas = evaluadas.filter((b) => b.estado === 'incumple').length;

  const pesoTotal = evaluadas.reduce((s, b) => s + PESO_SEVERIDAD[b.obligacion.severidad], 0);
  const riesgoTotal = evaluadas.reduce((s, b) => s + b.riesgo, 0);
  const indice = pesoTotal === 0 ? 0 : Math.round((1 - riesgoTotal / pesoTotal) * 100);

  const nivel: Diagnostico['nivel'] =
    evaluadas.length === 0
      ? 'critico'
      : indice >= 90
        ? 'solido'
        : indice >= 70
          ? 'aceptable'
          : indice >= 40
            ? 'deficiente'
            : 'critico';

  const avisos: string[] = [];
  const pendientes = aplicables.length - evaluadas.length;
  if (pendientes > 0) {
    avisos.push(
      `Quedan ${pendientes} obligaciones sin responder. El índice se calcula solo sobre lo evaluado.`,
    );
  }
  const vencidas = brechas.filter((b) => b.vencido).length;
  if (vencidas > 0) {
    avisos.push(
      `${vencidas} obligaciones tienen un plazo legal ya vencido. Son exposición actual, no riesgo futuro.`,
    );
  }
  avisos.push(
    'Este diagnóstico no cuantifica sanciones. El monto depende de la conducta, la reincidencia y el criterio de la autoridad.',
  );

  return {
    perfil,
    fecha: hoy,
    brechas,
    aplicables: aplicables.length,
    evaluadas: evaluadas.length,
    cumplidas,
    incumplidas,
    parciales,
    indice,
    nivel,
    avisos,
  };
}

/* ══ Plan de cierre ══════════════════════════════════════════════ */

export interface TareaCierre {
  readonly obligacion: Obligacion;
  readonly orden: number;
  readonly vence: string;
  readonly diasHabiles: number;
}

/**
 * Ordena las brechas abiertas en un plan con fechas. Las obligaciones con
 * plazo legal vencido van primero y con el plazo de cierre más corto.
 */
export function planDeCierre(
  d: Diagnostico,
  desde: string,
  sumarHabiles: (iso: string, dias: number) => string,
): readonly TareaCierre[] {
  return d.brechas
    .filter((b) => b.estado === 'incumple' || b.estado === 'parcial')
    .map((b, i) => {
      // Una brecha parcial cuesta la mitad del esfuerzo de una abierta.
      const dias =
        b.estado === 'parcial'
          ? Math.max(5, Math.round(b.obligacion.plazoCierre / 2))
          : b.obligacion.plazoCierre;
      return {
        obligacion: b.obligacion,
        orden: i + 1,
        diasHabiles: dias,
        vence: sumarHabiles(desde, dias),
      };
    });
}
