import React from 'react'
import { ListRequisicionMateriales } from './ListRequisicionMateriales'
import { CreateRequisicionMateriales } from './CreateRequisicionMateriales'

export const RouterRequisicionMateriales = [
  {
    path: '',
    element: <ListRequisicionMateriales />
  },
  {
    path: 'crear',
    element: <CreateRequisicionMateriales />
  }
]
