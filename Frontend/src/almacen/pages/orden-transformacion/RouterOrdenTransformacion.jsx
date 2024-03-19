import { ListOrdenesTransformacion } from './ListOrdenesTransformacion'
import { ViewDevolucionesOrdenTransformacion } from './ViewDevolucionesOrdenTransformacion'
import { ViewIngresosOrdenTransformacion } from './ViewIngresosOrdenTransformacion'
import { ViewOrdenTransformacion } from './ViewOrdenTransformacion'

export const RouterOrdenTransformacion = [
  {
    path: '',
    element: <ListOrdenesTransformacion />
  },
  {
    path: 'view/:id',
    element: <ViewOrdenTransformacion />
  },
  {
    path: 'viewIngresos/:id',
    element: <ViewIngresosOrdenTransformacion />
  },
  {
    path: 'viewDevolucion/:id',
    element: <ViewDevolucionesOrdenTransformacion />
  }
]
