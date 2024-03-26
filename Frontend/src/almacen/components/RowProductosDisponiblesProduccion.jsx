import React from 'react'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { TextField } from '@mui/material'
import FechaPicker from '../../../src/components/Fechas/FechaPicker'
import FechaPickerYear from '../../../src/components/Fechas/FechaPickerYear'
export const RowProductosDisponiblesProduccion = ({
  detalle,
  onChangeDetalle
}) => {
  return (
    <TableRow
      key={detalle.id}
      sx={{
        '&:last-child td, &:last-child th': { border: 0 }
      }}
    >
      <TableCell component="th" scope="detalle">
        {detalle.nomProd}
      </TableCell>
      <TableCell align="left">{detalle.simMed}</TableCell>
      <TableCell align="left">{detalle.desCla}</TableCell>
      <TableCell align="left">
        <FechaPicker
          onNewfecEntSto={(data) => {
            const event = {
              target: {
                value: data,
                name: 'fecEntSto'
              }
            }
            onChangeDetalle(event, detalle.idProdt)
          }}
          date={detalle.fecEntSto}
        />
      </TableCell>
      <TableCell align="left">
        <FechaPickerYear
          onNewfecEntSto={(data) => {
            const event = {
              target: {
                value: data,
                name: 'fecVenEntProdFin'
              }
            }
            onChangeDetalle(event, detalle.idProdt)
          }}
          date={detalle.fecVenEntProdFin}
        />
      </TableCell>
      <TableCell align="left">
        <TextField
          type="number"
          autoComplete="off"
          size="small"
          value={detalle.canProdFin}
          name="canProdFin"
          onChange={(e) => {
            onChangeDetalle(e, detalle.idProdt)
          }}
        />
      </TableCell>
    </TableRow>
  )
}
