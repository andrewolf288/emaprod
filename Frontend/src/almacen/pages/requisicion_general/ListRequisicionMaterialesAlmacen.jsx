import React, { useState } from 'react'
import FechaPickerMonth from '../../../components/Fechas/FechaPickerMonth'
import { FormatDateMYSQL } from '../../../utils/functions/FormatDate'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useRequisicionMaterialesAlmacen } from '../../hooks/requisicion-materiales/useRequisicionMaterialesAlmacen'
import { RowRequisicionesGeneralMaterialesAlmacen } from '../../components/componentes-requisicion-materiales-almacen/RowRequisicionesGeneralMaterialesAlmacen'

export const ListRequisicionMaterialesAlmacen = () => {
  const {
    requisicionMateriales,
    traerDataRequisicionesGeneralesMateriales
  } = useRequisicionMaterialesAlmacen()
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
                  <strong>Código requisición</strong>
                </TableCell>
                <TableCell align="center" width={100}>
                  <strong>Estado Requisición</strong>
                </TableCell>
                <TableCell align="center" width={100}>
                  <strong>Devoluciones</strong>
                </TableCell>
                <TableCell align="center" width={200}>
                  <strong>Motivo requisición</strong>
                </TableCell>
                <TableCell align="center" width={70}>
                  <strong>Área</strong>
                </TableCell>
                <TableCell align="center" width={50}>
                  <strong>Fecha requerimiento</strong>
                </TableCell>
                <TableCell align="center" width={150}>
                  <strong>Acciones</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                requisicionMateriales.map((item) => (
                  <RowRequisicionesGeneralMaterialesAlmacen key={item.id}
                    item={item}
                  />
                ))
              }
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  )
}
