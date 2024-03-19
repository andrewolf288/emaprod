import { ListLoteProduccion } from './ListLoteProduccion'
import { ViewLoteProduccion } from './ViewLoteProduccion'

export const RouterAlmacenLoteProduccion = [
  {
    path: '',
    element: <ListLoteProduccion />
  },
  {
    path: 'view/:id',
    element: <ViewLoteProduccion />
  }
]
