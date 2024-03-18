import { RouterAlmacenCalidad } from '../pages/almacen-calidad/RouterAlmacenCalidad'
import { RouterAtributoCalidad } from '../pages/atributos-calidad/RouterAtributoCalidad'
import { RouterOperacionDevolucionCalidad } from '../pages/operacion-reproceso-calidad/RouterOperacionDevolucionCalidad'
import { RouterReportesCalidad } from '../pages/reportes/RouterReportesCalidad'
import LayoutModulo from './../../layout/LayoutModulo'
import HomeCalidad from './../pages/HomeCalidad'

export const RouterCalidad = [
  {
    path: '',
    element: <HomeCalidad />
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
  }
]
