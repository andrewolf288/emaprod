import { AgregarAgregacionV2 } from './AgregarAgregacionV2'
import { RequisicionAgregaciones } from './RequisicionAgregaciones'

export const RouterAlmacenAgregaciones = [
  {
    path: 'crear',
    element: <AgregarAgregacionV2 />
  },
  {
    path: 'atender-requisiciones',
    element: <RequisicionAgregaciones />
  }
]
