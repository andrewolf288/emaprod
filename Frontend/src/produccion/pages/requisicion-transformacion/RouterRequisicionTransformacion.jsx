import React from 'react'
import { ListRequisicionTransformacion } from './ListRequisicionTransformacion'
import { CreateRequisicionTransformacion } from './CreateRequisicionTransformacion'
import { IngresarProductoRequisicionTransformacion } from './IngresarProductoRequisicionTransformacion'

export const RouterRequisicionTransformacion = [
  {
    path: '',
    element: <ListRequisicionTransformacion />
  },
  {
    path: 'crear',
    element: <CreateRequisicionTransformacion />
  },
  {
    path: 'ingreso-productos/:idOrdTrans',
    element: <IngresarProductoRequisicionTransformacion/>
  }
]
