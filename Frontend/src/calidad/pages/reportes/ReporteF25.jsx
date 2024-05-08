import React from 'react'
import { useReporteFilter } from '../../hooks/reportes/useReporteFilter'

export const ReporteF25 = () => {
  const {
    submitDataFilterToExcel
  } = useReporteFilter()

  const exportExcel = () => {
    const URL = '/scripts/reportes/ReporteProducto.php'
    submitDataFilterToExcel(URL, {}, '512trazabilidadsalida.xlsx')
  }
  return (
    <button className='btn btn-primary' onClick={exportExcel}>
      EXPORT
    </button>
  )
}
