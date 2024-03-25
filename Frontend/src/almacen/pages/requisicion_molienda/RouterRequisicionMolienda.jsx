import { ViewLoteMolienda } from './ViewLoteMolienda'
import { ListRequisicionesMolienda } from './ListRequisicionesMolienda'
import { AgregarSubProducto } from './AgregarSubProducto'

export const RouterRequisicionMolienda = [
  {
    path: '',
    element: <ListRequisicionesMolienda />
  },
  {
    path: 'view/:idProdc/:idReq',
    element: <ViewLoteMolienda />
  },
  {
    path: 'agregar-subproducto/:idReq',
    element: <AgregarSubProducto />
  }
]
