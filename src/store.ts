/**
 * Estado del diagnóstico. Persiste en el navegador; nada viaja a un servidor.
 * Se guardan las respuestas, no el resultado: el índice se recalcula siempre
 * desde el dominio, de modo que un cambio de regla no deja cifras viejas.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { almacenZustand } from './lib/almacen';
import type { PerfilEmpresa, Respuesta } from './domain/catalogo';

interface Estado {
  perfil: PerfilEmpresa;
  respuestas: Record<string, Respuesta>;
  fecha: string;
  setPerfil: (p: Partial<PerfilEmpresa>) => void;
  responder: (id: string, r: Respuesta) => void;
  setFecha: (f: string) => void;
  limpiarRespuestas: () => void;
  reiniciar: () => void;
}

const INICIAL = {
  perfil: {
    nombre: '',
    empleados: 25,
    tratadatosPersonales: true,
    activosEnSmmlv: 5_000,
    tieneTrabajoRemoto: true,
  } satisfies PerfilEmpresa,
  respuestas: {} as Record<string, Respuesta>,
  fecha: '2026-09-17',
};

export const useEstado = create<Estado>()(
  persist(
    (set) => ({
      ...structuredClone(INICIAL),
      setPerfil: (p) => set((s) => ({ perfil: { ...s.perfil, ...p } })),
      responder: (id, r) => set((s) => ({ respuestas: { ...s.respuestas, [id]: r } })),
      setFecha: (fecha) => set({ fecha }),
      limpiarRespuestas: () => set({ respuestas: {} }),
      reiniciar: () => set(structuredClone(INICIAL)),
    }),
    {
      name: 'estado',
      version: 1,
      storage: createJSONStorage(() => almacenZustand),
      partialize: (s) => ({ perfil: s.perfil, respuestas: s.respuestas, fecha: s.fecha }),
    },
  ),
);
