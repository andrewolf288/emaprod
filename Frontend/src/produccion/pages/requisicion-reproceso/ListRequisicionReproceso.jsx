import React, { useEffect, useState } from 'react'
import { FormatDateMYSQL } from '../../../utils/functions/FormatDate'
import { getRequisicionReproceso } from '../../helpers/requisicion-reproceso/getRequisicionReproceso'
import FechaPickerMonth from '../../../components/Fechas/FechaPickerMonth'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import { RowRequisicionReproceso } from '../../components/componentes-requisicion-reproceso/RowRequisicionReproceso'

export const ListRequisicionReproceso = () => {
  const [dataOperacionReproceso, setdataOperacionReproceso] = useState([])
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
    obtenerDataRequisicionReproceso(body)
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
    obtenerDataRequisicionReproceso(body)
  }

  const obtenerDataRequisicionReproceso = async (body = null) => {
    const resultPeticion = await getRequisicionReproceso(body)
    const { result, message_error, description_error } = resultPeticion
    console.log(resultPeticion)
    if (message_error.length === 0) {
      setdataOperacionReproceso(result)
    } else {
      alert(description_error)
    }
  }

  useEffect(() => {
    obtenerDataRequisicionReproceso()
  }, [])

  return (
    <>
      <div className="container-fluid">
        <div className="row d-flex mt-4 mb-4">
          <div className="col-9">
            <div className="row" style={{ border: '0px solid black' }}>
              <div
                className="col-2"
                style={{
                  border: '0px solid black',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <FechaPickerMonth
                  onNewfecEntSto={handleFechaInicioChange}
                  label="Desde"
                />
              </div>
              <div
                className="col-2"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <FechaPickerMonth
                  onNewfecEntSto={handleFechaFinChange}
                  label="Hasta"
                />
              </div>
            </div>
          </div>
        </div>
        {/* TABLA DE CONTENIDO */}
        <TableContainer component={Paper}>
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
                  <b>Lote origen</b>
                </TableCell>
                <TableCell align="left" width={100}>
                  <b>Fecha vencimiento</b>
                </TableCell>
                <TableCell align="center" width={200}>
                  <b>Producto</b>
                </TableCell>
                <TableCell align="center" width={70}>
                  <b>Cantidad</b>
                </TableCell>
                <TableCell align="center" width={50}>
                  <b>Estado</b>
                </TableCell>
                <TableCell align="center" width={50}>
                  <b>Devoluciones</b>
                </TableCell>
                <TableCell align="left" width={100}>
                  <b>Fecha creación</b>
                </TableCell>
                <TableCell align="center" width={150}>
                  <b>Acciones</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataOperacionReproceso.map((element) => (
                <RowRequisicionReproceso key={element.id} detalle={element} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  )
}
