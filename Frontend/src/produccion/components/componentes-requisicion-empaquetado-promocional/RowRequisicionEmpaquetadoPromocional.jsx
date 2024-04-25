import { TableCell, TableRow } from '@mui/material'
import React from 'react'
import { alertWarning } from '../../../utils/alerts/alertsCustoms'
import { Link } from 'react-router-dom'

export const RowRequisicionEmpaquetadoPromocional = ({ item }) => {
  return (
    <TableRow>
      <TableCell>{item.correlativo}</TableCell>
      <TableCell>{item.nomProd}</TableCell>
      <TableCell align='center'>{item.simMed}</TableCell>
      <TableCell align='center'>{item.canReqEmpPro}</TableCell>
      <TableCell>{item.fecCreReqEmpProm}</TableCell>
      <TableCell>
        <div className="btn-toolbar d-flex justify-content-center">
          <button
            className="btn btn-primary me-2"
            onClick={() => {
              alertWarning('Aún no disponible')
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-fill" viewBox="0 0 16 16">
              <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
              <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
            </svg>
          </button>
          <Link
            to={`ingresar-producto-promocional/${item.id}`}
            className='btn btn-warning me-2'
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-down-square-fill" viewBox="0 0 16 16">
              <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm6.5 4.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5a.5.5 0 0 1 1 0"/>
            </svg>
          </Link>
        </div>
      </TableCell>
    </TableRow>
  )
}
