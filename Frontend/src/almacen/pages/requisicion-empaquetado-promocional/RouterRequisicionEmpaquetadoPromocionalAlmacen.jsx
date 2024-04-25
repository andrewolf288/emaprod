import { AtencionIngresoRequisicionEmpaquetadoPromocionalAlmacen } from './AtencionIngresoRequisicionEmpaquetadoPromocionalAlmacen'
import { ListRequisicionEmpaquetadoPromocionalAlmacen } from './ListRequisicionEmpaquetadoPromocionalAlmacen'
import { ViewRequisicionEmpaquetadoPromocionalAlmacen } from './ViewRequisicionEmpaquetadoPromocionalAlmacen'

export const RouterRequisicionEmpaquetadoPromocionalAlmacen = [
  {
    path: '',
    element: <ListRequisicionEmpaquetadoPromocionalAlmacen />
  },
  {
    path: 'view/:idReqEmpProm',
    element: <ViewRequisicionEmpaquetadoPromocionalAlmacen />
  },
  {
    path: 'atencion-ingreso/:idReqEmpProm',
    element: <AtencionIngresoRequisicionEmpaquetadoPromocionalAlmacen />
  }
]
