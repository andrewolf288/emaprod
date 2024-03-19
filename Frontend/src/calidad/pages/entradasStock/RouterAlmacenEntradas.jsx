import { ListEntradaStockCalidad } from './ListEntradaStockCalidad'
import { ViewEntradaStockCalidad } from './ViewEntradaStockCalidad'

export const RouterAlmacenEntradaStock = [
  {
    path: '',
    element: <ListEntradaStockCalidad />
  },
  {
    path: 'view/:idEntSto',
    element: <ViewEntradaStockCalidad />
  }
]
