import React from 'react'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

export const RowStockAlmacen = ({ detalle }) => {
  return (
    <TableRow>
      <TableCell>{detalle.codProd2}</TableCell>
      <TableCell>{detalle.nomProd}</TableCell>
      <TableCell>{detalle.desCla}</TableCell>
      <TableCell>{detalle.simMed}</TableCell>
      <TableCell>{detalle.nomAlm}</TableCell>
      <TableCell>{detalle.canStoDis}</TableCell>
    </TableRow>
  )
}
