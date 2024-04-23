import React, { useState } from 'react'
import { useRequisicionesEmpaquetadoPromocional } from '../../hooks/requisicion-empaquetado-promocional/useRequisicionesEmpaquetadoPromocional.'
import { FormatDateMYSQL } from '../../../utils/functions/FormatDate'
import FechaPickerMonth from '../../../components/Fechas/FechaPickerMonth'
import { Link } from 'react-router-dom'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { RowRequisicionEmpaquetadoPromocional } from '../../components/componentes-requisicion-empaquetado-promocional/RowRequisicionEmpaquetadoPromocional'

export const ListRequisicionEmpaquetadoPromocional = () => {
  const { requisicionesEmpaquetadoPromocional, traerInformacionRequisicionesEmpaquetadoPromocional } = useRequisicionesEmpaquetadoPromocional()

  const [formState, setformState] = useState({
    fechaInicio: FormatDateMYSQL(),
    fechaFin: FormatDateMYSQL()
  })

  // Filtros generales que hacen nuevas consultas
  const handleFechaInicioChange = (newfecEntSto) => {
    const dateFormat = newfecEntSto.split(' ')[0]
    setformState({
      ...formState,
      fechaInicio: dateFormat
    })

    // armamos el body
    const body = {
      ...formState,
      fechaInicio: dateFormat
    }
    traerInformacionRequisicionesEmpaquetadoPromocional(body)
  }

  const handleFechaFinChange = (newfecEntSto) => {
    const dateFormat = newfecEntSto.split(' ')[0]
    setformState({
      ...formState,
      fechaFin: dateFormat
    })

    // armamos el body
    const body = {
      ...formState,
      fechaFin: dateFormat
    }
    traerInformacionRequisicionesEmpaquetadoPromocional(body)
  }

  return (
    <>
      <div className="container-fluid">
        <div className="row d-flex mt-4">
          <div className="col-6">
            <div className="row">
              <div className="col-4">
                <FechaPickerMonth
                  onNewfecEntSto={handleFechaInicioChange}
                  label="Desde"
                />
              </div>
              <div className="col-4">
                <FechaPickerMonth
                  onNewfecEntSto={handleFechaFinChange}
                  label="Hasta"
                />
              </div>
            </div>
          </div>
          <div className="col-6 d-flex justify-content-end align-items-center">
            <div className="row me-4">
              <Link
                to={'crear'}
                className="btn btn-primary"
              >
                Crear requisición
              </Link>
            </div>
          </div>
        </div>
        {/* TABLA DE CONTENIDO */}
        <TableContainer component={Paper} className='mt-4'>
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
                <TableCell align="left" width={120} sx={{ fontWeight: 'bold' }}>
                  Correlativo
                </TableCell>
                <TableCell align="left" width={200} sx={{ fontWeight: 'bold' }}>
                  Producto
                </TableCell>
                <TableCell align="center" width={30} sx={{ fontWeight: 'bold' }}>
                  Medida
                </TableCell>
                <TableCell align="center" width={70} sx={{ fontWeight: 'bold' }}>
                  Cantidad
                </TableCell>
                <TableCell align="center" width={70} sx={{ fontWeight: 'bold' }}>
                  Fecha creación
                </TableCell>
                <TableCell align="center" width={70} sx={{ fontWeight: 'bold' }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                requisicionesEmpaquetadoPromocional.map((item) => (
                  <RowRequisicionEmpaquetadoPromocional key={item.id} item={item}/>
                ))
              }
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  )
}
