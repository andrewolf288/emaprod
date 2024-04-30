import React from 'react'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'

export const CardRetornoSalidaDetalle = ({ detalle, index }) => {
  return (
    <div className="card mt-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6>{`Detalle #${index + 1}`}</h6>
      </div>
      <div className="card-body">
        <TableContainer component={Paper}>
          <Table>
            <TableHead style={{ backgroundColor: '#F3DBB6' }}>
              <TableRow>
                <TableCell width={30} align="left">
                  <b>Ref.</b>
                </TableCell>
                <TableCell width={160} align="left">
                  <b>Presentacion</b>
                </TableCell>
                <TableCell width={30} align="center">
                  <b>Cantidad devuelta</b>
                </TableCell>
                <TableCell width={30} align="center">
                  <b>Estado</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{detalle.refProdt}</TableCell>
                <TableCell>{detalle.nomProd}</TableCell>
                <TableCell align="center">{detalle.canOpeDevDet}</TableCell>
                <TableCell align="center">
                  {detalle.fueComDet === 0
                    ? (
                      <span className={'badge text-bg-danger'}>Requerido</span>
                    )
                    : (
                      <span className={'badge text-bg-success'}>Completo</span>
                    )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  )
}
