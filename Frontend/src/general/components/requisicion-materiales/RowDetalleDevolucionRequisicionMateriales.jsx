import { IconButton, TableCell, TableRow } from '@mui/material'
import React from 'react'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import { DetalleDevolucionRequisicionDevolucion } from './DetalleDevolucionRequisicionDevolucion'

export const RowDetalleDevolucionRequisicionMateriales = (
  {
    detalle,
    onRenderPDF,
    index
  }
) => {
  return (
    <TableRow
      key={detalle.id}
      sx={{
        '&:last-child td, &:last-child th': { border: 0 }
      }}
    >
      <TableCell component="th" scope="detalle">
        {detalle.correlativo}
      </TableCell>
      <TableCell align="left">{detalle.fecCreReqDevMat}</TableCell>
      <TableCell align="left">
        {detalle.fecComReqDevMat ? detalle.fecComReqDevMat : 'Aun no completo' }
      </TableCell>
      <TableCell align="left">
        <span
          className={
            detalle.idReqEst === 1
              ? 'badge text-bg-danger'
              : detalle.idReqEst === 2
                ? 'badge text-bg-warning'
                : 'badge text-bg-success'
          }
        >
          {detalle.desReqEst}
        </span>
      </TableCell>
      <TableCell align="center">
        <div className="btn-toolbar">
          {
            <DetalleDevolucionRequisicionDevolucion
              correlativo={detalle.correlativo}
              detalleDevolucionProduccion={detalle}
            />
          }
          <IconButton
            aria-label="delete"
            size="large"
            onClick={() => {
              onRenderPDF(detalle, index)
            }}
            color="error"
          >
            <PictureAsPdfIcon fontSize="inherit" />
          </IconButton>
        </div>
      </TableCell>
    </TableRow>
  )
}
