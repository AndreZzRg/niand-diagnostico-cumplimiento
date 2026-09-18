/**
 * Módulo «Plan de cierre»: las brechas abiertas convertidas en tareas con
 * fecha, calculadas en días hábiles sobre el calendario colombiano.
 */
import { CalendarClock, Download } from 'lucide-react';

import { Boton, Dato, Insignia, Llamado, Tabla, Tarjeta, Td, Th, Vacio } from '../brand/ui';
import { planDeCierre } from '../domain/catalogo';
import { estadoPlazo, habilesEntre, sumarHabiles } from '../lib/fechas';
import { exportarCSV } from '../lib/exportar';
import { fechaLarga, plural } from '../lib/formato';
import { SeveridadBadge, useDiagnostico } from './comun';

const TONO_PLAZO = {
  vencido: 'riesgo',
  critico: 'riesgo',
  proximo: 'alerta',
  holgado: 'ok',
} as const;

export function PanelPlan() {
  const d = useDiagnostico();
  const plan = planDeCierre(d, d.fecha, sumarHabiles);

  const descargar = () =>
    exportarCSV(
      [
        ['Plan de cierre de brechas'],
        ['Empresa', d.perfil.nombre || 'Sin nombre', 'Desde', d.fecha],
        [],
        ['Orden', 'Obligación', 'Severidad', 'Días hábiles', 'Vence', 'Entregable', 'Norma'],
        ...plan.map((t) => [
          t.orden,
          t.obligacion.titulo,
          t.obligacion.severidad,
          t.diasHabiles,
          t.vence,
          t.obligacion.evidencia,
          t.obligacion.norma,
        ]),
      ],
      'plan-cierre',
    );

  if (plan.length === 0) {
    return (
      <Vacio titulo="No hay brechas que cerrar">
        Responda el cuestionario. Si ya lo hizo y no aparece nada aquí, es porque todo lo evaluado
        está cumplido: conserve la evidencia y vuelva a diagnosticar cada trimestre.
      </Vacio>
    );
  }

  const ultimo = plan.reduce((max, t) => (t.vence > max ? t.vence : max), plan[0]!.vence);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Dato rotulo="Tareas del plan" valor={plan.length} tono="marca" />
        <Dato
          rotulo="Cierre completo"
          valor={fechaLarga(ultimo)}
          detalle={plural(habilesEntre(d.fecha, ultimo), 'día hábil', 'días hábiles')}
        />
        <Dato
          rotulo="Críticas primero"
          valor={plan.filter((t) => t.obligacion.severidad === 'critica').length}
          tono="riesgo"
          detalle="Encabezan el plan"
        />
      </div>

      <Llamado
        tono="marca"
        titulo="Cómo se calcularon las fechas"
        icono={<CalendarClock size={18} />}
      >
        Los plazos corren en <strong>días hábiles</strong>, descontando sábados, domingos y los
        dieciocho festivos nacionales de Colombia, incluidos los trasladados al lunes por la Ley 51
        de 1983. Son plazos de gestión sugeridos por severidad, no términos legales: donde la norma
        fija un término, la columna de la obligación lo indica.
      </Llamado>

      <Tarjeta
        titulo="Plan de cierre"
        descripcion={`Desde el ${fechaLarga(d.fecha)}`}
        acciones={
          <Boton variante="secundario" tamano="sm" onClick={descargar}>
            <Download size={14} /> CSV
          </Boton>
        }
      >
        <Tabla>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>Obligación y entregable</Th>
              <Th>Severidad</Th>
              <Th numerico>Días</Th>
              <Th>Vence</Th>
            </tr>
          </thead>
          <tbody>
            {plan.map((t) => {
              const estado = estadoPlazo(t.vence, d.fecha);
              return (
                <tr key={t.obligacion.id}>
                  <Td numerico className="font-mono text-texto-3">
                    {t.orden}
                  </Td>
                  <Td>
                    <span className="font-medium">{t.obligacion.titulo}</span>
                    <span className="block text-xs text-texto-2">{t.obligacion.evidencia}</span>
                    <span className="eyebrow block">{t.obligacion.norma}</span>
                  </Td>
                  <Td>
                    <SeveridadBadge severidad={t.obligacion.severidad} />
                  </Td>
                  <Td numerico>{t.diasHabiles}</Td>
                  <Td>
                    <Insignia tono={TONO_PLAZO[estado]}>{fechaLarga(t.vence)}</Insignia>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Tabla>
      </Tarjeta>
    </div>
  );
}
