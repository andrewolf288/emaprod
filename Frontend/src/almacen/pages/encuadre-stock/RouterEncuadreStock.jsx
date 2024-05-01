import { CreateEncuadreStock } from './CreateEncuadreStock'
import { ListEncuadreStock } from './ListEncuadreStock'

export const RouterEncuadreStock = [
  {
    path: '',
    element: <ListEncuadreStock />
  },
  {
    path: 'crear',
    element: <CreateEncuadreStock />
  }
]
