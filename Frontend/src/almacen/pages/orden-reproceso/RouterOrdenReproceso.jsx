import { ListOrdenesReproceso } from './ListOrdenesReproceso'
import { ViewOrdenReproceso } from './ViewOrdenReproceso'

export const RouterOrdenReproceso = [
  {
    path: '',
    element: <ListOrdenesReproceso />
  },
  {
    path: 'view/:idOpeDevCal',
    element: <ViewOrdenReproceso />
  }
]
