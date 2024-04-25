import { ListProduccionLote } from './ListProduccionLote'
import { CrearProduccionLote2 } from './CrearProduccionLote2'
// import { ListProduccionLote2 } from './ListProduccionLote2'

export const RouterProduccionLote = [
  {
    path: '',
    element: <ListProduccionLote />
  },
  // {
  //   path: '',
  //   element: <ListProduccionLote2 />
  // },
  {
    path: 'crear',
    element: <CrearProduccionLote2 />
  }
]
