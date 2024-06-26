import { RouterMoliendaFormula } from '../pages/formulas/RouterMoliendaFormula'
import LayoutModulo from './../../layout/LayoutModulo'
import { HomeProduccion } from './../pages/HomeProduccion'
import { RouterProduccionLote } from './../pages/produccion_lote/RouterProduccionLote'
import { RouterFormulaPorProducto } from './../pages/formulas_por_productos/RouterFormulaPorProducto'
import { RouterRequisicionMateriales } from '../pages/requisicion-materiales/RouterRequisicionMateriales'
import { RouterRequisicionTransformacion } from '../pages/requisicion-transformacion/RouterRequisicionTransformacion'
import { RouterRequisicionReproceso } from '../pages/requisicion-reproceso/RouterRequisicionReproceso'
import { RouterRequisionGeneralMateriales } from '../../general/pages/requisicion_general_materiales/RouterRequisionGeneralMateriales'
import { RouterRequisicionSubProducto } from '../pages/requisicion-subproducto/RouterRequisicionSubProducto'
import { RouterFormulaEmpaquetadoPromocional } from '../pages/formulas_empaquetado_promocional/RouterFormulaEmpaquetadoPromocional'
import { RouterRequisicionEmpaquetadoPromocional } from '../pages/requisicion-empaquetado-promocional/RouterRequisicionEmpaquetadoPromocional'

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
  },
  {
    path: 'requisicion-general',
    element: <LayoutModulo />,
    children: RouterRequisionGeneralMateriales
  },
  {
    path: 'requisicion-subproducto',
    element: <LayoutModulo />,
    children: RouterRequisicionSubProducto
  },
  {
    path: 'formula-empaquetado-promocional',
    element: <LayoutModulo />,
    children: RouterFormulaEmpaquetadoPromocional
  },
  {
    path: 'requisicion-empaquetado-promocional',
    element: <LayoutModulo />,
    children: RouterRequisicionEmpaquetadoPromocional
  }
]
