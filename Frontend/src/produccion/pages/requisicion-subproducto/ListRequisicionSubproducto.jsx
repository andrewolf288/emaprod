import React, { useState } from 'react'
import FechaPickerMonth from '../../../components/Fechas/FechaPickerMonth'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useRequisicionSubProducto } from '../../hooks/requisicion-subproducto/useRequisicionSubProducto'
import { FormatDateMYSQL } from '../../../utils/functions/FormatDate'
import { Link } from 'react-router-dom'

export const ListRequisicionSubproducto = () => {
  const { requisicionSubproductos, traerDataRequisicionesSubproductos } = useRequisicionSubProducto()

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
    traerDataRequisicionesSubproductos(body)
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
    traerDataRequisicionesSubproductos(body)
  }

  return (
    <>
      <div className="container-fluid">
        {/* FILTROS Y EXPORTACION */}
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
        {/* TABLA DE RESULTADOS */}
        <div className="mt-4">
          <Paper>
            <TableContainer>
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
                    <TableCell align="left" width={80}>
                      <b>Lote</b>
                    </TableCell>

                    <TableCell align="left" width={70}>
                      <b>Codigo</b>
                    </TableCell>
                    <TableCell align="left" width={140}>
                      <b>Producto</b>
                    </TableCell>
                    <TableCell align="left" width={80}>
                      <b>Peso</b>
                    </TableCell>
                    <TableCell align="center" width={100}>
                      <b>Estado</b>
                    </TableCell>
                    <TableCell align="left" width={140}>
                      <b>Fecha requerido</b>
                    </TableCell>
                    <TableCell align="left" width={70}>
                      <b>Acciones</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requisicionSubproductos
                    .map((row, i) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 }
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {row.codLotProd}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {row.codReq}
                        </TableCell>
                        {/* <TableCell align="left">
                          {row.desProdTip ? row.desProdTip : "POLVOS"}
                        </TableCell> */}
                        <TableCell align="left">{row.nomProd}</TableCell>
                        <TableCell align="left">{row.canLotProd}</TableCell>
                        <TableCell align="center">
                          <span
                            className={
                              row.idReqEst === 1
                                ? 'badge text-bg-danger'
                                : row.idReqEst === 2
                                  ? 'badge text-bg-warning'
                                  : 'badge text-bg-success'
                            }
                          >
                            {row.desReqEst}
                          </span>
                        </TableCell>
                        <TableCell align="left">{row.fecPedReq}</TableCell>
                        <TableCell align="left">
                          <Link
                            to={`/produccion/requisicion-subproducto/ingresar-subproducto/${row.id}`}
                            className='btn btn-primary me-2'
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-down-square-fill" viewBox="0 0 16 16">
                              <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm6.5 4.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5a.5.5 0 0 1 1 0"/>
                            </svg>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </div>
      </div>
    </>
  )
}
