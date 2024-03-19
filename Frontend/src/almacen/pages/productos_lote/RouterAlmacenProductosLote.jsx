import { ListProductosLoteProduccion } from './ListProductosLoteProduccion'
import { AgregarProductosLoteProduccionV2 } from './AgregarProductosLoteProduccionV2'
import { RequisicionIngresoProductos } from './RequisicionIngresoProductos'

export const RouterAlmacenProductosLote = [
  {
    path: '',
    element: <ListProductosLoteProduccion />
  },
  {
    path: 'crear',
    element: <AgregarProductosLoteProduccionV2 />
  },
  {
    path: 'atender-requisiciones',
    element: <RequisicionIngresoProductos />
  }
]
