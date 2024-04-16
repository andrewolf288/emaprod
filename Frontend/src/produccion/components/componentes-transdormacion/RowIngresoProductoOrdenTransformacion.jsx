import { TableCell, TableRow } from '@mui/material'
import React from 'react'
import { mostrarMesYAnio } from '../../../utils/functions/FormatDate'

export const RowIngresoProductoOrdenTransformacion = ({ detalle }) => {
  return (
    <TableRow>
      <TableCell>{`${detalle.codLotProd} - ${mostrarMesYAnio(detalle.fecVenLotProd)}`}</TableCell>
      <TableCell>{detalle.nomProd}</TableCell>
      <TableCell>{detalle.simMed}</TableCell>
      <TableCell>{detalle.canProdIng}</TableCell>
      <TableCell>{detalle.fecProdIng}</TableCell>
    </TableRow>
  )
}
