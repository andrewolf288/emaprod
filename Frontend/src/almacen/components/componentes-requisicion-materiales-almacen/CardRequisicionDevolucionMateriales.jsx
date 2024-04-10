import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'
import { RowDetalleRequisicionDevolucionMateriales } from './RowDetalleRequisicionDevolucionMateriales'

export const CardRequisicionDevolucionMateriales = ({
  requisicion,
  onDeleteRequisicionDevolucionDetalle,
  onUpdateRequisicionDevolucionDetalle,
  onCheckRequisicionDevolucionDetalle
}) => {
  const [mostrarDetalle, setMostrarDetalle] = useState(false)
  const toggleDetalle = () => {
    setMostrarDetalle(!mostrarDetalle)
  }

  return (
    <div className="card mt-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6>{`Detalle de Requisición: ${requisicion.correlativo}`}</h6>
        <button
          className="btn btn-link ms-auto" // Utiliza ms-auto para alinear a la derecha
          onClick={toggleDetalle}
        >
          {mostrarDetalle
            ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-caret-up-fill"
                viewBox="0 0 16 16"
              >
                <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z" />
              </svg>
            )
            : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-caret-down-fill"
                viewBox="0 0 16 16"
              >
                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
              </svg>
            )}
        </button>
      </div>
      <div className="card-body">
        <TableContainer component={Paper}>
          <Table>
            <TableHead style={{ backgroundColor: '#F3DBB6' }}>
              <TableRow>
                <TableCell>
                  <b>Correlativo</b>
                </TableCell>
                <TableCell>
                  <b>Fecha requerido</b>
                </TableCell>
                <TableCell>
                  <b>Fecha completado</b>
                </TableCell>
                <TableCell>
                  <b>Estado</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{requisicion.correlativo}</TableCell>
                <TableCell>{requisicion.fecCreReqDevMat}</TableCell>
                <TableCell>{requisicion.fecComReqDevMat ? requisicion.fecComReqDevMat : 'Aún no completado'}</TableCell>
                <TableCell>
                  <span
                    className={
                      requisicion.idReqEst === 1
                        ? 'badge text-bg-danger'
                        : requisicion.idReqEst === 2
                          ? 'badge text-bg-warning'
                          : 'badge text-bg-success'
                    }
                  >
                    {requisicion.desReqEst}
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        {mostrarDetalle && (
          <RowDetalleRequisicionDevolucionMateriales
            requisicion={requisicion}
            onUpdateDetalle={onUpdateRequisicionDevolucionDetalle}
            onDeleteDetalle={onDeleteRequisicionDevolucionDetalle}
            onCheckDetalle={onCheckRequisicionDevolucionDetalle}
          />
        )}
      </div>
    </div>
  )
}
