import { TableCell, TableRow } from '@mui/material'
import React from 'react'
import { alertWarning } from '../../../utils/alerts/alertsCustoms'

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
        </div>
      </TableCell>
    </TableRow>
  )
}
