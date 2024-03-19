import React from 'react'
import Button from '@mui/material/Button'
import * as XLSX from 'xlsx'

const ExportExcel = ({ exelData }) => {
  exelData = exelData.map((row) => ({
    codigo: row.codProd2,
    producto: row.nomProd,
    clase: row.desCla,
    simMed: row.simMed,
    almacen: row.nomAlm,
    total: row.canSto,
    cantidadDisponible: row.canStoDis
  }
  ))
  const exportExcel = async () => {
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(exelData, { origin: 1 })
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    XLSX.writeFile(workbook, 'DataSheet.xlsx')
  }
  return (
    <>
      <Button
        variant="contained"
        size="small"
        sx={{ width: 150, margin: 0.5, cursor: 'pointer' }}
        onClick={(e) => exportExcel()}
      >
        Export excel
      </Button>
    </>
  )
}
export default ExportExcel
