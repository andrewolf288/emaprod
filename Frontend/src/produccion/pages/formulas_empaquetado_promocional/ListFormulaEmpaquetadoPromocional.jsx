import React, { useState } from 'react'
import { useFormulasEmpaquetadoPromocional } from '../../hooks/formula-empaquetado-promocional/useFormulasEmpaquetadoPromocional'
import { FormatDateMYSQL } from '../../../utils/functions/FormatDate'
import FechaPickerMonth from '../../../components/Fechas/FechaPickerMonth'
import { Link } from 'react-router-dom'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { RowFormulaEmpaquetadoPromocional } from '../../components/componentes-formula-empaquetado-promocional/RowFormulaEmpaquetadoPromocional'

export const ListFormulaEmpaquetadoPromocional = () => {
  const { formulasEmpaquetadoPromocional, traerInformacionFormulasEmpaquetadoPromocional } = useFormulasEmpaquetadoPromocional()

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
    traerInformacionFormulasEmpaquetadoPromocional(body)
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
    traerInformacionFormulasEmpaquetadoPromocional(body)
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
                Crear fórmula
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
                  Nombre fórmula
                </TableCell>
                <TableCell align="left" width={200} sx={{ fontWeight: 'bold' }}>
                  Producto
                </TableCell>
                <TableCell align="center" width={30}>
                  <b>Medida</b>
                </TableCell>
                <TableCell align="center" width={70}>
                  <b>Fecha creación</b>
                </TableCell>
                <TableCell align="center" width={70}>
                  <b>Fecha actualización</b>
                </TableCell>
                <TableCell align="center" width={70}>
                  <b>Acciones</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                formulasEmpaquetadoPromocional.map((item) => (
                  <RowFormulaEmpaquetadoPromocional key={item.id} item={item}/>
                ))
              }
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  )
}
