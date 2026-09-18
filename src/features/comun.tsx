/**
 * Piezas compartidas entre los módulos del diagnóstico.
 */
import { useMemo } from 'react';

import { Insignia, Semaforo, type Tono } from '../brand/ui';
import { evaluar, type EstadoBrecha, type Severidad } from '../domain/catalogo';
import { useEstado } from '../store';

export function useDiagnostico() {
  const { perfil, respuestas, fecha } = useEstado();
  return useMemo(() => evaluar(perfil, respuestas, fecha), [perfil, respuestas, fecha]);
}

export const TONO_ESTADO: Record<EstadoBrecha, Tono> = {
  cumple: 'ok',
  parcial: 'alerta',
  incumple: 'riesgo',
  noAplica: 'neutro',
  sinEvaluar: 'neutro',
};

export const ROTULO_ESTADO: Record<EstadoBrecha, string> = {
  cumple: 'Cumple',
  parcial: 'Parcial',
  incumple: 'Incumple',
  noAplica: 'No aplica',
  sinEvaluar: 'Sin evaluar',
};

export const TONO_SEVERIDAD: Record<Severidad, Tono> = {
  critica: 'riesgo',
  alta: 'alerta',
  media: 'info',
};

export function EstadoBadge({ estado }: { estado: EstadoBrecha }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Semaforo tono={TONO_ESTADO[estado]} titulo={ROTULO_ESTADO[estado]} />
      <span className="text-sm">{ROTULO_ESTADO[estado]}</span>
    </span>
  );
}

export function SeveridadBadge({ severidad }: { severidad: Severidad }) {
  return <Insignia tono={TONO_SEVERIDAD[severidad]}>{severidad}</Insignia>;
}

export const NIVEL = {
  critico: { rotulo: 'Crítico', tono: 'riesgo' as Tono },
  deficiente: { rotulo: 'Deficiente', tono: 'alerta' as Tono },
  aceptable: { rotulo: 'Aceptable', tono: 'info' as Tono },
  solido: { rotulo: 'Sólido', tono: 'ok' as Tono },
} as const;
