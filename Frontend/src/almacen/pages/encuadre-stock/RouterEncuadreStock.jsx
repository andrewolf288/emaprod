import { CreateEncuadreStock } from './CreateEncuadreStock'
import { ListEncuadreStock } from './ListEncuadreStock'
import { ViewEncuadreStock } from './ViewEncuadreStock'

export const RouterEncuadreStock = [
  {
    path: '',
    element: <ListEncuadreStock />
  },
  {
    path: 'crear',
    element: <CreateEncuadreStock />
  },
  {
    path: 'view/:idOpeEnStock',
    element: <ViewEncuadreStock />
  }
]
