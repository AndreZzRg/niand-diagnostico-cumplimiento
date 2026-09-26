import { useState, type JSX } from 'react';

import { Portada } from './brand/Portada';
import { APP, MODULOS, Shell, type ModuloId, type Vista } from './brand/Shell';
import { PanelCuestionario } from './features/PanelCuestionario';
import { PanelMatriz } from './features/PanelMatriz';
import { PanelPlan } from './features/PanelPlan';
import { PanelReporte } from './features/PanelReporte';

const PANELES: Record<ModuloId, () => JSX.Element> = {
  cuestionario: PanelCuestionario,
  'matriz-de-brechas': PanelMatriz,
  'plan-de-cierre': PanelPlan,
  'reporte-exportable': PanelReporte,
};

export default function App() {
  // Se abre en la portada: quien llega ve primero de qué se compone la
  // herramienta, en vez de caer dentro del primer módulo sin contexto.
  const [vista, setVista] = useState<Vista>('portada');
  const Panel = vista === 'portada' ? null : PANELES[vista];

  return (
    <Shell vista={vista} onVista={setVista}>
      {Panel ? (
        <Panel />
      ) : (
        <Portada
          titulo={APP.nombre}
          descripcion={APP.resumen}
          modulos={MODULOS}
          onAbrir={(id) => setVista(id as ModuloId)}
        />
      )}
    </Shell>
  );
}
