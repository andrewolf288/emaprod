import React from 'react'
import { ListReportesCalidad } from './ListReportesCalidad'
import { ReporteEntradaCalidad } from './ReporteEntradaCalidad'

export const RouterReportesCalidad = [
  {
    path: '',
    element: <ListReportesCalidad />
  },
  {
    path: 'reporte-entrada',
    element: <ReporteEntradaCalidad />
  }
]
