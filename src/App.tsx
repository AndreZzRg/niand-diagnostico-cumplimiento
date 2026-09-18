import { useState, type JSX } from 'react';

import { Shell, type ModuloId } from './brand/Shell';
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
  const [modulo, setModulo] = useState<ModuloId>('cuestionario');
  const Panel = PANELES[modulo];

  return (
    <Shell moduloActivo={modulo} onModulo={setModulo}>
      <Panel />
    </Shell>
  );
}
