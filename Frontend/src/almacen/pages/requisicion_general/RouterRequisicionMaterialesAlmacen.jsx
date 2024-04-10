import { ListRequisicionMaterialesAlmacen } from './ListRequisicionMaterialesAlmacen'
import { ViewDevolucionRequisicionMaterialesAlmacen } from './ViewDevolucionRequisicionMaterialesAlmacen'
import { ViewRequisicionMaterialesAlmacen } from './ViewRequisicionMaterialesAlmacen'

export const RouterRequisicionMaterialesAlmacen = [
  {
    path: '',
    element: <ListRequisicionMaterialesAlmacen />
  },
  {
    path: 'atender-requisicion/:idReqMat',
    element: <ViewRequisicionMaterialesAlmacen />
  },
  {
    path: 'atender-devolucion/:idReqMat',
    element: <ViewDevolucionRequisicionMaterialesAlmacen />
  }
]
