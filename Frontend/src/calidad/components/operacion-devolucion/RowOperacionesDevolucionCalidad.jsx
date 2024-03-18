import Visibility from '@mui/icons-material/Visibility'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import React from 'react'

export const RowOperacionesDevolucionCalidad = ({
  detalleDevolucionesCalidad
}) => {
  return (
    <div className="mt-2">
      <p className="text-bold">Detalle</p>
      <TableContainer component={Paper}>
        <Table>
          <TableHead style={{ backgroundColor: '#FEE7BC' }}>
            <TableRow>
              <TableCell>
                <b>#</b>
              </TableCell>
              <TableCell>
                <b>Producto</b>
              </TableCell>
              <TableCell>
                <b>Medida</b>
              </TableCell>
              <TableCell>
                <b>Cantidad</b>
              </TableCell>
              <TableCell>
                <b>Estado</b>
              </TableCell>
              <TableCell>
                <b>Acciones</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {detalleDevolucionesCalidad.map((detalle, index) => (
              <TableRow key={`${detalle.id} - ${index}`}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{detalle.nomProd}</TableCell>
                <TableCell>{detalle.simMed}</TableCell>
                <TableCell>{detalle.canOpeDevDet}</TableCell>
                <TableCell>
                  <span
                    className={
                      detalle.fueCom === 0
                        ? 'badge text-bg-danger'
                        : 'badge text-bg-success'
                    }
                  >
                    {detalle.fueCom === 0 ? 'Requerido' : 'Completo'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="btn-toolbar">
                    {detalle.fueCom === 1
                      ? (
                        <IconButton
                          aria-label="view"
                          size="large"
                          color="primary"
                          onClick={() => {
                            window.open(
                              `/calidad/operacion-devolucion/view/${detalle.id}`,
                              '_blank'
                            )
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      )
                      : (
                        <IconButton
                          aria-label="view"
                          size="large"
                          color="success"
                          onClick={() => {
                            window.open(
                              `/calidad/operacion-devolucion/create/${detalle.id}`,
                              '_blank'
                            )
                          }}
                        >
                          <AddCircleIcon />
                        </IconButton>
                      )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}
