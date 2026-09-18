/**
 * Módulo «Reporte exportable»: el diagnóstico en un documento imprimible, y
 * la exportación de los datos para conservarlos o llevarlos a otro equipo.
 */
import { useRef } from 'react';
import { Download, FileJson, Printer, Upload } from 'lucide-react';

import { Boton, Insignia, Llamado, Tabla, Tarjeta, Td, Th } from '../brand/ui';
import { Logo } from '../brand/Logo';
import { EJES } from '../domain/catalogo';
import { exportarJSON, exportarTexto, imprimir, leerArchivo } from '../lib/exportar';
import { fechaLarga } from '../lib/formato';
import { useEstado } from '../store';
import { NIVEL, ROTULO_ESTADO, useDiagnostico } from './comun';

export function PanelReporte() {
  const d = useDiagnostico();
  const { perfil, respuestas, fecha, setPerfil, responder, setFecha } = useEstado();
  const nivel = NIVEL[d.nivel];
  const archivo = useRef<HTMLInputElement>(null);

  const abiertas = d.brechas.filter((b) => b.estado === 'incumple' || b.estado === 'parcial');

  const markdown = () => {
    const lineas = [
      `# Diagnóstico de cumplimiento`,
      '',
      `**Empresa:** ${perfil.nombre || 'Sin nombre'}  `,
      `**Fecha:** ${fechaLarga(fecha)}  `,
      `**Trabajadores:** ${perfil.empleados}  `,
      `**Índice de cumplimiento:** ${d.indice}/100 (${nivel.rotulo})`,
      '',
      '> Los resultados son orientativos y no constituyen concepto jurídico profesional.',
      '> Proyecto de laboratorio de NiAnd Labs. No corresponde a un cliente real.',
      '',
      '## Resumen',
      '',
      `- Obligaciones aplicables: ${d.aplicables}`,
      `- Evaluadas: ${d.evaluadas}`,
      `- Cumplidas: ${d.cumplidas}`,
      `- Parciales: ${d.parciales}`,
      `- Incumplidas: ${d.incumplidas}`,
      '',
      '## Matriz de brechas',
      '',
      '| Obligación | Estado | Severidad | Norma | Autoridad |',
      '|---|---|---|---|---|',
      ...d.brechas.map(
        (b) =>
          `| ${b.obligacion.titulo}${b.vencido ? ' ⚠️ plazo vencido' : ''} | ${ROTULO_ESTADO[b.estado]} | ${b.obligacion.severidad} | ${b.obligacion.norma} | ${b.obligacion.autoridad} |`,
      ),
      '',
      '## Advertencias',
      '',
      ...d.avisos.map((a) => `- ${a}`),
      '',
      '---',
      '',
      `Generado con niand-diagnostico-cumplimiento · NiAnd Labs · ${fechaLarga(fecha)}`,
    ];
    exportarTexto(lineas.join('\n'), 'reporte', 'md');
  };

  const importar = async (f: File) => {
    try {
      const datos = JSON.parse(await leerArchivo(f)) as {
        perfil?: Partial<typeof perfil>;
        respuestas?: Record<string, string>;
        fecha?: string;
      };
      if (datos.perfil) setPerfil(datos.perfil);
      if (datos.fecha) setFecha(datos.fecha);
      if (datos.respuestas) {
        for (const [id, r] of Object.entries(datos.respuestas)) {
          responder(id, r as never);
        }
      }
    } catch (e) {
      console.error('No se pudo importar el archivo.', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="no-imprimir flex flex-wrap gap-2">
        <Boton onClick={imprimir}>
          <Printer size={15} /> Imprimir o guardar en PDF
        </Boton>
        <Boton variante="secundario" onClick={markdown}>
          <Download size={15} /> Reporte en Markdown
        </Boton>
        <Boton
          variante="secundario"
          onClick={() => exportarJSON({ perfil, respuestas, fecha }, 'diagnostico')}
        >
          <FileJson size={15} /> Exportar datos
        </Boton>
        <Boton variante="fantasma" onClick={() => archivo.current?.click()}>
          <Upload size={15} /> Importar
        </Boton>
        <input
          ref={archivo}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importar(f);
            e.target.value = '';
          }}
        />
      </div>

      <Tarjeta className="print:border-0 print:shadow-none">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-borde pb-5">
          <div>
            <Logo alto={30} />
            <h1 className="mt-3 font-display text-xl font-semibold">Diagnóstico de cumplimiento</h1>
            <p className="text-sm text-texto-2">
              {perfil.nombre || 'Empresa sin nombre'} · {fechaLarga(fecha)}
            </p>
          </div>
          <div className="text-right">
            <p className="eyebrow">Índice</p>
            <p className="cifra font-display text-4xl font-bold text-marca">{d.indice}</p>
            <Insignia tono={nivel.tono}>{nivel.rotulo}</Insignia>
          </div>
        </header>

        <section className="mb-6 grid gap-3 sm:grid-cols-4">
          {[
            ['Aplicables', d.aplicables],
            ['Cumplidas', d.cumplidas],
            ['Parciales', d.parciales],
            ['Incumplidas', d.incumplidas],
          ].map(([r, v]) => (
            <div key={String(r)} className="rounded-xl border border-borde px-4 py-3">
              <p className="eyebrow">{r}</p>
              <p className="cifra font-display text-2xl font-semibold">{v}</p>
            </div>
          ))}
        </section>

        {abiertas.length > 0 && (
          <section className="mb-6">
            <h2 className="mb-3 font-display text-base font-semibold">
              Brechas que exigen acción ({abiertas.length})
            </h2>
            <Tabla>
              <thead>
                <tr>
                  <Th>Obligación</Th>
                  <Th>Estado</Th>
                  <Th>Norma y autoridad</Th>
                </tr>
              </thead>
              <tbody>
                {abiertas.map((b) => (
                  <tr key={b.obligacion.id}>
                    <Td>
                      <span className="font-medium">{b.obligacion.titulo}</span>
                      {b.vencido && (
                        <span className="ml-2 text-xs font-semibold text-alerta">
                          plazo vencido
                        </span>
                      )}
                      <span className="block text-xs text-texto-2">{b.obligacion.evidencia}</span>
                    </Td>
                    <Td>{ROTULO_ESTADO[b.estado]}</Td>
                    <Td className="text-xs text-texto-2">
                      {b.obligacion.norma}
                      <span className="block text-texto-3">{b.obligacion.autoridad}</span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Tabla>
          </section>
        )}

        <section className="mb-6">
          <h2 className="mb-3 font-display text-base font-semibold">Detalle por eje</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(EJES).map(([eje, info]) => {
              const delEje = d.brechas.filter(
                (b) => b.obligacion.eje === eje && b.estado !== 'noAplica',
              );
              if (delEje.length === 0) return null;
              const ok = delEje.filter((b) => b.estado === 'cumple').length;
              return (
                <div key={eje} className="rounded-xl border border-borde p-4">
                  <p className="font-display text-sm font-semibold">{info.rotulo}</p>
                  <p className="mt-0.5 text-xs text-texto-3">{info.descripcion}</p>
                  <p className="cifra mt-2 text-sm">
                    <strong>{ok}</strong> de {delEje.length} cumplidas
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="border-t border-borde pt-4 text-xs text-texto-3">
          <p className="mb-2">
            <strong>Advertencia.</strong> Los resultados son orientativos y no constituyen concepto
            jurídico profesional. Este es un proyecto de laboratorio construido por NiAnd Labs para
            demostrar capacidad técnica; no corresponde a un cliente real. Verifique la vigencia de
            cada norma citada antes de tomar una decisión.
          </p>
          <p>
            Ninguno de los datos de este diagnóstico salió de su navegador. Verificación normativa:
            17 de septiembre de 2026.
          </p>
        </footer>
      </Tarjeta>

      <Llamado tono="info" className="no-imprimir">
        El archivo JSON contiene su perfil y sus respuestas. Guárdelo si quiere retomar el
        diagnóstico en otro equipo: no hay servidor donde quede almacenado.
      </Llamado>
    </div>
  );
}
