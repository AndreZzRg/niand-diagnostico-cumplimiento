/**
 * Módulo «Cuestionario»: perfil de la empresa y las preguntas de verificación.
 * Cada pregunta se responde mirando un documento, no de memoria.
 */
import { Eraser, FileCheck2 } from 'lucide-react';

import {
  Boton,
  Campo,
  Dato,
  Entrada,
  Insignia,
  Interruptor,
  Llamado,
  Tarjeta,
  cx,
} from '../brand/ui';
import { EJES, OBLIGACIONES, aplica, type Eje, type Respuesta } from '../domain/catalogo';
import { useEstado } from '../store';
import { NIVEL, SeveridadBadge, useDiagnostico } from './comun';

const OPCIONES: ReadonlyArray<[Respuesta, string]> = [
  ['si', 'Sí'],
  ['parcial', 'Parcial'],
  ['no', 'No'],
];

export function PanelCuestionario() {
  const { perfil, respuestas, fecha, setPerfil, responder, setFecha, limpiarRespuestas } =
    useEstado();
  const d = useDiagnostico();
  const nivel = NIVEL[d.nivel];

  const porEje = (eje: Eje) => OBLIGACIONES.filter((o) => o.eje === eje && aplica(o, perfil));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Dato
          rotulo="Índice de cumplimiento"
          valor={`${d.indice} / 100`}
          detalle={nivel.rotulo}
          tono={nivel.tono}
        />
        <Dato
          rotulo="Obligaciones aplicables"
          valor={d.aplicables}
          detalle={`${d.evaluadas} evaluadas`}
        />
        <Dato rotulo="Cumplidas" valor={d.cumplidas} tono="ok" />
        <Dato
          rotulo="Brechas abiertas"
          valor={d.incumplidas + d.parciales}
          detalle={`${d.incumplidas} sin cumplir · ${d.parciales} parciales`}
          tono={d.incumplidas > 0 ? 'riesgo' : 'neutro'}
        />
      </div>

      <Tarjeta
        titulo="Perfil de la empresa"
        descripcion="Determina qué obligaciones le son exigibles."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Campo etiqueta="Nombre o razón social">
            {(id) => (
              <Entrada
                id={id}
                value={perfil.nombre}
                placeholder="Opcional, solo para el reporte"
                onChange={(e) => setPerfil({ nombre: e.target.value })}
              />
            )}
          </Campo>
          <Campo etiqueta="Número de trabajadores">
            {(id) => (
              <Entrada
                id={id}
                type="number"
                min={1}
                value={perfil.empleados}
                onChange={(e) => setPerfil({ empleados: Number(e.target.value) })}
              />
            )}
          </Campo>
          <Campo
            etiqueta="Activos totales (en SMMLV)"
            ayuda="Determina la exigibilidad del registro ante el RNBD."
          >
            {(id) => (
              <Entrada
                id={id}
                type="number"
                min={0}
                step={1000}
                value={perfil.activosEnSmmlv}
                onChange={(e) => setPerfil({ activosEnSmmlv: Number(e.target.value) })}
              />
            )}
          </Campo>
          <Campo etiqueta="Fecha del diagnóstico">
            {(id) => (
              <Entrada
                id={id}
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            )}
          </Campo>
        </div>

        <div className="mt-5 space-y-3 border-t border-borde pt-4">
          <div className="flex items-center gap-3">
            <Interruptor
              activo={perfil.tratadatosPersonales}
              onChange={(v) => setPerfil({ tratadatosPersonales: v })}
              etiqueta="Trata datos personales"
            />
            <span className="text-sm">
              <strong>Trata datos personales</strong>
              <span className="block text-xs text-texto-3">
                Una empresa con nómina los trata. Responda «no» solo si no conserva dato alguno de
                personas naturales.
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Interruptor
              activo={perfil.tieneTrabajoRemoto}
              onChange={(v) => setPerfil({ tieneTrabajoRemoto: v })}
              etiqueta="Tiene trabajo remoto o teletrabajo"
            />
            <span className="text-sm">
              <strong>Trabajo remoto o teletrabajo</strong>
              <span className="block text-xs text-texto-3">
                Activa la obligación de desconexión laboral de la Ley 2191 de 2022.
              </span>
            </span>
          </div>
        </div>
      </Tarjeta>

      <Llamado tono="info" titulo="Cómo responder" icono={<FileCheck2 size={18} />}>
        Responda <strong>sí</strong> solo si puede señalar el documento que lo prueba.{' '}
        <strong>Parcial</strong> significa que existe el documento pero le falta socialización,
        actualización o evidencia. Una obligación cumplida que no se puede probar no se puede
        defender en una inspección.
      </Llamado>

      {(Object.keys(EJES) as Eje[]).map((eje) => {
        const obligaciones = porEje(eje);
        if (obligaciones.length === 0) return null;
        return (
          <Tarjeta key={eje} titulo={EJES[eje].rotulo} descripcion={EJES[eje].descripcion}>
            <div className="space-y-3">
              {obligaciones.map((o) => (
                <div key={o.id} className="rounded-xl border border-borde bg-superficie-3 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <SeveridadBadge severidad={o.severidad} />
                        {o.plazoLegal && o.plazoLegal < fecha && (
                          <Insignia tono="riesgo">Plazo vencido</Insignia>
                        )}
                      </div>
                      <p className="text-sm font-medium">{o.pregunta}</p>
                      <p className="mt-1 text-xs text-texto-3">
                        <strong>Evidencia:</strong> {o.evidencia}
                      </p>
                      <p className="eyebrow mt-1.5">{o.norma}</p>
                    </div>

                    <div
                      className="flex shrink-0 gap-1 rounded-xl border border-borde bg-superficie p-1"
                      role="group"
                      aria-label={o.pregunta}
                    >
                      {OPCIONES.map(([valor, rotulo]) => {
                        const activo = respuestas[o.id] === valor;
                        return (
                          <button
                            key={valor}
                            type="button"
                            aria-pressed={activo}
                            onClick={() => responder(o.id, valor)}
                            className={cx(
                              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                              activo
                                ? valor === 'si'
                                  ? 'bg-senal text-white'
                                  : valor === 'parcial'
                                    ? 'bg-ambar-suave text-tinta'
                                    : 'bg-alerta text-white'
                                : 'text-texto-2 hover:bg-superficie-2',
                            )}
                          >
                            {rotulo}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-medium text-marca">
                      Por qué importa
                    </summary>
                    <p className="mt-2 text-sm text-texto-2">{o.porQueImporta}</p>
                    <p className="mt-2 text-xs text-texto-3">
                      Autoridad competente: {o.autoridad}.
                    </p>
                  </details>
                </div>
              ))}
            </div>
          </Tarjeta>
        );
      })}

      <div className="flex justify-end">
        <Boton variante="secundario" onClick={limpiarRespuestas}>
          <Eraser size={15} /> Limpiar respuestas
        </Boton>
      </div>
    </div>
  );
}
