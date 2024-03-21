import React, { useState } from 'react'
import FechaPickerMonth from '../../../components/Fechas/FechaPickerMonth'
import { FormatDateMYSQL } from '../../../utils/functions/FormatDate'
import { useRequisicionGeneralMateriales } from '../../hooks/requisicion-general-materiales/useRequisicionGeneralMateriales'
import { Link } from 'react-router-dom'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { RowRequisicionGeneralMateriales } from '../../components/requisicion-materiales/RowRequisicionGeneralMateriales'

export const ListRequisicionGeneralMateriales = () => {
  const { requisicionMateriales, traerDataRequisicionesGeneralesMateriales } = useRequisicionGeneralMateriales()
  // filtros
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
    traerDataRequisicionesGeneralesMateriales(body)
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
    traerDataRequisicionesGeneralesMateriales(body)
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
                to={'/produccion/requisicion-general/crear'}
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
                <TableCell align="left" width={50}>
                  <b>Código requisición</b>
                </TableCell>
                <TableCell align="center" width={100}>
                  <b>Estado</b>
                </TableCell>
                <TableCell align="center" width={200}>
                  <b>Motivo requisición</b>
                </TableCell>
                <TableCell align="center" width={70}>
                  <b>Área</b>
                </TableCell>
                <TableCell align="center" width={50}>
                  <b>Fecha requerimiento</b>
                </TableCell>
                <TableCell align="left" width={100}>
                  <b>Acciones</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                requisicionMateriales.map((item) => (
                  <RowRequisicionGeneralMateriales key={item.id} item={item}/>
                ))
              }
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  )
}
