import { ExportacionParteEntrada } from './ExportacionParteEntrada'
import { ViewExportaciones } from './ViewExportaciones'

export const RouterExportacionesCosteo = [
  {
    path: '',
    element: <ViewExportaciones />
  },
  {
    path: 'exportacion-parte-entrada',
    element: <ExportacionParteEntrada />
  }
]
