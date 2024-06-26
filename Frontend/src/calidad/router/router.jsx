import { RouterAlmacenCalidad } from '../pages/almacen-calidad/RouterAlmacenCalidad'
import { RouterAtributoCalidad } from '../pages/atributos-calidad/RouterAtributoCalidad'
import { RouterAlmacenEntradaStock } from '../pages/entradasStock/RouterAlmacenEntradas'
import { RouterOperacionDevolucionCalidad } from '../pages/operacion-reproceso-calidad/RouterOperacionDevolucionCalidad'
import { RouterReportesCalidad } from '../pages/reportes/RouterReportesCalidad'
import LayoutModulo from './../../layout/LayoutModulo'
import HomeCalidad from './../pages/HomeCalidad'
import { RouterRequisionGeneralMateriales } from '../../general/pages/requisicion_general_materiales/RouterRequisionGeneralMateriales'
import { RouterOperacionReprocesoMasivo } from '../pages/operacion-reproceso-masivo/RouterOperacionReprocesoMasivo'

export const RouterCalidad = [
  {
    path: '',
    element: <HomeCalidad />
  },
  {
    path: 'entradas-stock',
    element: <LayoutModulo />,
    children: RouterAlmacenEntradaStock
  },
  {
    path: 'atributos-calidad',
    element: <LayoutModulo />,
    children: RouterAtributoCalidad
  },
  {
    path: 'almacen',
    element: <LayoutModulo />,
    children: RouterAlmacenCalidad
  },
  {
    path: 'reportes-calidad',
    element: <LayoutModulo />,
    children: RouterReportesCalidad
  },
  {
    path: 'operacion-devolucion',
    element: <LayoutModulo />,
    children: RouterOperacionDevolucionCalidad
  },
  {
    path: 'requisicion-general',
    element: <LayoutModulo />,
    children: RouterRequisionGeneralMateriales
  },
  {
    path: 'requisicion-devolucion-masiva',
    element: <LayoutModulo />,
    children: RouterOperacionReprocesoMasivo
  }
]
