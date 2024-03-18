import { IconButton, TableCell, TableRow } from '@mui/material'
import React from 'react'
import iconDevoluciones from '../../../../src/assets/icons/devoluciones.png'
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox'

export const RowRequisicionReproceso = ({ detalle }) => {
  return (
    <>
      <TableRow>
        <TableCell>{detalle.codLotProd}</TableCell>
        <TableCell>{detalle.fecVenLotProd}</TableCell>
        <TableCell>{detalle.nomProd}</TableCell>
        <TableCell align="center">{detalle.canLotProd}</TableCell>
        <TableCell align="center">
          <span
            className={
              detalle.fueComOpeRep === 0
                ? 'badge text-bg-danger'
                : 'badge text-bg-success'
            }
          >
            {detalle.fueComOpeRep === 0 ? 'Requerido' : 'Completo'}
          </span>
        </TableCell>
        <TableCell align="center">
          <span
            className={
              detalle.numero_requisicion_devolucion === 0
                ? 'badge text-bg-danger'
                : 'badge text-bg-success'
            }
          >
            {detalle.numero_requisicion_devolucion === 0
              ? 'No se generaron devoluciones'
              : 'Se generaron devoluciones'}
          </span>
        </TableCell>
        <TableCell>{detalle.fecCreOpeDevCalDet}</TableCell>
        <TableCell>
          <div className="btn-toolbar">
            <div
              className="btn btn-outline-secondary me-2"
              title="Devoluciones"
              onClick={() => {
                window.open(
                  `/produccion/requisicion-reproceso/devolucion/${detalle.id}`,
                  '_blank'
                )
              }}
            >
              <img
                alt="Boton devoluciones"
                src={iconDevoluciones}
                height={25}
                width={25}
              />
            </div>
            <IconButton
              aria-label="view"
              size="large"
              color="primary"
              onClick={() => {
                window.open(
                  `/produccion/requisicion-reproceso/reproceso/${detalle.id}`,
                  '_blank'
                )
              }}
            >
              <MoveToInboxIcon fontSize="medium" />
            </IconButton>
          </div>
        </TableCell>
      </TableRow>
    </>
  )
}
