import React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import '../styles/style-modal.css'

export const RequisicionSeleccionDetalle = ({
  detalle,
  onClose,
  onCreateSalidas
}) => {
  return (
    <div
      className="modal"
      tabIndex="-1"
      role="dialog"
      style={{
        display: detalle !== null ? 'block' : 'none'
      }}
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Detalle de la requisicion</h5>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={onClose}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <Paper>
              <TableContainer>
                <Table sx={{ minWidth: 700 }} aria-label="customized table">
                  <TableHead>
                    <TableRow
                      sx={{
                        '& th': {
                          color: 'rgba(96, 96, 96)',
                          backgroundColor: '#f5f5f5'
                        }
                      }}
                    >
                      <TableCell align="left" width={150}>
                        <b>Materia Prima</b>
                      </TableCell>
                      <TableCell align="left" width={70}>
                        <b>Fecha de requerimiento</b>
                      </TableCell>
                      <TableCell align="left" width={70}>
                        <b>Cantidad</b>
                      </TableCell>
                      <TableCell align="left" width={70}>
                        <b>Estado</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>

                    {detalle.map((detalle, i) => (
                      <TableRow
                        key={detalle.id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 }
                        }}
                      >
                        <TableCell component="th" scope="detalle">
                          {detalle.nomProd}
                        </TableCell>
                        <TableCell align="left">
                          {detalle.fecCreReqSelDet}
                        </TableCell>
                        <TableCell align="left">
                          {detalle.canReqSelDet}
                        </TableCell>
                        <TableCell align="left">
                          <span
                            className={
                              detalle.idReqSelDetEst === 1
                                ? 'badge text-bg-danger p-2'
                                : detalle.idReqSelDetEst === 2
                                  ? 'badge text-bg-primary p-2'
                                  : detalle.idReqSelDetEst === 3
                                    ? 'badge text-bg-warning p-2'
                                    : 'badge text-bg-success p-2'
                            }
                          >
                            {detalle.desReqSelDetEst}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
