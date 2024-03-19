import { HomeVentas } from '../pages/HomeVentas'
import { RouterAlmacenStockVentas } from '../pages/almacen/RouterAlmacenStockVentas'
import LayoutModulo from './../../layout/LayoutModulo'

export const RouterVentas = [
  {
    path: '',
    element: <HomeVentas />
  },
  {
    path: 'stock-almacen',
    element: <LayoutModulo />,
    children: RouterAlmacenStockVentas
  }
]
