import { ListProduccionLote } from './ListProduccionLote'
import { CrearProduccionLote2 } from './CrearProduccionLote2'

export const RouterProduccionLote = [
  {
    path: '',
    element: <ListProduccionLote />
  },
  {
    path: 'crear',
    element: <CrearProduccionLote2 />
  }
]
