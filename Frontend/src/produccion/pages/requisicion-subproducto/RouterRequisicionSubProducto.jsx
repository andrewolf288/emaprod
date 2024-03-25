import React from 'react'
import { ListRequisicionSubproducto } from './ListRequisicionSubproducto'
import { IngresarRequisicionSubproducto } from './IngresarRequisicionSubproducto'

export const RouterRequisicionSubProducto = [
  {
    path: '',
    element: <ListRequisicionSubproducto />
  },
  {
    path: 'ingresar-subproducto/:idReq',
    element: <IngresarRequisicionSubproducto />
  }
]
