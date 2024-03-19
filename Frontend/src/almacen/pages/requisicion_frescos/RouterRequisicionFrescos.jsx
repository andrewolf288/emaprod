import { ViewLoteFrescos } from './ViewLoteFrescos'
import { ListRequisicionesFrescos } from './ListRequisicionesFrescos'

export const RouterRequisicionFrescos = [
  {
    path: '',
    element: <ListRequisicionesFrescos />
  },
  {
    path: 'view/:idProdc/:idReq',
    element: <ViewLoteFrescos />
  }
]
