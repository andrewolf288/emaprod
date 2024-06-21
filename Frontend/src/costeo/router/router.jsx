import LayoutModulo from '../../layout/LayoutModulo'
import { HomeCosteo } from '../pages/HomeCosteo'
import { RouterExportacionesCosteo } from '../pages/exportaciones/RouterExportacionesCosteo'

export const RouterCosteo = [
  {
    path: '',
    element: <HomeCosteo />
  },
  {
    path: 'exportacion',
    element: <LayoutModulo />,
    children: RouterExportacionesCosteo
  }
]
