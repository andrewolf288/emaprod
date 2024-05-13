import { TableCell, TableRow } from '@mui/material'
import React from 'react'

export const RowOperacionEncuadreDetalle = ({ item }) => {
  const loteProduccion = item.idProdc ? `${item.codLotProd} - ${item.fecVenLotProd}` : 'Sin lote'
  return (
    <TableRow>
      <TableCell align='left'>{loteProduccion}</TableCell>
      <TableCell>{item.codProd2}</TableCell>
      <TableCell>{item.nomProd}</TableCell>
      <TableCell align='center'>{item.canStock}</TableCell>
      <TableCell align='center'>{item.canStockEnc}</TableCell>
      <TableCell align='center' >
        <span className={item.canVarEnc < 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
          {item.canVarEnc}
        </span>
      </TableCell>
    </TableRow>
  )
}
