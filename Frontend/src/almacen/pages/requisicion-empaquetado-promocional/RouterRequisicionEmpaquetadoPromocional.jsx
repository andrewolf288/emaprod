import { ListRequisicionEmpaquetadoPromocional } from './ListRequisicionEmpaquetadoPromocional'
import { ViewRequisicionEmpaquetadoPromocional } from './ViewRequisicionEmpaquetadoPromocional'

export const RouterRequisicionEmpaquetadoPromocional = [
  {
    path: '',
    element: <ListRequisicionEmpaquetadoPromocional />
  },
  {
    path: 'view/idReqEmpProm',
    element: <ViewRequisicionEmpaquetadoPromocional />
  }
]
