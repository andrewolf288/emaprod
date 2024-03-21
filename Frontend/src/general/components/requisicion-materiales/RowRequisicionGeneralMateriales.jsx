import { TableCell, TableRow } from '@mui/material'
import React from 'react'
import { Link } from 'react-router-dom'

export const RowRequisicionGeneralMateriales = ({ item }) => {
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
        {/* BOTON DE VISTA DE DETALLE */}
        <Link
          to={`/produccion/requisicion-general/view/${item.id}`}
          className='btn btn-primary'
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-fill" viewBox="0 0 16 16">
            <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
            <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
          </svg>
        </Link>
      </TableCell>
    </TableRow>
  )
}
