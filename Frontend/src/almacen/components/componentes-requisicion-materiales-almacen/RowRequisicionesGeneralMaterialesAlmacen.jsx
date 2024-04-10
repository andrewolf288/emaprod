import { TableCell, TableRow } from '@mui/material'
import React from 'react'
import { Link } from 'react-router-dom'

export const RowRequisicionesGeneralMaterialesAlmacen = ({ item }) => {
  return (
    <TableRow>
      <TableCell>
        {item.codReqMat}
      </TableCell>
      <TableCell align='center'>
        <span className={
          item.idReqEst === 1
            ? 'badge text-bg-danger'
            : item.idReqEst === 2
              ? 'badge text-bg-warning'
              : 'badge text-bg-success'
        }>
          {item.desReqEst}
        </span>
      </TableCell>
      <TableCell>
        {item.req_dev[0].requerido != 0 && (
          <span className="d-block mb-2 badge text-bg-danger p-2">
            {`Requerido: ${item.req_dev[0].requerido}`}
          </span>
        )}
        {item.req_dev[0].en_proceso != 0 && (
          <span className="d-block badge text-bg-warning p-2">
            {`En proceso: ${item.req_dev[0].en_proceso}`}
          </span>
        )}

        {item.req_dev[0].terminado != 0 && (
          <span className="d-block badge text-bg-success p-2">
            {`Completo: ${item.req_dev[0].terminado}`}
          </span>
        )}
        {item.req_dev[0].requerido == 0 &&
        item.req_dev[0].en_proceso == 0 &&
        item.req_dev[0].terminado == 0 && (
          <p>No hay requisiciones</p>
        )}
      </TableCell>
      <TableCell align='center'>
        {item.desMotReqMat}
      </TableCell>
      <TableCell align='center'>
        {item.desAre}
      </TableCell>
      <TableCell align='center'>
        {item.fecCreReqMat}
      </TableCell>
      <TableCell>
        <div className="btn-toolbar d-flex justify-content-center">
          {/* BOTON DE VISTA DE DETALLE */}
          <Link
            to={`atender-requisicion/${item.id}`}
            className='btn btn-primary me-2'
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-fill" viewBox="0 0 16 16">
              <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
              <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
            </svg>
          </Link>
        </div>
      </TableCell>
    </TableRow>
  )
}
