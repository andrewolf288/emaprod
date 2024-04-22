import { CreateRequisicionEmpaquetadoPromocional } from './CreateRequisicionEmpaquetadoPromocional'
import { ListRequisicionEmpaquetadoPromocional } from './ListRequisicionEmpaquetadoPromocional'
import { ViewRequisicionEmpaquetadoPromocional } from './ViewRequisicionEmpaquetadoPromocional'

export const RouterRequisicionEmpaquetadoPromocional = [
  {
    path: '',
    element: <ListRequisicionEmpaquetadoPromocional />
  },
  {
    path: 'crear',
    element: <CreateRequisicionEmpaquetadoPromocional />
  },
  {
    path: 'view/:idReqEmpProm',
    element: <ViewRequisicionEmpaquetadoPromocional />
  }
]
