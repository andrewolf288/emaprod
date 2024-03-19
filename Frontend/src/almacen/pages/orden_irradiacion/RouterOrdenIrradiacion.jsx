import { ListOrdenesIrradiacion } from './ListOrdenesIrradiacion'
import { ViewOrdenIrradiacion } from './ViewOrdenIrradiacion'

export const RouterOrdenIrradiacion = [
  {
    path: '',
    element: <ListOrdenesIrradiacion />
  },
  {
    path: 'view/:id',
    element: <ViewOrdenIrradiacion />
  }
]
