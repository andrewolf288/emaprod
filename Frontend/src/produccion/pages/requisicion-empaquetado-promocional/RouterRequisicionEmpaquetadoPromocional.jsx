import { CreateRequisicionEmpaquetadoPromocional } from './CreateRequisicionEmpaquetadoPromocional'
import { IngresarRequisicionEmpaquetadoPromocional } from './IngresarRequisicionEmpaquetadoPromocional'
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
  },
  {
    path: 'ingresar-producto-promocional/:idReqEmpProm',
    element: <IngresarRequisicionEmpaquetadoPromocional />
  }
]
