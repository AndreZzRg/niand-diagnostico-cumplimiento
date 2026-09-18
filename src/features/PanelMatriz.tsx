/**
 * Módulo «Matriz de brechas»: el resultado ordenado por exposición.
 */
import { Download, Info } from 'lucide-react';

import { Boton, Dato, Insignia, Llamado, Tabla, Tarjeta, Td, Th, Vacio } from '../brand/ui';
import { EJES } from '../domain/catalogo';
import { exportarCSV } from '../lib/exportar';
import { fechaLarga } from '../lib/formato';
import { EstadoBadge, NIVEL, ROTULO_ESTADO, SeveridadBadge, useDiagnostico } from './comun';

export function PanelMatriz() {
  const d = useDiagnostico();
  const nivel = NIVEL[d.nivel];

  const descargar = () =>
    exportarCSV(
      [
        ['Matriz de brechas de cumplimiento'],
        ['Empresa', d.perfil.nombre || 'Sin nombre', 'Fecha', d.fecha],
        ['Índice', `${d.indice}/100`, 'Nivel', nivel.rotulo],
        [],
        [
          'Eje',
          'Obligación',
          'Estado',
          'Severidad',
          'Plazo vencido',
          'Norma',
          'Autoridad',
          'Evidencia exigible',
        ],
        ...d.brechas.map((b) => [
          EJES[b.obligacion.eje].rotulo,
          b.obligacion.titulo,
          ROTULO_ESTADO[b.estado],
          b.obligacion.severidad,
          b.vencido ? 'Sí' : 'No',
          b.obligacion.norma,
          b.obligacion.autoridad,
          b.obligacion.evidencia,
        ]),
      ],
      'matriz-brechas',
    );

  const abiertas = d.brechas.filter((b) => b.estado === 'incumple' || b.estado === 'parcial');

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
          rotulo="Brechas abiertas"
          valor={abiertas.length}
          tono={abiertas.length ? 'riesgo' : 'ok'}
        />
        <Dato
          rotulo="Con plazo vencido"
          valor={d.brechas.filter((b) => b.vencido).length}
          tono="riesgo"
          detalle="Exposición actual"
        />
        <Dato rotulo="Fecha del diagnóstico" valor={fechaLarga(d.fecha)} />
      </div>

      {d.evaluadas === 0 ? (
        <Vacio titulo="Todavía no hay nada que mostrar">
          Responda el cuestionario y la matriz se construye sola, ordenada por exposición.
        </Vacio>
      ) : (
        <Tarjeta
          titulo="Matriz de brechas"
          descripcion="Ordenada por plazo vencido, luego por estado y severidad."
          acciones={
            <Boton variante="secundario" tamano="sm" onClick={descargar}>
              <Download size={14} /> CSV
            </Boton>
          }
        >
          <Tabla>
            <thead>
              <tr>
                <Th>Obligación</Th>
                <Th>Estado</Th>
                <Th>Severidad</Th>
                <Th>Autoridad</Th>
              </tr>
            </thead>
            <tbody>
              {d.brechas.map((b) => (
                <tr key={b.obligacion.id} className={b.vencido ? 'bg-alerta/5' : undefined}>
                  <Td>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{b.obligacion.titulo}</span>
                      {b.vencido && <Insignia tono="riesgo">Vencido</Insignia>}
                    </div>
                    <span className="eyebrow block">
                      {EJES[b.obligacion.eje].rotulo} · {b.obligacion.norma}
                    </span>
                  </Td>
                  <Td>
                    <EstadoBadge estado={b.estado} />
                  </Td>
                  <Td>
                    <SeveridadBadge severidad={b.obligacion.severidad} />
                  </Td>
                  <Td className="text-xs text-texto-2">{b.obligacion.autoridad}</Td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        </Tarjeta>
      )}

      {d.avisos.map((a) => (
        <Llamado key={a} tono="info" icono={<Info size={18} />}>
          {a}
        </Llamado>
      ))}
    </div>
  );
}
