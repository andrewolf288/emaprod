import { ListRequisicionEmpaquetado } from './ListRequisicionEmpaquetado'
import { ViewRequisicionEmpaquetado } from './ViewRequisicionEmpaquetado'

export const RouterRequisicionEmpaquetado = [
  {
    path: '',
    element: <ListRequisicionEmpaquetado />
  },
  {
    path: 'view/idReqEmp',
    element: <ViewRequisicionEmpaquetado />
  }
]
