import { TableCell, TableRow } from '@mui/material'
import React from 'react'
import iconDevoluciones from '../../../../src/assets/icons/devoluciones.png'

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
            {/* BOTON DE DEVOLUCION */}
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
            {/* BOTON DE REGISTRAR LOTES DESTINOS */}
            <button
              className="btn btn-primary"
              onClick={
                () => {
                  window.open(
                    `/produccion/requisicion-reproceso/reproceso/${detalle.id}`,
                    '_blank'
                  )
                }
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-down-square-fill" viewBox="0 0 16 16">
                <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm6.5 4.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5a.5.5 0 0 1 1 0"/>
              </svg>
            </button>
          </div>
        </TableCell>
      </TableRow>
    </>
  )
}
