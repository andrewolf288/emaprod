import React from 'react'
import { ListRequisicionReproceso } from './ListRequisicionReproceso'
import { DevolucionRequisicionReproceso } from './DevolucionRequisicionReproceso'
import { LoteReprocesoRequisicionReproceso } from './LoteReprocesoRequisicionReproceso'

export const RouterRequisicionReproceso = [
  {
    path: '',
    element: <ListRequisicionReproceso />
  },
  {
    path: 'devolucion/:idOpeDevCalDet',
    element: <DevolucionRequisicionReproceso />
  },
  {
    path: 'reproceso/:idOpeDevCalDet',
    element: <LoteReprocesoRequisicionReproceso />
  }
]
