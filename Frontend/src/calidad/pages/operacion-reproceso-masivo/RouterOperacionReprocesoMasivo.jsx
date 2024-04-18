import { CreateOperacionReprocesoMasivo } from './CreateOperacionReprocesoMasivo'
import { ListOperacionReprocesoMasivo } from './ListOperacionReprocesoMasivo'
import { ViewOperacionReprocesoMasivo } from './ViewOperacionReprocesoMasivo'

export const RouterOperacionReprocesoMasivo = [
  {
    path: '',
    element: <ListOperacionReprocesoMasivo />
  },
  {
    path: 'view/:idEntSto',
    element: <ViewOperacionReprocesoMasivo />
  },
  {
    path: 'create',
    element: <CreateOperacionReprocesoMasivo />
  }
]
