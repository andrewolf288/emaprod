import { AgregarTransferenciaAlmacen } from './AgregarTransferenciaAlmacen'
import { ListTransferenciaAlmancen } from './ListTransferenciaAlmancen'
import { ViewTransferenciaAlmacen } from './ViewTransferenciaAlmacen'

export const RouterAlmacenTransferenciaAlmacen = [
  {
    path: '',
    element: <ListTransferenciaAlmancen />
  },
  {
    path: 'crear',
    element: <AgregarTransferenciaAlmacen />
  },
  {
    path: 'view',
    element: <ViewTransferenciaAlmacen />
  }
]
