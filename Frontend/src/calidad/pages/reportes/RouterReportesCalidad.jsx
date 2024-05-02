import React from 'react'
import { ListReportesCalidad } from './ListReportesCalidad'
import { ReporteEntradaCalidad } from './ReporteEntradaCalidad'
import { ReporteF05 } from './ReporteF05'
import { ReporteF08 } from './ReporteF08'
import { ReporteF09 } from './ReporteF09'
import { ReporteF25 } from './ReporteF25'

export const RouterReportesCalidad = [
  {
    path: '',
    element: <ListReportesCalidad />
  },
  {
    path: 'reporte-entrada',
    element: <ReporteEntradaCalidad />
  },
  {
    path: 'reporteF05',
    element: <ReporteF05 />
  },
  {
    path: 'reporteF08',
    element: <ReporteF08 />
  },
  {
    path: 'reporteF09',
    element: <ReporteF09 />
  },
  {
    path: 'reporteF25',
    element: <ReporteF25 />
  }
]
