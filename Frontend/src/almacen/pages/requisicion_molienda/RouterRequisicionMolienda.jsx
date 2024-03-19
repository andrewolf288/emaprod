import { ViewLoteMolienda } from './ViewLoteMolienda'
import { ListRequisicionesMolienda } from './ListRequisicionesMolienda'

export const RouterRequisicionMolienda = [
  {
    path: '',
    element: <ListRequisicionesMolienda />
  },
  {
    path: 'view/:idProdc/:idReq',
    element: <ViewLoteMolienda />
  }
]
