import { RouterMoliendaFormula } from '../pages/formulas/RouterMoliendaFormula'
import LayoutModulo from './../../layout/LayoutModulo'
import { HomeProduccion } from './../pages/HomeProduccion'
import { RouterProduccionLote } from './../pages/produccion_lote/RouterProduccionLote'
import { RouterFormulaPorProducto } from './../pages/formulas_por_productos/RouterFormulaPorProducto'
import { RouterRequisicionMateriales } from '../pages/requisicion-materiales/RouterRequisicionMateriales'
import { RouterRequisicionTransformacion } from '../pages/requisicion-transformacion/RouterRequisicionTransformacion'
import { RouterRequisicionReproceso } from '../pages/requisicion-reproceso/RouterRequisicionReproceso'

export const RouterProduccion = [
  {
    path: '',
    element: <HomeProduccion />
  },
  {
    path: 'produccion-lote',
    element: <LayoutModulo />,
    children: RouterProduccionLote
  },
  {
    path: 'formula',
    element: <LayoutModulo />,
    children: RouterMoliendaFormula
  },
  {
    path: 'formula-producto',
    element: <LayoutModulo />,
    children: RouterFormulaPorProducto
  },
  {
    path: 'requisicion-materiales',
    element: <LayoutModulo />,
    children: RouterRequisicionMateriales
  },
  {
    path: 'requisicion-transformacion',
    element: <LayoutModulo />,
    children: RouterRequisicionTransformacion
  },
  {
    path: 'requisicion-reproceso',
    element: <LayoutModulo />,
    children: RouterRequisicionReproceso
  }
]
