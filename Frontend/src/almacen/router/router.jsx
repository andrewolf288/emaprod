import LayoutModulo from './../../layout/LayoutModulo'
import HomeAlmacen from './../pages/HomeAlmacen'
import { RouterAlmacenEntradaStock } from './../pages/entradasStock/RouterAlmacenEntradas'
import { RouterAlmacenMateriaPrima } from './../pages/materiaPrima/RouterAlmacenMateriaPrima'
import { RouterAlmacenProveedor } from './../pages/proveedor/RouterAlmacenProveedor'
import { RouterAlmacenSalidasStock } from './../pages/salidasStocks/RouterAlmacenSalida'
import { RouterRequisicionSeleccion } from './../pages/requisicion_seleccion/RouterRequisicionSeleccion'
import { RouterRequisicionMolienda } from './../pages/requisicion_molienda/RouterRequisicionMolienda'
import { RouterRequisicionFrescos } from './../pages/requisicion_frescos/RouterRequisicionFrescos'

import { RouterReportesAlmacen } from './../pages/reportes/RouterReportesAlmacen'
import { RouterAlmacenProductosLote } from './../pages/productos_lote/RouterAlmacenProductosLote'
import { RouterAlmacenLoteProduccion } from '../pages/lote_produccion/RouterAlmacenLoteProduccion'
import { RouterAlmacenDevoluciones } from './../pages/devoluciones/RouterAlmacenDevoluciones'
import { RouterAlmacenAgregaciones } from './../pages/agregaciones/RouterAlmacenAgregaciones'
import { RouterAlmacenStock } from './../pages/almacen/RouterAlmacenStock'
import { RouterRequisicionMateriales } from '../pages/requisicion_materiales/RouterRequisicionMateriales'
import { RouterSalidaVenta } from '../pages/salida_venta/RouterSalidaVenta'
import { RouterRetornoVenta } from '../pages/retorno_venta/RouterRetornoVenta'
import { RouterOrdenIrradiacion } from '../pages/orden_irradiacion/RouterOrdenIrradiacion'
import { RouterOrdenTransformacion } from '../pages/orden-transformacion/RouterOrdenTransformacion'
import { RouterOrdenReproceso } from '../pages/orden-reproceso/RouterOrdenReproceso'

export const RouterAlmacen = [
  {
    path: '',
    element: <HomeAlmacen />
  },
  {
    path: 'materia-prima',
    element: <LayoutModulo />,
    children: RouterAlmacenMateriaPrima
  },
  {
    path: 'proveedor',
    element: <LayoutModulo />,
    children: RouterAlmacenProveedor
  },
  {
    path: 'entradas-stock',
    element: <LayoutModulo />,
    children: RouterAlmacenEntradaStock
  },
  {
    path: 'salidas-stock',
    element: <LayoutModulo />,
    children: RouterAlmacenSalidasStock
  },
  {
    path: 'requisicion-seleccion',
    element: <LayoutModulo />,
    children: RouterRequisicionSeleccion
  },
  {
    path: 'requisicion-molienda',
    element: <LayoutModulo />,
    children: RouterRequisicionMolienda
  },
  {
    path: 'requisicion-frescos',
    element: <LayoutModulo />,
    children: RouterRequisicionFrescos
  },
  {
    path: 'reportes-almacen',
    element: <LayoutModulo />,
    children: RouterReportesAlmacen
  },
  {
    path: 'productos-lote',
    element: <LayoutModulo />,
    children: RouterAlmacenProductosLote
  },
  {
    path: 'lote-produccion',
    element: <LayoutModulo />,
    children: RouterAlmacenLoteProduccion
  },
  {
    path: 'produccion-devoluciones',
    element: <LayoutModulo />,
    children: RouterAlmacenDevoluciones
  },
  {
    path: 'produccion-agregaciones',
    element: <LayoutModulo />,
    children: RouterAlmacenAgregaciones
  },
  {
    path: 'stock-almacen',
    element: <LayoutModulo />,
    children: RouterAlmacenStock
  },
  {
    path: 'requisicion-materiales',
    element: <LayoutModulo />,
    children: RouterRequisicionMateriales
  },
  {
    path: 'salida-venta',
    element: <LayoutModulo />,
    children: RouterSalidaVenta
  },
  {
    path: 'retorno-venta',
    element: <LayoutModulo />,
    children: RouterRetornoVenta
  },
  {
    path: 'orden-irradiacion',
    element: <LayoutModulo />,
    children: RouterOrdenIrradiacion
  },
  {
    path: 'orden-transformacion',
    element: <LayoutModulo />,
    children: RouterOrdenTransformacion
  },
  {
    path: 'orden-reproceso',
    element: <LayoutModulo />,
    children: RouterOrdenReproceso
  }
]
