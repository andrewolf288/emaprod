import React from 'react'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { DetalleAgregacionProduccion } from './DetalleAgregacionProduccion'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import { IconButton } from '@mui/material'

export const RowDetalleAgregacionLoteProduccion = ({
  detalle,
  correlativo,
  onRenderPDF,
  index
}) => {
  return (
    <TableRow
      key={detalle.id}
      sx={{
        '&:last-child td, &:last-child th': { border: 0 }
      }}
    >
      <TableCell component="th" scope="detalle">
        {correlativo}
      </TableCell>
      <TableCell align="left">{detalle.desProdAgrMot}</TableCell>
      <TableCell align="left">{detalle.nomProd}</TableCell>
      <TableCell align="left">{detalle.fecCreReqAgr}</TableCell>
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
            <DetalleAgregacionProduccion
              correlativo={correlativo}
              detalleAgregacionProduccion={detalle}
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
