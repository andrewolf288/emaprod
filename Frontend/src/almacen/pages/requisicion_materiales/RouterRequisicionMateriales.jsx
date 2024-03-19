import React from 'react'
import { ViewRequisicionMateriales } from './ViewRequisicionMateriales'
import { ListRequisicionMaterialesAlmacen } from './ListRequisicionMaterialesAlmacen'

export const RouterRequisicionMateriales = [
  {
    path: '',
    element: <ListRequisicionMaterialesAlmacen />
  },
  {
    path: 'view/:idReq',
    element: <ViewRequisicionMateriales />
  }
]
