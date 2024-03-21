import { CreateRequisicionGeneralMateriales } from './CreateRequisicionGeneralMateriales'
import { DevolucionRequisicionGeneralMateriales } from './DevolucionRequisicionGeneralMateriales'
import { ListRequisicionGeneralMateriales } from './ListRequisicionGeneralMateriales'
import { ViewRequisicionGeneralMateriales } from './ViewRequisicionGeneralMateriales'

export const RouterRequisionGeneralMateriales = [
  {
    path: '',
    element: <ListRequisicionGeneralMateriales />
  },
  {
    path: 'crear',
    element: <CreateRequisicionGeneralMateriales />
  },
  {
    path: 'view/:idReqMat',
    element: <ViewRequisicionGeneralMateriales />
  },
  {
    path: 'devolucion/:idReqMat',
    element: <DevolucionRequisicionGeneralMateriales />
  }
]
