import { describe, expect, it } from 'vitest';

import { sumarHabiles } from '../lib/fechas';
import {
  EJES,
  OBLIGACIONES,
  aplica,
  evaluar,
  planDeCierre,
  type PerfilEmpresa,
  type Respuesta,
} from './catalogo';

const HOY = '2026-09-17';

const PYME: PerfilEmpresa = {
  nombre: 'Empresa de prueba',
  empleados: 25,
  tratadatosPersonales: true,
  activosEnSmmlv: 5_000,
  tieneTrabajoRemoto: true,
};

const todas = (r: Respuesta): Record<string, Respuesta> =>
  Object.fromEntries(OBLIGACIONES.map((o) => [o.id, r]));

describe('integridad del catálogo', () => {
  it('no admite una obligación sin norma, autoridad y evidencia', () => {
    for (const o of OBLIGACIONES) {
      expect(o.norma, o.id).toMatch(/Ley|Decreto|CST|Resolución|Circular/);
      expect(o.autoridad.length, o.id).toBeGreaterThan(3);
      expect(o.evidencia.length, o.id).toBeGreaterThan(10);
      expect(o.porQueImporta.length, o.id).toBeGreaterThan(30);
    }
  });

  it('usa identificadores únicos', () => {
    const ids = OBLIGACIONES.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('asigna a cada obligación un eje declarado', () => {
    for (const o of OBLIGACIONES) {
      expect(EJES[o.eje], o.id).toBeDefined();
    }
  });

  it('nunca menciona un monto de sanción', () => {
    // Regla editorial de NL-05 §2.1: no se cuantifican multas.
    const texto = OBLIGACIONES.map((o) => `${o.porQueImporta} ${o.titulo}`).join(' ');
    expect(texto).not.toMatch(/\$|SMMLV de multa|multa de/i);
  });

  it('fija un plazo de cierre razonable para toda obligación', () => {
    for (const o of OBLIGACIONES) {
      expect(o.plazoCierre, o.id).toBeGreaterThanOrEqual(5);
      expect(o.plazoCierre, o.id).toBeLessThanOrEqual(60);
    }
  });
});

describe('aplicabilidad según el perfil', () => {
  it('excluye las obligaciones de datos cuando no hay tratamiento', () => {
    const sinDatos = { ...PYME, tratadatosPersonales: false };
    const politica = OBLIGACIONES.find((o) => o.id === 'politica-datos')!;
    expect(aplica(politica, PYME)).toBe(true);
    expect(aplica(politica, sinDatos)).toBe(false);
  });

  it('exige el RNBD solo por encima del umbral de activos', () => {
    const rnbd = OBLIGACIONES.find((o) => o.id === 'rnbd')!;
    expect(aplica(rnbd, PYME)).toBe(false);
    expect(aplica(rnbd, { ...PYME, activosEnSmmlv: 150_000 })).toBe(true);
  });

  it('exige desconexión laboral con trabajo remoto o diez o más empleados', () => {
    const d = OBLIGACIONES.find((o) => o.id === 'desconexion')!;
    expect(aplica(d, { ...PYME, tieneTrabajoRemoto: true, empleados: 3 })).toBe(true);
    expect(aplica(d, { ...PYME, tieneTrabajoRemoto: false, empleados: 12 })).toBe(true);
    expect(aplica(d, { ...PYME, tieneTrabajoRemoto: false, empleados: 3 })).toBe(false);
  });

  it('aplica el RIT a cualquier empresa, sin condición', () => {
    const rit = OBLIGACIONES.find((o) => o.id === 'rit-2466')!;
    expect(aplica(rit, { ...PYME, empleados: 1, tratadatosPersonales: false })).toBe(true);
  });
});

describe('evaluación del diagnóstico', () => {
  it('da índice 100 cuando todo lo aplicable se cumple', () => {
    const d = evaluar(PYME, todas('si'), HOY);
    expect(d.indice).toBe(100);
    expect(d.nivel).toBe('solido');
    expect(d.incumplidas).toBe(0);
  });

  it('da índice 0 cuando nada se cumple', () => {
    const d = evaluar(PYME, todas('no'), HOY);
    expect(d.indice).toBe(0);
    expect(d.nivel).toBe('critico');
    expect(d.cumplidas).toBe(0);
  });

  it('cuenta una respuesta parcial como media brecha', () => {
    const parcial = evaluar(PYME, todas('parcial'), HOY);
    expect(parcial.indice).toBe(50);
    expect(parcial.parciales).toBeGreaterThan(0);
  });

  it('no penaliza lo que no se ha respondido, pero lo advierte', () => {
    const d = evaluar(PYME, {}, HOY);
    expect(d.evaluadas).toBe(0);
    expect(d.avisos.some((a) => a.includes('sin responder'))).toBe(true);
  });

  it('calcula el índice solo sobre lo evaluado', () => {
    const rit = OBLIGACIONES.find((o) => o.id === 'rit-2466')!;
    const d = evaluar(PYME, { [rit.id]: 'si' }, HOY);
    expect(d.evaluadas).toBe(1);
    expect(d.indice).toBe(100);
  });

  it('pesa más una obligación crítica que una media', () => {
    const critica = OBLIGACIONES.find((o) => o.severidad === 'critica')!;
    const media = OBLIGACIONES.find((o) => o.severidad === 'media')!;
    const fallaCritica = evaluar(PYME, { [critica.id]: 'no', [media.id]: 'si' }, HOY);
    const fallaMedia = evaluar(PYME, { [critica.id]: 'si', [media.id]: 'no' }, HOY);
    expect(fallaCritica.indice).toBeLessThan(fallaMedia.indice);
  });

  it('marca como vencida la obligación cuyo plazo legal ya pasó', () => {
    const d = evaluar(PYME, todas('no'), HOY);
    const rit = d.brechas.find((b) => b.obligacion.id === 'rit-2466')!;
    expect(rit.vencido).toBe(true);
    expect(d.avisos.some((a) => a.includes('plazo legal ya vencido'))).toBe(true);
  });

  it('no marca como vencido lo que sí se cumplió', () => {
    const d = evaluar(PYME, todas('si'), HOY);
    expect(d.brechas.every((b) => !b.vencido)).toBe(true);
  });

  it('pone lo vencido al comienzo de la matriz', () => {
    const d = evaluar(PYME, todas('no'), HOY);
    expect(d.brechas[0]!.vencido).toBe(true);
  });

  it('excluye del conteo lo que no aplica al perfil', () => {
    const sinDatos = { ...PYME, tratadatosPersonales: false };
    const con = evaluar(PYME, todas('si'), HOY);
    const sin = evaluar(sinDatos, todas('si'), HOY);
    expect(sin.aplicables).toBeLessThan(con.aplicables);
  });

  it('advierte siempre que no cuantifica sanciones', () => {
    const d = evaluar(PYME, todas('si'), HOY);
    expect(d.avisos.some((a) => a.includes('no cuantifica sanciones'))).toBe(true);
  });

  it('clasifica el nivel por tramos del índice', () => {
    expect(evaluar(PYME, todas('si'), HOY).nivel).toBe('solido');
    expect(evaluar(PYME, todas('parcial'), HOY).nivel).toBe('deficiente');
    expect(evaluar(PYME, todas('no'), HOY).nivel).toBe('critico');
  });
});

describe('plan de cierre', () => {
  it('solo incluye brechas abiertas o parciales', () => {
    const d = evaluar(PYME, todas('si'), HOY);
    expect(planDeCierre(d, HOY, sumarHabiles)).toHaveLength(0);
  });

  it('agenda cada brecha en días hábiles', () => {
    const d = evaluar(PYME, todas('no'), HOY);
    const plan = planDeCierre(d, HOY, sumarHabiles);
    expect(plan.length).toBe(d.incumplidas);
    for (const t of plan) {
      expect(t.vence > HOY, t.obligacion.id).toBe(true);
      expect(t.diasHabiles).toBe(t.obligacion.plazoCierre);
    }
  });

  it('da la mitad del plazo a una brecha parcial, con piso de 5 días', () => {
    const d = evaluar(PYME, todas('parcial'), HOY);
    const plan = planDeCierre(d, HOY, sumarHabiles);
    for (const t of plan) {
      expect(t.diasHabiles).toBeGreaterThanOrEqual(5);
      expect(t.diasHabiles).toBeLessThanOrEqual(t.obligacion.plazoCierre);
    }
  });

  it('numera las tareas en el orden de prioridad de la matriz', () => {
    const d = evaluar(PYME, todas('no'), HOY);
    const plan = planDeCierre(d, HOY, sumarHabiles);
    expect(plan.map((t) => t.orden)).toEqual(plan.map((_, i) => i + 1));
    expect(plan[0]!.obligacion.id).toBe('rit-2466');
  });
});
