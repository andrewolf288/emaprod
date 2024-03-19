import { AgregarEntradaStockV2 } from './AgregarEntradaStockV2'
import ListEntradaStock from './ListEntradaStock'
import { ViewEntradaStock } from './ViewEntradaStock'

export const RouterAlmacenEntradaStock = [
  {
    path: '',
    element: <ListEntradaStock />
  },
  {
    path: 'crear',
    element: <AgregarEntradaStockV2 />
  },
  {
    path: 'view/:id',
    element: <ViewEntradaStock />
  }
]
