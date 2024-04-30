import React from 'react'
import { RowRequisicionDetalleLoteProduccion } from '../../../almacen/components/componentes-lote-produccion/RowRequisicionDetalleLoteProduccion'
// IMPORTACIONES PARA TABLE MUI
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

export const RowRequisicionLoteProduccion = ({
  requisicion,
  onCreateSalidasStock,
  onUpdateDetalleRequisicion
}) => {
  return (
    <>
      <div className="card-body">
        {/* DETALLE DE MATERIA PRIMA */}
        <div
          className={`card ${
            requisicion.idAre === 5
              ? 'text-bg-success'
              : requisicion.idAre === 6
                ? 'text-bg-warning'
                : 'text-bg-primary'
          } d-flex`}
        >
          <h6 className="card-header">Detalle</h6>
          <div className="card-body">
            <Paper>
              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow
                      sx={{
                        '& th': {
                          color: 'rgba(96, 96, 96)',
                          backgroundColor: '#f5f5f5'
                        }
                      }}
                    >
                      <TableCell align="left" width={200}>
                        <b>Nombre</b>
                      </TableCell>
                      <TableCell align="left" width={120}>
                        <b>Estado</b>
                      </TableCell>
                      <TableCell align="left" width={20}>
                        <b>U.M</b>
                      </TableCell>
                      <TableCell align="left" width={150}>
                        <b>Cantidad</b>
                      </TableCell>
                      <TableCell align="left" width={150}>
                        <b>Acciones</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requisicion?.reqDet?.map((row, i) => {
                      return (
                        <RowRequisicionDetalleLoteProduccion
                          key={row.id}
                          detalle={{ ...row, idAre: requisicion.idAre }}
                          onCreateSalidasStock={onCreateSalidasStock}
                        />
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </div>
        </div>
      </div>
    </>
  )
}
